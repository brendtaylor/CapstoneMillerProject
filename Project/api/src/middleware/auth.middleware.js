/**
 * @file auth.middleware.js
 * 
 * Middleware for handling User Authentication via JWT.
 * - Validates JWTs from "Authorization" headers or query parameters.
 * - Implements in-memory caching to reduce database load (TTL: 60 seconds).
 * - "Just-In-Time" Provisioning: Automatically creates users in the local database 
 *    if they possess a valid token but don't exist yet.
 */

const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source"); 
const UserSchema = require("../entities/user.entity"); 
const logger = require("../../logger");

// in-memory cache: { userId: { userObject, timestamp } }
const userCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // Cache user for 1 minute


/**
 * Express middleware to authenticate users.
 * 
 * Logic Flow:
 * 1. Extract token from `Authorization: Bearer <token>` header or `?token=` query param.
 * 2. Verify JWT signature.
 * 3. Check in-memory cache for the user to avoid DB hits.
 * 4. If not cached, fetch from DB.
 * 5. If user is missing in DB (but token is valid), auto-create the user.
 * 6. Update cache and attach user to `req.user`.
 * 
 *  @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {void} Calls `next()` if successful, or responds with 401/403.
 */
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
            logger.error(`Auth DB Error: ${dbError.message}`);
            res.sendStatus(500);
        }
    });
};

/**
 * Helper to map string roles from JWT (ex: "admin") to database integer IDs.
 * Mappings based on logic in authorize.js.
 * 
 * @param {string} roleString - The role name from the token.
 * @returns {number} The corresponding database role ID (Default: 1: Viewer).
 */
function mapRoleStringToId(roleString) {
    if (!roleString) return 1; // Default to Viewer

    switch (roleString.toLowerCase()) {
        case 'admin':
            return 3;
        case 'editor':
            return 2;
        case 'viewer':
            return 1;
        default:
            return 1; // Default to Viewer if unknown
    }
}

module.exports = { authenticateToken };