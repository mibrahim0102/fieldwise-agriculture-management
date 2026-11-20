const jwt = require("jsonwebtoken");
const { User } = require("../models/associations");
const { fail } = require("../utils/response");

exports.protect = async (req, res, next) => {
  const authorization = req.get("Authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return fail(res, "Not authorized, token missing", 401);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ["password"] } });
    if (!user) return fail(res, "User no longer exists", 401);
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return fail(res, "Invalid or expired token", 401);
    }
    return next(error);
  }
};

exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : fail(res, "You do not have permission for this action", 403);
