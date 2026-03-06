import jwt from 'jsonwebtoken';

// Middleware to verify if a user is authenticated (has a valid JWT)
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // Format is "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id, email, role
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

// Middleware to check if the user has specific roles
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Requires one of these roles: ${roles.join(', ')}.`
            });
        }
        next();
    };
};
