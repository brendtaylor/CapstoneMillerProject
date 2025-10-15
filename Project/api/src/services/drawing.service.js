const { AppDataSource } = require("../data-source");

class DrawingService {
    static async findAll() {
        const drawingRepository = AppDataSource.getRepository("Drawing");
        return drawingRepository.find();
    }
}

module.exports = { DrawingService };