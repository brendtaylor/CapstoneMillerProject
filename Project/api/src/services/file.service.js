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

    // Get all files based on ticketId
    static async findByTicketId(ticketId) {
        return fileRepository.find({
            where: { ticket: { ticketId: Number(ticketId) } }, // use relation
            select: ["fileKey", "fileName", "mimeType", "fileData"],
            relations: ["ticket"],
        });
    }

    /**
     * Deletes a file by its unique FileKey.
     * @param {string} key - The FileKey of the file to delete.
     * @returns {Promise<DeleteResult>} - The result of the delete operation.
     */
    static async deleteFile(key) {
        // Delete the file entity where the fileKey matches
        return await fileRepository.delete({ fileKey: key });
    }
}

module.exports = { FileService };