const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('Auth middleware loaded'); // Add this line to verify the middleware is loaded

module.exports = function (req, res, next) {
    const token = req.cookies.adminToken;

    if (!token) {
        console.info('No token provided. Access denied.');
        return res.status(401).json({ msg: 'Unauthorized: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded.admin;
        console.info('Token verified successfully.');
        next();
    } catch (err) {
        console.warn('Invalid token. Access denied.');
        res.status(401).json({ msg: 'Unauthorized: Invalid token.' });
    }
};
