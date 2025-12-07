const authorize = (allowedRoles) => (req, res, next) => {
    const user = req.user; 

    // 1. Ensure the user is logged in (from auth.middleware)
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // 2. Convert Database Roles to Strings for easier checking
    // Assumption: 0=Viewer, 1=Editor, 2=Admin (Check your Seed Data!)
    const ROLE_MAP = {
        0: 'Viewer',
        1: 'Editor',
        2: 'Admin'
    };

    const userRoleString = ROLE_MAP[user.role];

    // 3. Check if their role is allowed
    if (!allowedRoles.includes(userRoleString)) {
        return res.status(403).json({ 
            message: `Forbidden: Role '${userRoleString}' cannot perform this action.` 
        });
    }

    next();
};

module.exports = authorize;