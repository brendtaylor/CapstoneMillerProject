const { AppDataSource } = require("../data-source");
const Drawing = require("../entities/drawing.entity"); 

const drawingRepository = AppDataSource.getRepository(Drawing); 

class DrawingService {
    static async findAll() {
        return drawingRepository.find();
    }
}

module.exports = { DrawingService };