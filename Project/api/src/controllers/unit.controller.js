const { UnitService } = require("../services/unit.service");

class UnitController {
    static async getAllDivsions(req, res){
        try{
            const units = await UnitService.findAll();
            res.status(200).json(units);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { UnitController };