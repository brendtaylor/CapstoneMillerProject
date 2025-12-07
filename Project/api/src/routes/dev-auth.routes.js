const { Router } = require("express");
const jwt = require("jsonwebtoken");
const router = Router();

// POST /api/dev/login
router.post("/login", (req, res) => {
    //  Ensure this only runs in dev!
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).send();
    }

    const { userId, name, role, email } = req.body;

    // Payload for JWT structure
    const userPayload = {
        id: userId || 1003,
        name: name || "Owen",
        email: email || "osartele@miller.inc",
        role: role || 2 
    };

    // Sign with secret
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: userPayload });
});

module.exports = router;