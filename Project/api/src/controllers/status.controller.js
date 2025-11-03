const { StatusService } = require("../services/status.service");

class StatusController {
    static async getAllStatuses(req, res){
        try{
            const statuses = await StatusService.findAll();
            res.status(200).json(statuses);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { StatusController };