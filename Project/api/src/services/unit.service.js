const { AppDataSource } = require("../data-source");
const Unit = require("../entities/unit.entity");

const unitRepository = AppDataSource.getRepository(Unit);

class UnitService {
    static async findAll() {
        return unitRepository.find();
    }
}

module.exports = { UnitService };