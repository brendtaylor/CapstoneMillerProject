const { Router } = require("express");
const router = Router();
const { getImageByKey, uploadImage } = require("../controllers/image.controller");
const multer = require("multer");

// Configure Multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// GET /api/images/:key
router.get("/:key", getImageByKey);

// POST /api/images/upload
// Expects multipart/form-data with 'imageFile', 'imageKey', and 'ticketId'
router.post("/upload", upload.single('imageFile'), uploadImage);

module.exports = router;