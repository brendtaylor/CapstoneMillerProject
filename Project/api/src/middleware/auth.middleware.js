// Project/api/src/middleware/auth.middleware.js (Corrected)
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source"); 
const UserSchema = require("../entities/user.entity"); 

const mapRoleStringToId = (roleString) => {
    switch (roleString) {
        case 'Admin':
            return 3;
        case 'Editor':
            return 2;
        case 'Viewer':
            return 1;
        default:
            // Fallback for unexpected roles, you may adjust this as needed
            return 1; 
    }
}

const authenticateToken = async (req, res, next) => {
    // 1. Try to get token from Header
    let token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

    // 2. Fallback: Try to get token from Query String (Required for SSE)
    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
        if (err) return res.sendStatus(403);

        const userRepository = AppDataSource.getRepository(UserSchema);
        let localUser = await userRepository.findOneBy({ id: decodedUser.id });

        if (!localUser) {
            localUser = userRepository.create({
                id: decodedUser.id,
                name: decodedUser.name,
                email: decodedUser.email,
                role: mapRoleStringToId(decodedUser.role)
            });
            await userRepository.save(localUser);
        }

        req.user = localUser; 
        next();
    });
};

module.exports = { authenticateToken };