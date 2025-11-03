const { PartService } = require("../services/part.service");

class PartController {
    static async getAllParts(req, res){
        try{
            const parts = await PartService.findAll();
            res.status(200).json(parts);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { PartController };