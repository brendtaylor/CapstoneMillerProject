const { NonconService } = require("../services/manufact_noncon.service");

class NonconController {
    static async getAllNoncons(req, res){
        try{
            const noncons = await NonconService.findAll();
            res.status(200).json(noncons);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { NonconController };