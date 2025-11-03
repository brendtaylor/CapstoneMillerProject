const { AppDataSource } = require("../data-source");
const Image = require("../entities/image.entity"); 
const { IsNull } = require("typeorm");

const imageRepository = AppDataSource.getRepository(Image); 

class ImageService {
    /**
     * Finds a single image by its unique ImageKey.
     * @param {string} key - The ImageKey to search for.
     */
    static async findOneByKey(key) {
        return imageRepository.findOneBy({
            imageKey: key
        });
    }
    /**
     * Saves a new image to the database.
     * We'll set ticketId to null for now since we aren't linking it to a ticket yet.
     */
    static async createImage(key, file) {
        // Create a new image object
        const newImage = imageRepository.create({
            imageKey: key,
            imageData: file.buffer, // The raw image data
            mimeType: file.mimetype, // e.g., "image/png"
            id: 0, // Set to 0 or undefined if your ID is auto-incrementing
            ticketId: null, // We aren't linking it to a ticket yet
        });

        // Save it to the database
        await imageRepository.save(newImage);
        return newImage;
    }
    static async findAll() {
        return imageRepository.find();
    }
}

module.exports = { ImageService };