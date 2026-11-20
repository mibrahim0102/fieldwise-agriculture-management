const fs = require("fs");
const path = require("path");
const multer = require("multer");

const imageDirectory = path.join(__dirname, "../public/Images");
fs.mkdirSync(imageDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: imageDirectory,
  filename: (req, file, done) => {
    const extension = path.extname(file.originalname).toLowerCase();
    done(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const fileFilter = (req, file, done) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowed = ["image/jpeg", "image/png"].includes(file.mimetype) &&
    [".jpg", ".jpeg", ".png"].includes(extension);
  done(allowed ? null : new Error("Only JPG or PNG images are allowed"), allowed);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 1024 * 1024 } });
