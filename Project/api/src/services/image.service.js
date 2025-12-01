const { AppDataSource } = require("../data-source");
const logger = require("../../logger");

class ImageService {
    constructor() {
        this.imageRepository = AppDataSource.getRepository("Image");
        logger.info("ImageService initialized");
    }

    /**
     * Finds a single image by its unique ImageKey.
     */
    async findOneByKey(key) {
        return await this.imageRepository.findOneBy({
            imageKey: key
        });
    }

    /**
     * Saves a new image to the database and links it to a ticket.
     */
    async createImage(key, fileBuffer, mimeType, ticketId) {
        logger.info(`Creating image ${key} for Ticket ID: ${ticketId}`);
        
        const newImage = this.imageRepository.create({
            imageKey: key,
            imageData: fileBuffer,
            mimeType: mimeType,
            ticketId: parseInt(ticketId) // Ensure it's an integer
        });

        await this.imageRepository.save(newImage);
        return newImage;
    }
    
    /**
     * Optional: Helper to get all images for a specific ticket
     */
    async getImagesByTicketId(ticketId) {
        return await this.imageRepository.find({
            where: { ticketId: parseInt(ticketId) },
            select: ["imageKey", "mimeType", "id"] // Don't fetch huge blob data for lists
        });
    }
}

module.exports = new ImageService();