
const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Create uploads directory if it doesn't exist
const fs = require("fs");
const uploadDir = "upload";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });
  const imageUrl = `/upload/${req.file.filename}`;
  res.json({ imageUrl });
});

module.exports = router;
