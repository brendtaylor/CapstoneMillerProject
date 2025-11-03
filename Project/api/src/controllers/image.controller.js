const { ImageService } = require("../services/image.service");

class ImageController {
    /**
     * Handles the GET /api/image/:key request.
     * Finds an image by its key and streams the data back.
     */
    static async getImageByKey(req, res){
        try{
            const key = req.params.key;
            const image = await ImageService.findOneByKey(key);

            if (image) {
                // 1. Set the correct content-type header
                res.set("Content-Type", image.mimeType);
                // 2. Send the raw image data as the response
                res.status(200).send(image.imageData);
            } else {
                res.status(404).json({ message: "Image not found." });
            }
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
    /**
     * Handles the POST /api/upload request.
     * Saves the image file and key to the database.
     */
    static async uploadImage(req, res) {
        try {
            const imageKey = req.body.imageKey;
            const fileBuffer = req.file.buffer; // From multer
            const mimeType = req.file.mimetype; // From multer

            if (!imageKey || !fileBuffer || !mimeType) {
                return res.status(400).json({ message: "Missing key, file, or file type." });
            }

            await ImageService.createImage(imageKey, fileBuffer, mimeType);
            res.status(201).json({ message: "File uploaded and saved to database." });

        } catch (error) {
            // Check for a unique key violation
            if (error.number === 2627 || error.number === 2601) { 
                return res.status(409).json({ message: "This key already exists. Please use a different key." });
            }
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { ImagesController };