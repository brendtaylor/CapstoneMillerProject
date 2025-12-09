/**
 * @file file.service.js
 * Service layer for handling File operations.
 * 
 * Manages database interactions for storing, retrieving, and deleting binary file data
 * associated with Quality Tickets.
 */

const { AppDataSource } = require("../data-source");
const File = require("../entities/file.entity"); 
const { IsNull } = require("typeorm");

const fileRepository = AppDataSource.getRepository(File); 

class FileService {
    /**
     * Finds a single File entity by its unique FileKey.
     * 
     * @param {string} key - The unique file key to search for.
     * @returns {Promise<File|null>} The found File entity or null.
     */
    static async findOneByKey(key) {
        return fileRepository.findOneBy({
            fileKey: key
        });
    }

    /**
     * Saves a new file to the database and links it to a ticket.
     * 
     * @param {string} key - The unique file key.
     * @param {Object} file - The file object (from Multer) containing buffer, mimetype, etc.
     * @param {string|number} ticketId - The ID of the ticket to associate this file with.
     * @returns {Promise<File>} The newly created File entity.
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

    /**
     * Retrieves all files in the database.
     * 
     * @returns {Promise<File[]>} An array of all File entities.
     */
    static async findAll() {
        return fileRepository.find();
    }

    /**
     * Retrieves all files associated with a specific Ticket ID.
     * Explicitly selects file metadata and binary data.
     * 
     * @param {string|number} ticketId - The ID of the ticket.
     * @returns {Promise<File[]>} An array of File entities linked to the ticket.
     */
    static async findByTicketId(ticketId) {
        return fileRepository.find({
            where: { ticket: { ticketId: Number(ticketId) } }, // use relation
            select: ["fileKey", "fileName", "mimeType", "fileData"],
            relations: ["ticket"],
        });
    }

    /**
     * Deletes a file by its unique FileKey.
     * 
     * @param {string} key - The FileKey of the file to delete.
     * @returns {Promise<DeleteResult>} - The result of the delete operation.
     */
    static async deleteFile(key) {
        // Delete the file entity where the fileKey matches
        return await fileRepository.delete({ fileKey: key });
    }
}

module.exports = { FileService };