const authorize = (allowedRoles) => (req, res, next) => {
    const user = req.user; 

    // Ensure the user is logged in (from auth.middleware)
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Convert Database Roles to Strings for easier checking
    const ROLE_MAP = {
        1: 'Viewer',
        2: 'Editor',
        3: 'Admin'
    };

    const userRoleString = ROLE_MAP[user.role];

    // Check if their role is allowed
    // If the role ID is invalid or not in the list, this will correctly fail
    if (!userRoleString || !allowedRoles.includes(userRoleString)) {
        return res.status(403).json({ 
            message: `Forbidden: Role '${userRoleString || user.role}' cannot perform this action.` 
        });
    }

    next();
};

module.exports = authorize;