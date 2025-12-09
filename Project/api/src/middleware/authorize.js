/**
 * @file authorize.js
 * Middleware factory for Role-Based Access Control.
 * Enforces permission checks based on the authenticated user's role.
 */


/**
 * Creates a middleware function that restricts access to specific user roles.
 *   - Relies on `req.user` being populated by `auth.middleware.js`.
 *   - Maps database integer roles (1, 2, 3) to human-readable strings ('Viewer', 'Editor', 'Admin')
 *      
 * @param {string[]} allowedRoles - Array of allowed role names (`['Admin', 'Editor', 'Viewer']`).
 * @returns {Function} Express middleware function.
 */
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