const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin'); // Assuming you have an Admin model
const Request = require('../models/InstituteRequest'); // Assuming you have a Request model
const ApproveInstitute = require('../models/approveInstitute');


exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
        let admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            admin: {
                id: admin.id,
            },
        };

        // Generate JWT
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token in HTTP-only cookie
        res.cookie('adminToken', token, {
            httpOnly: true, // Prevents JavaScript from accessing it
            secure: process.env.NODE_ENV === 'production', // Sends cookie over HTTPS in production
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 5 * 60 * 1000, // Token expiration (5 minutes)
        });

        console.log('Cookie set:', token); // Add this line to log the token

        res.json({ msg: 'Logged in successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.logout = (req, res) => {
    res.clearCookie('adminToken'); // Clear the HTTP-only cookie
    res.json({ msg: 'Logged out successfully' });
};

exports.manageRequests = async (req, res) => {
    try {
        const requests = await Request.find();
        console.info('Requests fetched successfully:', requests.length);
        res.status(200).json(requests);
    } catch (err) {
        console.error('Error fetching requests:', err.message);
        res.status(500).json({ msg: 'Internal server error. Please try again later.' });
    }
};




exports.approveInstitute = async (req, res) => {
    console.log('Approve Institute route accessed'); // Add this line to verify the route is accessed
    console.log('Request body:', req.body);
  try {
    const requestToApprove = req.body;
    const approvedData = {
      instituteName: requestToApprove.instituteName,
      numberOfStudents: requestToApprove.numberOfStudents, // Ensure this is handled as a string
      region: requestToApprove.region,
      instituteAdminName: requestToApprove.instituteAdminName, // Correct property name
      instituteAdminEmail: requestToApprove.instituteAdminEmail, // Correct property name
      institutePhoneNumber: requestToApprove.institutePhoneNumber,
      domainName: requestToApprove.domainName,
      status: 'active'
    };

    const newInstitute = new ApproveInstitute(approvedData);
    console.log('New institute:', newInstitute);
    await newInstitute.save();

    // Delete the request from InstituteRequest using requestId
    await Request.findOneAndDelete({ requestId: requestToApprove.requestId });
    console.log('Deleted request with requestId:', requestToApprove.requestId);

    res.status(201).json({ message: 'Institute approved successfully', data: newInstitute });
  } catch (error) {
    console.error('Error approving institute:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error approving institute', error });
  }
};

exports.rejectInstitute = async (req, res) => {
    console.log('Reject Institute route accessed'); // Add this line to verify the route is accessed
    console.log('Request body:', req.body);
  try {
    const { requestId } = req.body;

    // Delete the request from InstituteRequest using requestId
    const deletedRequest = await Request.findOneAndDelete({ requestId });
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }
    console.log('Deleted request with requestId:', requestId);

    res.status(200).json({ message: 'Institute request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting institute:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error rejecting institute', error });
  }
};




