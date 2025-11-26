const { Router } = require("express");
const { AppDataSource } = require("../data-source");
const AuditLog = require("../entities/audit-log.entity.js");
const Ticket = require("../entities/ticket.entity.js");

const router = Router();

// GET /api/audit - fetch audit logs
router.get("/audit", async (req, res) => {
  try {
    const auditRepo = AppDataSource.getRepository("AuditLog");

    // Fetch latest logs, include ticket relation if you want
    const logs = await auditRepo.find({
      order: { logId: "DESC" },
      take: 50, // limit rows for safety
      relations: ["ticket"] // if you want joined ticket info
    });

    res.json(logs);
  } catch (err) {
    console.error("Audit fetch failed:", err.message, err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// POST /api/audit - record a new audit entry
router.post("/audit", async (req, res) => {
  const { userId, ticketId, action, timestamp } = req.body;

  try {
    const auditRepo = AppDataSource.getRepository("AuditLog");
    const ticketRepo = AppDataSource.getRepository("Ticket");

    // Look up the ticket to get its Work Order
    const ticket = await ticketRepo.findOne({
      where: { ticketId },
      relations: ["wo"]
    });

    if (!ticket || !ticket.wo) {
      return res.status(400).json({ error: "Ticket or Work Order not found" });
    }

    const newLog = auditRepo.create({
      userId,
      ticketId,
      woId: ticket.wo.woId,   // auto-populated from relation
      action,
      timestamp: new Date(timestamp)
    });

    await auditRepo.save(newLog);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Audit insert failed:", err.message, err);
    res.status(500).json({ error: "Failed to save audit log" });
  }
});

module.exports = router;
