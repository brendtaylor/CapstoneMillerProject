const { Router } = require("express");
const { AppDataSource } = require("../data-source");
const Ticket = require("../entities/ticket.entity");

const router = Router();

// GET /api/tickets - Get all tickets
router.get("/", async (req, res) => {
    try {
        const ticketRepository = AppDataSource.getRepository(Ticket);
        const tickets = await ticketRepository.find({
            relations: [
                "status",
                "initiator",
                "wo",
                "unit",
                "sequence",
                "division",
                "manNonCon",
                "drawingNum",
                "partNum",
            ],
        });
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/tickets/:id - Get a single ticket by its ID
router.get("/:id", async (req, res) => {
    try {
        const ticketRepository = AppDataSource.getRepository(Ticket);
        const ticketId = parseInt(req.params.id);
        
        const ticket = await ticketRepository.findOne({
            where: { ticketId },
            relations: [
                "status",
                "initiator",
                "wo",
                "unit",
                "sequence",
                "division",
                "manNonCon",
                "drawingNum",
                "partNum",
            ],
        });

        if (ticket) {
            res.status(200).json(ticket);
        } else {
            res.status(404).json({ message: `Ticket with ID ${ticketId} not found` });
        }
    } catch (error) {
        console.error(`Error fetching ticket with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// POST /api/tickets - Create a new ticket
router.post("/", async (req, res) => {
    try {
        const ticketRepository = AppDataSource.getRepository(Ticket);

        const newTicket = ticketRepository.create({
            description: req.body.description,
            status: req.body.status,
            initiator: req.body.initiator,
            wo: req.body.wo,
            unit: req.body.unit,
            sequence: req.body.sequence,
            division: req.body.division,
            manNonCon: req.body.manNonCon,
            drawingNum: req.body.drawingNum,
            partNum: req.body.partNum,
        });

        const savedTicket = await ticketRepository.save(newTicket);

        const completeTicket = await ticketRepository.findOne({
            where: { ticketId: savedTicket.ticketId },
            relations: ["status", "initiator", "wo", "unit", "sequence", "division", "manNonCon", "drawingNum", "partNum"],
        });

        res.status(201).json(completeTicket);

    } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /api/tickets/:id - Update an existing ticket
router.put("/:id", async (req, res) => {
    try {
        const ticketRepository = AppDataSource.getRepository(Ticket);
        const ticketId = parseInt(req.params.id);
        const ticket = await ticketRepository.findOneBy({ ticketId });

        if (!ticket) {
            return res.status(404).json({ message: `Ticket with ID ${ticketId} not found` });
        }

        // Merge the existing ticket with the new data from the request body
        ticketRepository.merge(ticket, req.body);
        await ticketRepository.save(ticket);

        
        // Re-fetching the ticket with all its relations to ensure the .json response includes updates
        const updatedTicketWithRelations = await ticketRepository.findOne({
            where: { ticketId },
            relations: ["status", "initiator", "wo", "unit", "sequence", "division", "manNonCon", "drawingNum", "partNum"],
        });

        res.status(200).json(updatedTicketWithRelations);
    } catch (error) {
        console.error(`Error updating ticket with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/tickets/:id - Delete a ticket
router.delete("/:id", async (req, res) => {
    try {
        const ticketRepository = AppDataSource.getRepository(Ticket);
        const ticketId = parseInt(req.params.id);
        const result = await ticketRepository.delete(ticketId);

        if (result.affected === 0) {
            return res.status(404).json({ message: `Ticket with ID ${ticketId} not found` });
        }

        // Return a 204 No Content status for a successful deletion
        res.status(204).send();
    } catch (error) {
        console.error(`Error deleting ticket with ID ${req.params.id}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;

