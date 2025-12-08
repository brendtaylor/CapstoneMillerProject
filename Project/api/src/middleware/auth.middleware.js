const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source"); 
const UserSchema = require("../entities/user.entity"); 

// in-memory cache: { userId: { userObject, timestamp } }
const userCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // Cache user for 1 minute

const authenticateToken = async (req, res, next) => {
    let token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token && req.query.token) token = req.query.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
        if (err) return res.sendStatus(403);

        const now = Date.now();

        // CHECK CACHE FIRST
        if (userCache.has(decodedUser.id)) {
            const cached = userCache.get(decodedUser.id);
            if (now - cached.timestamp < CACHE_TTL_MS) {
                req.user = cached.user; // Use cached user
                return next(); 
            }
        }

        try {
            const userRepository = AppDataSource.getRepository(UserSchema);
            let localUser = await userRepository.findOneBy({ id: decodedUser.id });

            // If user doesn't exist, create them
            if (!localUser) {
                localUser = userRepository.create({
                    id: decodedUser.id,
                    name: decodedUser.name,
                    email: decodedUser.email,
                    role: mapRoleStringToId(decodedUser.role)
                });
                await userRepository.save(localUser);
            }

            // SAVE TO CACHE
            userCache.set(decodedUser.id, { user: localUser, timestamp: now });

            req.user = localUser; 
            next();
        } catch (dbError) {
            console.error("Auth DB Error:", dbError);
            res.sendStatus(500);
        }
    });
};

module.exports = { authenticateToken };