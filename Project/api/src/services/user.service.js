const { AppDataSource } = require("../data-source");
const { User } = require("../entities/user.entity");

const userRepository = AppDataSource.getRepository(User);

class UserService {
    static async findAll() {
        return userRepository.find();
    }
}

module.exports = { UserService };