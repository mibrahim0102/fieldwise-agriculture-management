const express = require("express");
const controller = require("../controllers/activityController");
const { protect, authorize } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.use(protect);
router.get("/", asyncHandler(controller.getAll));
router.delete("/:id", authorize("admin"), asyncHandler(controller.remove));
module.exports = router;
