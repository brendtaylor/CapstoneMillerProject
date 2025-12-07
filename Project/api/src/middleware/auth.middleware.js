const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../data-source"); //
const UserSchema = require("../entities/user.entity"); //

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedUser) => {
        if (err) return res.sendStatus(403);

        // SYNC STRATEGY:
        // The token is valid, so this user IS authenticated by the main app.
        // We must ensure they exist in our local 'MiHub_Quality_Users' table
        // so we can link them to Tickets/Notes.
        const userRepository = AppDataSource.getRepository(UserSchema);
        
        let localUser = await userRepository.findOneBy({ id: decodedUser.id });

        if (!localUser) {
            // User exists in MiHub but not here yet. Create them.
            localUser = userRepository.create({
                id: decodedUser.id,
                name: decodedUser.name,
                email: decodedUser.email,
                role: decodedUser.role === 'Admin' ? 2 : 1 // Map string roles to your tinyint logic
            });
            await userRepository.save(localUser);
        } else {
            // Optional: Update local details if they changed in the token
             if(localUser.name !== decodedUser.name) {
                localUser.name = decodedUser.name;
                await userRepository.save(localUser);
             }
        }

        req.user = localUser; // Attach the full DB entity to the request
        next();
    });
};

module.exports = { authenticateToken };