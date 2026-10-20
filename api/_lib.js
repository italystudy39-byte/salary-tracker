// Shared helpers for the API routes: database, passwords, sessions, responses.
// Files starting with "_" are not exposed as routes by Vercel.
import { neon } from "@neondatabase/serverless";
import { randomBytes, scrypt as scryptCb, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const SESSION_DAYS = 30;
const COOKIE = "sid";

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// ---------- Database ----------
let sql = null;
let schemaReady = null;

// Tests swap in another tagged-template SQL client.
export function setSql(client) { sql = client; schemaReady = null; }

function db() {
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new HttpError(500, "База данных не подключена: в настройках Vercel нет переменной DATABASE_URL.");
    sql = neon(url);
  }
  return sql;
}

// Tables are created on first use, so no manual SQL step is needed.
function ensureSchema() {
  if (!schemaReady) {
    const q = db();
    schemaReady = (async () => {
      await q`CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text NOT NULL UNIQUE,
        password_hash text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now())`;
      await q`CREATE TABLE IF NOT EXISTS sessions (
        token_hash text PRIMARY KEY,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at timestamptz NOT NULL)`;
      await q`CREATE TABLE IF NOT EXISTS user_data (
        user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        data jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now())`;
    })().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

export { db };

// ---------- Passwords ----------
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [kind, saltHex, keyHex] = String(stored || "").split("$");
  if (kind !== "scrypt" || !saltHex || !keyHex) {
    await scrypt(password, "timing-padding", 64);
    return false;
  }
  const expected = Buffer.from(keyHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

// ---------- Sessions ----------
const sha256 = (s) => createHash("sha256").update(s).digest("hex");

function readCookie(req, name) {
  const header = req.headers.cookie || "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

function isSecure(req) {
  return req.headers["x-forwarded-proto"] === "https" || process.env.VERCEL === "1";
}

export async function startSession(req, res, userId) {
  const token = randomBytes(32).toString("base64url");
  const q = db();
  await q`DELETE FROM sessions WHERE expires_at < now()`;
  await q`INSERT INTO sessions (token_hash, user_id, expires_at)
          VALUES (${sha256(token)}, ${userId}, now() + make_interval(days => ${SESSION_DAYS}))`;
  const maxAge = SESSION_DAYS * 24 * 3600;
  res.setHeader("Set-Cookie", `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure(req) ? "; Secure" : ""}`);
}

export async function endSession(req, res) {
  const token = readCookie(req, COOKIE);
  if (token) await db()`DELETE FROM sessions WHERE token_hash = ${sha256(token)}`;
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isSecure(req) ? "; Secure" : ""}`);
}

// Returns { id, email } for the signed-in user, or throws 401.
export async function requireUser(req) {
  const token = readCookie(req, COOKIE);
  if (token) {
    const rows = await db()`SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
                            WHERE s.token_hash = ${sha256(token)} AND s.expires_at > now()`;
    if (rows.length) return rows[0];
  }
  throw new HttpError(401, "Вход не выполнен.");
}

// ---------- Requests and responses ----------
export function readBody(req) {
  const type = String(req.headers["content-type"] || "");
  // JSON-only bodies: a plain cross-site form cannot send this content type.
  if (!type.includes("application/json")) throw new HttpError(415, "Ожидается JSON.");
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
  if (!body || typeof body !== "object") throw new HttpError(400, "Пустой запрос.");
  return body;
}

export function credentials(body) {
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new HttpError(400, "Введите корректную почту.");
  if (password.length < 8) throw new HttpError(400, "Пароль должен быть не короче 8 символов.");
  if (password.length > 200) throw new HttpError(400, "Пароль слишком длинный.");
  return { email, password };
}

export function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

// Wraps a handler: method check, schema setup, error to JSON.
export function route(methods, handler) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!methods.includes(req.method)) {
      res.setHeader("Allow", methods.join(", "));
      return send(res, 405, { error: "Метод не поддерживается." });
    }
    try {
      await ensureSchema();
      await handler(req, res);
    } catch (e) {
      if (e instanceof HttpError) return send(res, e.status, { error: e.message });
      if (e instanceof SyntaxError) return send(res, 400, { error: "Некорректный JSON." });
      console.error(e);
      send(res, 500, { error: "Ошибка сервера. Попробуйте ещё раз." });
    }
  };
}
