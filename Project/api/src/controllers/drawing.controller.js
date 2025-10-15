const { DrawingService } = require("../services/drawing.service");

class DrawingController {
    static async getAllDrawings(req, res){
        try{
            const drawings = await DrawingService.findAll();
            res.status(200).json(drawings);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { DrawingController };