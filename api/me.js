import { route, requireUser, send } from "./_lib.js";

export default route(["GET"], async (req, res) => {
  const user = await requireUser(req);
  send(res, 200, { email: user.email });
});
