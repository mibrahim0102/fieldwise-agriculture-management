const { Op, UniqueConstraintError, ValidationError } = require("sequelize");
const { Buyer, Crop } = require("../models/associations");
const { ok, fail } = require("../utils/response");
const { logActivity } = require("../utils/crudFactory");

const validateBuyer = (body) => {
  if (!/^[A-Za-z ]{3,}$/.test(body.name || "")) return "Name must be letters and spaces, minimum 3 characters";
  if (!/^\d{5}-\d{7}-\d$/.test(body.cnic || "")) return "CNIC must be in the format 12345-1234567-1";
  if (!body.cropId) return "Crop is required";
  if (!Number.isFinite(Number(body.quantity)) || Number(body.quantity) <= 0) return "Quantity must be greater than 0";
  if (!body.date) return "Date is required";
  return null;
};
const stockAvailable = async (cropId, excludedBuyerId) => {
  const crop = await Crop.findByPk(cropId);
  if (!crop) return { error: "Crop not found", status: 404 };
  const where = { cropId };
  if (excludedBuyerId) where.id = { [Op.ne]: excludedBuyerId };
  const sold = Number((await Buyer.sum("quantity", { where })) || 0);
  return { crop, available: Number(crop.harvestQty) - sold };
};
const responseForError = (res, error) => {
  if (error instanceof UniqueConstraintError) return fail(res, "This CNIC is already registered", 409);
  if (error instanceof ValidationError) return fail(res, error.errors[0]?.message || "Invalid buyer details", 400);
  return fail(res, "Something went wrong", 500);
};

exports.getAll = async (req, res) =>
  ok(res, await Buyer.findAll({ include: [Crop], order: [["createdAt", "DESC"]] }));
exports.getOne = async (req, res) => {
  const buyer = await Buyer.findByPk(req.params.id, { include: [Crop] });
  return buyer ? ok(res, buyer) : fail(res, "Buyer not found", 404);
};
exports.create = async (req, res) => {
  const validation = validateBuyer(req.body);
  if (validation) return fail(res, validation);
  try {
    if (await Buyer.findOne({ where: { cnic: req.body.cnic } })) {
      return fail(res, "This CNIC is already registered", 409);
    }
    const stock = await stockAvailable(req.body.cropId);
    if (stock.error) return fail(res, stock.error, stock.status);
    if (Number(req.body.quantity) > stock.available) return fail(res, `Only ${stock.available} available in stock`);
    const buyer = await Buyer.create(req.body);
    await logActivity(req, "add", "buyer", buyer.id);
    return ok(res, buyer, "Buyer saved", 201);
  } catch (error) {
    return responseForError(res, error);
  }
};
exports.update = async (req, res) => {
  const buyer = await Buyer.findByPk(req.params.id);
  if (!buyer) return fail(res, "Buyer not found", 404);
  const body = { ...buyer.toJSON(), ...req.body };
  const validation = validateBuyer(body);
  if (validation) return fail(res, validation);
  try {
    const duplicate = await Buyer.findOne({
      where: { cnic: body.cnic, id: { [Op.ne]: buyer.id } }
    });
    if (duplicate) return fail(res, "This CNIC is already registered", 409);
    const stock = await stockAvailable(body.cropId, buyer.id);
    if (stock.error) return fail(res, stock.error, stock.status);
    if (Number(body.quantity) > stock.available) return fail(res, `Only ${stock.available} available in stock`);
    await buyer.update({
      name: body.name, cnic: body.cnic, cropId: body.cropId,
      quantity: body.quantity, date: body.date
    });
    await logActivity(req, "edit", "buyer", buyer.id);
    return ok(res, buyer, "Buyer updated");
  } catch (error) {
    return responseForError(res, error);
  }
};
exports.remove = async (req, res) => {
  const buyer = await Buyer.findByPk(req.params.id);
  if (!buyer) return fail(res, "Buyer not found", 404);
  await buyer.destroy();
  await logActivity(req, "delete", "buyer", buyer.id);
  return ok(res, { id: buyer.id }, "Buyer removed");
};
