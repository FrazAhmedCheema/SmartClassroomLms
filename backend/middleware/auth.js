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
  const token = req.cookies.subAdminToken;

  if (!token) {
    console.warn('No subAdmin token found in cookies');
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'subAdmin') {
      console.warn('Invalid role in token:', decoded.role);
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized as subAdmin' 
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
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
        req.teacherId = decoded.id; // Set teacherId for easier access in controllers
        console.info('Teacher authorization successful. ID:', decoded.id);
        next();
    } catch (err) {
        console.warn('Invalid token error:', err.message);
        res.status(401).json({ msg: 'Unauthorized: Invalid teacher token.' });
    }
};

// Student authorization middleware
exports.authorizeStudent = (req, res, next) => {
  const token = req.cookies.studentToken;
  if (!token) {
    console.warn('No student token found in cookies');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.studentId = decoded.id; // Add this line for notification controller
    console.log('Student authorized:', decoded);
    next();
  } catch (err) {
    console.error('Student token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorizeTeacherOrStudent = (req, res, next) => {
  const token = req.cookies.teacherToken || req.cookies.studentToken;

  if (!token) {
    console.warn('No token found in cookies');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!['teacher', 'student'].includes(decoded.role)) {
      console.warn('Invalid user role:', decoded.role);
      return res.status(403).json({ message: 'Invalid user role' });
    }

    // Set proper user data
    req.user = {
      ...decoded,
      role: decoded.role,
      id: decoded.id,
    };

    console.log('User authorized:', req.user);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.teacherToken || req.cookies.studentToken;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            role: decoded.role,
            name: decoded.name // Add name to the user object
        };
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = {
    authorize,
    authorizeAdmin,
    authorizeSubAdmin,
    authorizeTeacher,
    authorizeStudent: exports.authorizeStudent,
    authorizeTeacherOrStudent
};
