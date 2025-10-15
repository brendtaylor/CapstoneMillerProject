const Division = require("../entities/division.entity"); 
const { AppDataSource } = require("../data-source");

// Pass the imported entity object directly
const divisionRepository = AppDataSource.getRepository(Division); 

class DivisionService {
    static async findAll() {
        return divisionRepository.find();
    }
}

module.exports = { DivisionService };