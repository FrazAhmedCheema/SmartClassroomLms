const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('Auth middleware loaded'); // Add this line to verify the middleware is loaded

module.exports = function (req, res, next) {
    console.log('Auth middleware called'); // Add this line to verify the middleware is called

    const token = req.cookies.adminToken; 

    console.log('Token:', token); // Add this line to log the token

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded.admin; 
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
