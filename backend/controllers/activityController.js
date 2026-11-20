const { Activity } = require("../models/associations");
const { ok, fail } = require("../utils/response");

exports.getAll = async (req, res) => {
  const requestedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 100;
  return ok(res, await Activity.findAll({ order: [["timestamp", "DESC"]], limit }));
};
exports.remove = async (req, res) => {
  const count = await Activity.destroy({ where: { id: req.params.id } });
  return count ? ok(res, { id: req.params.id }, "Activity removed") : fail(res, "Activity not found", 404);
};
