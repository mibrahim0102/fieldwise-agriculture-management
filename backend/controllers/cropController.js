const { Op } = require("sequelize");
const { Crop } = require("../models/associations");
const { ok, fail } = require("../utils/response");
const { logActivity, friendlyError } = require("../utils/crudFactory");

const allowedSorts = new Set(["name", "field", "plantingDate", "cuttingDate", "healthScore", "status", "createdAt"]);

exports.getAll = async (req, res) => {
  const { status, search } = req.query;
  const sort = allowedSorts.has(req.query.sort) ? req.query.sort : "createdAt";
  const order = String(req.query.order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const where = {};
  if (status) where.status = status;
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  return ok(res, await Crop.findAll({ where, order: [[sort, order]] }));
};

exports.getOne = async (req, res) => {
  const crop = await Crop.findByPk(req.params.id);
  return crop ? ok(res, crop) : fail(res, "Crop not found", 404);
};

exports.create = async (req, res) => {
  try {
    const crop = await Crop.create({ ...req.body, createdBy: req.user.id });
    await logActivity(req, "add", "crop", crop.id);
    return ok(res, crop, "Crop added", 201);
  } catch (error) {
    return fail(res, friendlyError(error, "crop"), error.name === "SequelizeUniqueConstraintError" ? 409 : 400);
  }
};

exports.update = async (req, res) => {
  try {
    const crop = await Crop.findByPk(req.params.id);
    if (!crop) return fail(res, "Crop not found", 404);
    await crop.update(req.body);
    await logActivity(req, "edit", "crop", crop.id);
    return ok(res, crop, "Crop updated");
  } catch (error) {
    return fail(res, friendlyError(error, "crop"), error.name === "SequelizeUniqueConstraintError" ? 409 : 400);
  }
};

exports.remove = async (req, res) => {
  const crop = await Crop.findByPk(req.params.id);
  if (!crop) return fail(res, "Crop not found", 404);
  await crop.destroy();
  await logActivity(req, "delete", "crop", req.params.id);
  return ok(res, { id: req.params.id }, "Crop removed");
};
