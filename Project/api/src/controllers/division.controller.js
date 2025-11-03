const { DivisionService } = require("../services/division.service");

class DivisionController {
    static async getAllDivisions(req, res){
        try{
            const divisions = await DivisionService.findAll();
            res.status(200).json(divisions);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { DivisionController };