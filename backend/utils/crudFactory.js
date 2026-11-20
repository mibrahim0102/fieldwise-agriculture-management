const { UniqueConstraintError, ValidationError, ForeignKeyConstraintError } = require("sequelize");
const { Activity } = require("../models/associations");
const { ok, fail } = require("./response");

const friendlyError = (error, entity) => {
  if (error instanceof UniqueConstraintError) {
    if (entity === "attendance") return "Attendance already marked for this worker on this date";
    if (entity === "buyer" || entity === "worker") return "This CNIC is already registered";
    return `${entity[0].toUpperCase()}${entity.slice(1)} already exists`;
  }
  if (error instanceof ValidationError) return error.errors[0]?.message || "Please check the submitted values";
  if (error instanceof ForeignKeyConstraintError) return "The selected related record does not exist";
  return error.message || "Something went wrong";
};

const logActivity = (req, action, entity, entityId) =>
  Activity.create({ user: req.user.username, action, entity, entityId });

const crudFactory = (Model, entity, options = {}) => ({
  getAll: async (req, res) => {
    const rows = await Model.findAll({
      include: options.include || [],
      order: [["createdAt", "DESC"]]
    });
    return ok(res, rows);
  },
  getOne: async (req, res) => {
    const row = await Model.findByPk(req.params.id, { include: options.include || [] });
    return row ? ok(res, row) : fail(res, `${entity} not found`, 404);
  },
  create: async (req, res) => {
    try {
      const row = await Model.create(req.body);
      await logActivity(req, "add", entity, row.id);
      return ok(res, row, `${entity} added`, 201);
    } catch (error) {
      const status = error instanceof UniqueConstraintError ? 409 :
        error instanceof ValidationError || error instanceof ForeignKeyConstraintError ? 400 : 500;
      return fail(res, friendlyError(error, entity), status);
    }
  },
  update: async (req, res) => {
    try {
      const row = await Model.findByPk(req.params.id);
      if (!row) return fail(res, `${entity} not found`, 404);
      await row.update(req.body);
      await logActivity(req, "edit", entity, row.id);
      return ok(res, row, `${entity} updated`);
    } catch (error) {
      const status = error instanceof UniqueConstraintError ? 409 :
        error instanceof ValidationError || error instanceof ForeignKeyConstraintError ? 400 : 500;
      return fail(res, friendlyError(error, entity), status);
    }
  },
  remove: async (req, res) => {
    const row = await Model.findByPk(req.params.id);
    if (!row) return fail(res, `${entity} not found`, 404);
    await row.destroy();
    await logActivity(req, "delete", entity, req.params.id);
    return ok(res, { id: req.params.id }, `${entity} removed`);
  }
});

module.exports = crudFactory;
module.exports.logActivity = logActivity;
module.exports.friendlyError = friendlyError;
