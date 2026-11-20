const express = require("express");
const controller = require("../controllers/cropController");
const { protect, authorize } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.use(protect);
router.get("/", asyncHandler(controller.getAll));
router.get("/:id", asyncHandler(controller.getOne));
router.post("/", asyncHandler(controller.create));
router.put("/:id", authorize("admin"), asyncHandler(controller.update));
router.delete("/:id", authorize("admin"), asyncHandler(controller.remove));
module.exports = router;
