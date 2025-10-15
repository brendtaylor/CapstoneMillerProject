const { SequenceService } = require("../services/sequence.service");

class SequenceController {
    static async getAllSequences(req, res){
        try{
            const sequences = await SequenceService.findAll();
            res.status(200).json(sequences);
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { SequenceController };