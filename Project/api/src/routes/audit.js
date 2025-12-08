const { Router } = require("express");
const { AppDataSource } = require("../data-source");
const AuditLog = require("../entities/audit-log.entity.js");
const User = require("../entities/user.entity.js");
const authorize = require("../middleware/authorize");
const { authenticateToken } = require("../middleware/auth.middleware");

const router = Router();

// GET /api/audit - fetch audit logs (Admin only)
router.get("/", authenticateToken, authorize(['Admin']), async (req, res) => {
  try {
    const auditRepo = AppDataSource.getRepository("AuditLog");
    const search = req.query.search?.toLowerCase();

    let logs;

    if (search) {
      logs = await auditRepo
        .createQueryBuilder("log")
        .where("LOWER(log.action) LIKE :search", { search: `%${search}%` })
        .orWhere("CAST(log.woId AS VARCHAR) LIKE :search", { search: `%${search}%` })
        .orderBy("log.timestamp", "DESC")
        .take(50)
        .getMany();
    } else {
      logs = await auditRepo.find({
        order: { logId: "DESC" },
        take: 50
      });
    }

    res.json(logs);
  } catch (err) {
    console.error("Audit fetch failed:", err.message, err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});



// POST /api/audit - record a new audit entry
router.post("/", authenticateToken, async (req, res) => {
  const { userId, ticketId, action, timestamp, woId } = req.body;

  try {
    const auditRepo = AppDataSource.getRepository("AuditLog");
    const userRepo = AppDataSource.getRepository("User");

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const newLog = auditRepo.create({
      userId,
      userRole: user.role,          // snapshot role
      ticketId,
      woId,
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
