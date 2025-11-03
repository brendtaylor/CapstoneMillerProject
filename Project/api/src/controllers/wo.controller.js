const { WOService } = require("../services/wo.service");

class WOController {
    static async getAllWorkOrders(req, res){
        try{
            const workOrders = await WOService.findAll();
            res.status(200).json(workOrders);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { WOController };