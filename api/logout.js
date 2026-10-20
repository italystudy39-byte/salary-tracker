import { route, endSession, send } from "./_lib.js";

export default route(["POST"], async (req, res) => {
  await endSession(req, res);
  send(res, 200, { ok: true });
});
