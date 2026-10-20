import { route, readBody, credentials, verifyPassword, startSession, send, db, HttpError } from "./_lib.js";

export default route(["POST"], async (req, res) => {
  const { email, password } = credentials(readBody(req));
  const rows = await db()`SELECT id, password_hash FROM users WHERE email = ${email}`;
  const ok = await verifyPassword(password, rows[0] && rows[0].password_hash);
  if (!rows.length || !ok) throw new HttpError(401, "Неверная почта или пароль.");
  await startSession(req, res, rows[0].id);
  send(res, 200, { email });
});
