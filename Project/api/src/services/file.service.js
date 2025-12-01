const { AppDataSource } = require("../data-source");
const File = require("../entities/file.entity"); 
const { IsNull } = require("typeorm");

const fileRepository = AppDataSource.getRepository(File); 

class FileService {
    /**
     * Finds a single File by its unique FileKey.
     * @param {string} key - The File to search for.
     */
    static async findOneByKey(key) {
        return fileRepository.findOneBy({
            fileKey: key
        });
    }
    /**
     * Saves a new file to the database.
     * We'll set ticketId to null for now since we aren't linking it to a ticket yet.
     */
    static async createFile(key, file, ticketId) {
        // Create a new file object
        const newFile = fileRepository.create({
            fileKey: key,
            fileName: file.originalname,
            fileData: file.buffer, 
            mimeType: file.mimetype, 
            id: undefined, // Let the database auto-generate the ID
            ticket: { ticketId: parseInt(ticketId) }, // Link to the ticket
        });

        // Save it to the database
        await fileRepository.save(newFile);
        return newFile;
    }
    static async findAll() {
        return fileRepository.find();
    }
}

module.exports = { FileService };
