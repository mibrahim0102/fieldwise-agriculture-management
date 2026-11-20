const multer = require("multer");
const { fail } = require("../utils/response");

exports.notFound = (req, res) => fail(res, "Route not found", 404);

exports.errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return fail(res, "Photo must be 1 MB or smaller", 400);
  }
  if (error.message === "Only JPG or PNG images are allowed") {
    return fail(res, error.message, 400);
  }
  console.error(error);
  return fail(res, "Something went wrong", error.status || 500);
};
