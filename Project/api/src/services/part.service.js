const { AppDataSource } = require("../data-source");
const { Part } = require("../entities/part.entity");

const partRepository = AppDataSource.getRepository(Part);

class PartService {
    static async findAll() {
        return partRepository.find();
    }
}

module.exports = { PartService };