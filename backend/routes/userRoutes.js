const express = require("express");
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { succeeded: false, message: "Too many attempts, try later", data: null }
});

router.post("/register", asyncHandler(controller.register));
router.post("/login", loginLimiter, asyncHandler(controller.login));
router.post("/logout", protect, asyncHandler(controller.logout));
router.get("/me", protect, asyncHandler(controller.me));
router.put("/change-password", protect, asyncHandler(controller.changePassword));
router.get("/", protect, authorize("admin"), asyncHandler(controller.getAllUsers));
router.post("/", protect, authorize("admin"), asyncHandler(controller.createUser));
router.get("/:id", protect, authorize("admin"), asyncHandler(controller.getUser));
router.put("/:id", protect, authorize("admin"), asyncHandler(controller.updateUser));
router.delete("/:id", protect, authorize("admin"), asyncHandler(controller.removeUser));

module.exports = router;
