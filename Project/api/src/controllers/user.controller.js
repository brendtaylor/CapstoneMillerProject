const { UserService } = require("../services/user.service");

class UserController {
    static async getAllUsers(req, res){
        try{
            const users = await UserService.findAll();
            res.status(200).json(users);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { UserController };