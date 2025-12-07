// Project/api/src/middleware/auth.middleware.js (Corrected)
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source"); 
const UserSchema = require("../entities/user.entity"); 

const mapRoleStringToId = (roleString) => {
    switch (roleString) {
        case 'Admin':
            return 2;
        case 'Editor':
            return 1;
        case 'Viewer':
            return 0;
        default:
            // Fallback for unexpected roles, you may adjust this as needed
            return 0; 
    }
}

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
        if (err) return res.sendStatus(403);

        const userRepository = AppDataSource.getRepository(UserSchema);
        
        let localUser = await userRepository.findOneBy({ id: decodedUser.id });

        if (!localUser) {
            // User exists in MiHub but not here yet. Create them.
            localUser = userRepository.create({
                id: decodedUser.id,
                name: decodedUser.name,
                email: decodedUser.email,
                role: mapRoleStringToId(decodedUser.role) // Map string roles to int identifiers
            });
            await userRepository.save(localUser);
        } else {
            // Optional: Update local details if they changed in the token
             if(localUser.name !== decodedUser.name || localUser.role !== mapRoleStringToId(decodedUser.role)) {
                localUser.name = decodedUser.name;
                localUser.role = mapRoleStringToId(decodedUser.role);
                await userRepository.save(localUser);
             }
        }

        req.user = localUser; // Attach the full DB entity to the request
        next();
    });
};

module.exports = { authenticateToken };