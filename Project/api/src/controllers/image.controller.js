const imageService = require("../services/image.service");

// Controller to handle getting an image
async function getImageByKey(req, res) {
    try {
        const key = req.params.key;
        const image = await imageService.findOneByKey(key);

        if (image) {
            res.set("Content-Type", image.mimeType);
            res.status(200).send(image.imageData);
        } else {
            res.status(404).json({ message: "Image not found." });
        }
    } catch (error) {
        console.error("Error retrieving image:", error);
        res.status(500).json({ message: error.message });
    }
}

// Controller to handle uploading an image
async function uploadImage(req, res) {
    try {
        // Multer puts the file in req.file and text fields in req.body
        const { imageKey, ticketId } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        if (!imageKey || !ticketId) {
            return res.status(400).json({ message: "Missing imageKey or ticketId." });
        }

        await imageService.createImage(imageKey, fileBuffer, mimeType, ticketId);
        
        res.status(201).json({ message: "Image uploaded successfully." });

    } catch (error) {
        console.error("Error uploading image:", error);
        // Check for SQL Server unique constraint violation
        if (error.number === 2627 || error.number === 2601) { 
            return res.status(409).json({ message: "This key already exists." });
        }
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getImageByKey,
    uploadImage
};