import { route, requireUser, readBody, send, db, HttpError } from "./_lib.js";

const MAX_BYTES = 2 * 1024 * 1024;

// GET returns the user's tracker state (null for a new account); PUT replaces it.
export default route(["GET", "PUT"], async (req, res) => {
  const user = await requireUser(req);
  if (req.method === "GET") {
    const rows = await db()`SELECT data, updated_at FROM user_data WHERE user_id = ${user.id}`;
    return send(res, 200, rows.length ? { data: rows[0].data, updatedAt: rows[0].updated_at } : { data: null, updatedAt: null });
  }
  const body = readBody(req);
  const data = body.data;
  if (!data || typeof data !== "object" || !Array.isArray(data.entries) || !data.categories) {
    throw new HttpError(400, "Некорректные данные трекера.");
  }
  const json = JSON.stringify(data);
  if (json.length > MAX_BYTES) throw new HttpError(413, "Слишком много данных для одного аккаунта.");
  const rows = await db()`INSERT INTO user_data (user_id, data, updated_at) VALUES (${user.id}, ${json}::jsonb, now())
                          ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
                          RETURNING updated_at`;
  send(res, 200, { updatedAt: rows[0].updated_at });
});
