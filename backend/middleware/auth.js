const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('Auth middleware loaded'); // Add this line to verify the middleware is loaded

// General authorization middleware
function authorize(req, res, next) {
    const token = req.cookies.adminToken || req.cookies.subAdminToken || req.cookies.teacherToken;

    if (!token) {
        console.info('No token provided. Access denied.');
        return res.status(401).json({ msg: 'Unauthorized: No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.info('Token verified successfully. Role:', decoded.role);
        next();
    } catch (err) {
        console.warn('Invalid token. Access denied.');
        res.status(401).json({ msg: 'Unauthorized: Invalid token.' });
    }
}

// Admin authorization middleware
function authorizeAdmin(req, res, next) {
    authorize(req, res, () => {
        if (req.user.role !== 'admin') {
            console.warn('Forbidden: Admin access required.');
            return res.status(401).json({ msg: 'Forbidden: Admin access required.' });
        }
        next();
    });
}

// Sub-admin authorization middleware
function authorizeSubAdmin(req, res, next) {
    authorize(req, res, () => {
        if (req.user.role !== 'subAdmin') {
            console.warn('Forbidden: SubAdmin access required.');
            return res.status(401).json({ msg: 'Forbidden: SubAdmin access required.' });
        }
        next();
    });
}

// Teacher authorization middleware
function authorizeTeacher(req, res, next) {
    authorize(req, res, () => {
        if (req.user.role !== 'teacher') {
            console.warn('Forbidden: Teacher access required.');
            return res.status(401).json({ msg: 'Forbidden: Teacher access required.' });
        }
        next();
    });
}

module.exports = {
    authorize,
    authorizeAdmin,
    authorizeSubAdmin,
    authorizeTeacher
};
