const { AppDataSource } = require("../data-source");
const Status = require("../entities/status.entity");

const statusRepository = AppDataSource.getRepository(Status);

class StatusService {
    static async findAll() {
        return statusRepository.find();
    }
}

module.exports = { StatusService };