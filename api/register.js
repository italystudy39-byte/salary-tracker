import { route, readBody, credentials, hashPassword, startSession, send, db, HttpError } from "./_lib.js";

export default route(["POST"], async (req, res) => {
  const { email, password } = credentials(readBody(req));
  const hash = await hashPassword(password);
  const rows = await db()`INSERT INTO users (email, password_hash) VALUES (${email}, ${hash})
                          ON CONFLICT (email) DO NOTHING RETURNING id`;
  if (!rows.length) throw new HttpError(409, "Аккаунт с такой почтой уже есть. Войдите в него.");
  await startSession(req, res, rows[0].id);
  send(res, 201, { email });
});
