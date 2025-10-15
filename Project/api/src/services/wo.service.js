const { AppDataSource } = require("../data-source");
const { WO } = require("../entities/wo.entity");

const woRepository = AppDataSource.getRepository(WO);

class WOService {
    static async findAll() {
        return woRepository.find();
    }
}

module.exports = { WOService };