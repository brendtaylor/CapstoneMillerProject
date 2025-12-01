const { FileService } = require("../services/file.service");

class FileController {
    /**
     * Handles the GET /api/file/:key request.
     * Finds an image by its key and streams the data back.
     */
    static async getFileByKey(req, res){
        try{
            const key = req.params.key;
            const file = await FileService.findOneByKey(key);

            if (file) {
                // 1. Set the correct content-type header
                res.set("Content-Type", file.mimeType);
                // 2. Send the raw image data as the response
                res.status(200).send(file.fileData);
            } else {
                res.status(404).json({ message: "File not found." });
            }
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
    /**
     * Handles the POST /api/upload request.
     * Saves the image file and key to the database.
     */
    static async uploadFile(req, res) {
        try {
            const { fileKey, ticketId } = req.body;
            
            // Check if file exists before accessing buffer
            if (!req.file) {
                 return res.status(400).json({ message: "No file uploaded." });
            }

            if (!fileKey || !ticketId) {
                return res.status(400).json({ message: "Missing fileKey or ticketId." });
            }

            await FileService.createFile(fileKey, req.file, ticketId);
            
            res.status(201).json({ message: "File uploaded and linked to ticket successfully." });

        } catch (error) {
            // Check for a unique key violation
            if (error.number === 2627 || error.number === 2601) { 
                return res.status(409).json({ message: "This file key already exists. Please use a different key." });
            }
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { FileController};
