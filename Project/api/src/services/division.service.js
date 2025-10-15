const { AppDataSource } = require("../data-source"); // Adjust path if needed

class DivisionService {
  static async findAll() {
    // Get the repository using the ENTITY NAME STRING from your schema
    const divisionRepository = AppDataSource.getRepository("Division");

    // Fetch all records
    return divisionRepository.find();
  }
}

module.exports = { DivisionService };