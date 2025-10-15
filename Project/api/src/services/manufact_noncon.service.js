const { AppDataSource } = require("../data-source");
const Noncon  = require("../entities/manufact_noncon.entity");

const nonconRepository = AppDataSource.getRepository(Noncon);

class NonconService {
    static async findAll() {
        return nonconRepository.find();
    }
}

module.exports = { NonconService };