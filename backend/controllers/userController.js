const { Op, UniqueConstraintError, ValidationError } = require("sequelize");
const { User } = require("../models/associations");
const generateToken = require("../utils/generateToken");
const { ok, fail } = require("../utils/response");

const safeUser = (user) => ({
  id: user.id, fullName: user.fullName, username: user.username,
  email: user.email, role: user.role
});
const userInput = (body, allowPassword = true) => {
  const values = {};
  ["fullName", "username", "email", "role"].forEach((key) => {
    if (body[key] !== undefined) values[key] = body[key];
  });
  if (allowPassword && body.password !== undefined) values.password = body.password;
  return values;
};
const handleError = (error, res) => {
  if (error instanceof UniqueConstraintError) return fail(res, "Username or email already in use", 409);
  if (error instanceof ValidationError) return fail(res, error.errors[0]?.message || "Invalid user details", 400);
  return fail(res, "Something went wrong", 500);
};

exports.register = async (req, res) => {
  const { fullName, username, email, password } = req.body;
  if (![fullName, username, email, password].every((value) => typeof value === "string" && value.trim())) {
    return fail(res, "All fields are required");
  }
  if (password.length < 6) return fail(res, "Password must be at least 6 characters");
  try {
    const user = await User.create({ fullName: fullName.trim(), username: username.trim(), email: email.trim(), password, role: "manager" });
    return ok(res, safeUser(user), "Account created. Please log in.", 201);
  } catch (error) {
    return handleError(error, res);
  }
};

exports.login = async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;
  if (!identifier || !password) return fail(res, "Username and password are required");
  try {
    const user = await User.findOne({ where: { [Op.or]: [{ username: identifier }, { email: identifier }] } });
    if (!user || !(await user.matchPassword(password))) return fail(res, "Invalid username or password", 401);
    return res.json({
      succeeded: true,
      message: "Login successful",
      user: { ...safeUser(user), token: generateToken(user) }
    });
  } catch (error) {
    return handleError(error, res);
  }
};

exports.me = (req, res) => ok(res, safeUser(req.user));
exports.logout = (req, res) => ok(res, null, "Logged out");
exports.getAllUsers = async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ["password"] }, order: [["createdAt", "DESC"]] });
  return ok(res, { users });
};
exports.getUser = async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: { exclude: ["password"] } });
  return user ? ok(res, safeUser(user)) : fail(res, "User not found", 404);
};
exports.createUser = async (req, res) => {
  const values = userInput(req.body);
  if (!values.fullName || !values.username || !values.email || !values.password) return fail(res, "All fields are required");
  if (values.password.length < 6) return fail(res, "Password must be at least 6 characters");
  if (values.role && !["admin", "manager"].includes(values.role)) return fail(res, "Role must be admin or manager");
  try {
    const user = await User.create({ ...values, role: values.role || "manager" });
    return ok(res, safeUser(user), "User created", 201);
  } catch (error) {
    return handleError(error, res);
  }
};
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return fail(res, "User not found", 404);
    const values = userInput(req.body);
    if (values.role && !["admin", "manager"].includes(values.role)) return fail(res, "Role must be admin or manager");
    if (values.password && values.password.length < 6) return fail(res, "Password must be at least 6 characters");
    if (user.id === req.user.id && values.role && values.role !== "admin") {
      return fail(res, "You cannot demote your own account");
    }
    await user.update(values);
    return ok(res, safeUser(user), "User updated");
  } catch (error) {
    return handleError(error, res);
  }
};
exports.removeUser = async (req, res) => {
  if (req.params.id === req.user.id) return fail(res, "You cannot delete your own account");
  const count = await User.destroy({ where: { id: req.params.id } });
  return count ? ok(res, { id: req.params.id }, "User removed") : fail(res, "User not found", 404);
};
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return fail(res, "Current and new passwords are required");
  if (newPassword.length < 6) return fail(res, "Password must be at least 6 characters");
  const user = await User.findByPk(req.user.id);
  if (!(await user.matchPassword(currentPassword))) return fail(res, "Current password is incorrect", 401);
  user.password = newPassword;
  await user.save();
  return ok(res, null, "Password changed successfully");
};
