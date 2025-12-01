const express = require("express");
const router = express.Router();
const { FileController } = require ("../controllers/image.controller");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Route to get an image by its key
router.get("/:key", FileController.getFileByKey);

// Route to upload a new image
// 'imageFile' must match the key in the FormData from the React app
router.post("/upload", upload.single('imageFile'), FileController.uploadFile);

module.exports = router;
