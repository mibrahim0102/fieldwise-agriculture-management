const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const asyncHandler = require("./asyncHandler");

module.exports = (controller) => {
  const router = express.Router();
  router.use(protect);
  router.get("/", asyncHandler(controller.getAll));
  router.get("/:id", asyncHandler(controller.getOne));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id", authorize("admin"), asyncHandler(controller.update));
  router.delete("/:id", authorize("admin"), asyncHandler(controller.remove));
  return router;
};
