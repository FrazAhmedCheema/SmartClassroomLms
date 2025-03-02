const jwt = require('jsonwebtoken');
require('dotenv').config();

console.log('Auth middleware loaded'); // Add this line to verify the middleware is loaded

// General authorization middleware with improved logging
function authorize(req, res, next) {
    const token = req.cookies.adminToken || req.cookies.subAdminToken || req.cookies.teacherToken;

    if (!token) {
        console.info('No token provided. Access denied.');
        return res.status(401).json({ msg: 'Unauthorized: No token provided.' });
    }

    try {
        console.log('Verifying token:', token.substring(0, 10) + '...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.info('Token verified successfully. Role:', decoded.role, 'User ID:', decoded.id);
        next();
    } catch (err) {
        console.warn('Invalid token error:', err.message);
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

// Teacher authorization middleware with improved debugging
const authorizeTeacher = (req, res, next) => {
    console.log('Teacher authorization check');
    
    // Check specifically for teacherToken only
    const teacherToken = req.cookies.teacherToken;
    
    if (!teacherToken) {
        console.log('No teacher token found in cookies');
        return res.status(401).json({ msg: 'Unauthorized: No teacher token provided.' });
    }
    
    console.log('Teacher token found:', teacherToken.substring(0, 10) + '...');
    
    try {
        // Verify the token
        const decoded = jwt.verify(teacherToken, process.env.JWT_SECRET);
        
        // Check if role is teacher
        if (decoded.role !== 'teacher') {
            console.warn('Invalid role in teacher token:', decoded.role);
            return res.status(403).json({ msg: 'Forbidden: Teacher access required.' });
        }
        
        // Set the user info
        req.user = decoded;
        console.info('Teacher authorization successful. ID:', decoded.id);
        next();
    } catch (err) {
        console.warn('Invalid token error:', err.message);
        res.status(401).json({ msg: 'Unauthorized: Invalid teacher token.' });
    }
};

// Student authorization middleware
const authorizeStudent = (req, res, next) => {
    const token = req.cookies.studentToken;
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = {
    authorize,
    authorizeAdmin,
    authorizeSubAdmin,
    authorizeTeacher,
    authorizeStudent
};
