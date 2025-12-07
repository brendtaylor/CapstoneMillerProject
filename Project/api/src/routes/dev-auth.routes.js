// Project/api/src/routes/dev-auth.routes.js 

const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source"); 
const UserSchema = require("../entities/user.entity");
const router = Router();

// POST /api/dev/login
router.post("/login", async (req, res) => {
    //  Ensure this only runs in dev!
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).send();
    }

    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ message: "User ID is required for dev login." });
    }

    try {
        const userRepository = AppDataSource.getRepository(UserSchema);
        const targetUser = await userRepository.findOneBy({ id: userId });

        if (!targetUser) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }

        const userPayload = {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
            role: targetUser.role === 2 ? 'Admin' : targetUser.role === 1 ? 'Editor' : 'Viewer'
        };

        // Sign with secret
        // FIX: Use a fallback secret if the environment variable is not defined
        const secret = process.env.JWT_SECRET || 'dev-fallback-secret-123-unblock-dev';

        const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });

        res.json({ token, user: userPayload });

    } catch (error) {
        console.error("Dev login failed:", error);
        res.status(500).json({ message: "Internal Server Error during dev login." });
    }
});

module.exports = router;