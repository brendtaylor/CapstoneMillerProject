const { AppDataSource } = require("../data-source");
const { Sequence } = require("../entities/sequence.entity");

const sequenceRepository = AppDataSource.getRepository(Sequence);

class SequenceService {
    static async findAll() {
        return sequenceRepository.find();
    }
}

module.exports = { SequenceService };