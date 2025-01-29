const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Admin = require('../models/Admin'); // Assuming you have an Admin model
const InstituteRequest = require('../models/InstituteRequest'); // Assuming you have a Request model
const ApproveInstitute = require('../models/approveInstitute');
const Notification = require('../models/Notification');
const { notifyAdmins } = require('../app'); // Import WebSocket notification function

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
            maxAge: 60 * 60 * 1000, // Token expiration (5 minutes)
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
        const requests = await InstituteRequest.find();
        res.status(200).json(requests);
    } catch (err) {
        console.error('Error fetching requests:', err.message);
        res.status(500).json({ msg: 'Internal server error. Please try again later.' });
    }
};

exports.approveInstitute = async (req, res) => {

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
      username: requestToApprove.username,
      password: requestToApprove.password, // Use the already hashed password
      status: 'active'
    };

    const newInstitute = new ApproveInstitute(approvedData);
    console.log('New institute:', newInstitute);
    await newInstitute.save();

    // Delete the request from InstituteRequest using requestId
    await InstituteRequest.findOneAndDelete({ requestId: requestToApprove.requestId });
    console.log('Deleted request with requestId:', requestToApprove.requestId);

    // Send approval email
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS     // Replace with the generated app password
      }
  });
  console.log('Email : ',process.env.EMAIL_USER);

    const mailOptions = {
      
        from: process.env.EMAIL_SENDER,
        to: requestToApprove.instituteAdminEmail,
        subject: 'Your Institute Has Been Approved for SmartClassroomLms 🎉',
        html: `<p>Dear <strong>${requestToApprove.instituteAdminName}</strong>,</p>
               <p>We are thrilled to inform you that your request to join <strong>SmartClassroomLms</strong> has been approved! Your institute, <strong>${requestToApprove.instituteName}</strong>, is now officially onboarded and ready to leverage the powerful features of SmartClassroomLms.</p>
               <p><strong>Here’s what happens next:</strong></p>
               <p>Now you can login with your credentials.</p>
               <p><strong>Details of Approval:</strong></p>
               <ul>
                   <li><strong>Institute Name:</strong> ${requestToApprove.instituteName}</li>
                   <li><strong>Number of Students:</strong> ${requestToApprove.numberOfStudents}</li>
                   <li><strong>Region:</strong> ${requestToApprove.region}</li>
                   <li><strong>Domain Name:</strong> ${requestToApprove.domainName}</li>
               </ul>
               <p>We are confident that SmartClassroomLms will enhance the learning experience at your institute. Please feel free to reach out to us if you have any questions.</p>
               <p>Welcome to the future of education! 🚀</p>
               <p>Best regards,<br>
               Administrator, SmartClassroomLms<br>
               <a href="mailto:support@smartclassroomlms.com">support@smartclassroomlms.com</a></p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Institute approved but failed to send email', error });
        } else {
            console.log('Email sent:', info.response);
            res.status(201).json({ message: 'Institute approved successfully and email sent', data: newInstitute });
        }
    });
  } catch (error) {
    console.error('Error approving institute:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error approving institute', error });
  }
};

exports.rejectInstitute = async (req, res) => {

    try {
        const { requestId } = req.body;

        // Find the request to get the email and other details
        const requestToReject = await InstituteRequest.findOne({ requestId });
        if (!requestToReject) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Delete the request from InstituteRequest using requestId
        await InstituteRequest.findOneAndDelete({ requestId });
        console.log('Deleted request with requestId:', requestId);

        // Send rejection email
        const transporter = nodemailer.createTransport({
          host: 'smtp.hostinger.com',
          port: 465,
          secure: true,
          auth: {
              user: process.env.EMAIL_USER, // Your Gmail address
              pass: process.env.EMAIL_PASS     // Replace with the generated app password
          }
      });

        const mailOptions = {
          from: process.env.EMAIL_SENDER,
          to: requestToApprove.instituteAdminEmail,
            subject: 'Update on Your Request for SmartClassroomLms',
            html: `<p>Dear <strong>${requestToReject.instituteAdminName}</strong>,</p>
                   <p>We regret to inform you that your request for onboarding <strong>SmartClassroomLms</strong> has not been approved at this time.</p>
                   <p>While we are unable to proceed with your application, we value your interest in our LMS and encourage you to address any concerns or queries related to your submission.</p>
                   <p>If you would like further assistance or clarification regarding this decision, please don’t hesitate to contact us. We’d be happy to guide you through the necessary steps for reapplying in the future.</p>
                   <p>We appreciate your understanding and look forward to the possibility of collaborating with your institute at a later stage.</p>
                   <p>Best regards,<br>
                   Administrator, SmartClassroomLms<br>
                   <a href="mailto:support@smartclassroomlms.com">support@smartclassroomlms.com</a></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Institute request rejected but failed to send email', error });
            } else {
                console.log('Email sent:', info.response);
                res.status(200).json({ message: 'Institute request rejected successfully and email sent' });
            }
        });
    } catch (error) {
        console.error('Error rejecting institute:', error);
        res.status(500).json({ message: 'Error rejecting institute', error });
    }
};

exports.manageInstitutes = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
  
      const totalInstitutes = await ApproveInstitute.countDocuments();
      const institutes = await ApproveInstitute.find()
        .select('instituteId instituteName instituteAdminName status') // Fetch only required fields
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      res.status(200).json({
        institutes,
        totalPages: Math.ceil(totalInstitutes / limit),
        currentPage: Number(page),
      });
    } catch (err) {
      console.error('Error fetching institutes:', err.message);
      res.status(500).json({ msg: 'Internal server error. Please try again later.' });
    }
  };
  

  exports.updateInstituteStatus = async (req, res) => {
    try {
      const { id } = req.params; // Use _id or instituteId consistently
      const { status } = req.body;
  
      const institute = await ApproveInstitute.findOneAndUpdate(
        { _id: id }, // Change to instituteId if needed
        { status },
        { new: true }
      ).select('instituteId instituteName instituteAdminName status');
  
      if (!institute) {
        return res.status(404).json({ msg: 'Institute not found' });
      }
  
      res.status(200).json({ msg: 'Status updated successfully', institute });
    } catch (err) {
      console.error('Error updating status:', err.message);
      res.status(500).json({ msg: 'Internal server error' });
    }
  };
  

  exports.deleteInstitute = async (req, res) => {
    try {
      const { id } = req.params; // Use instituteId here
      console.log('Institute ID:', id);
      const institute = await ApproveInstitute.findOneAndDelete({ _id: id }); // Query by instituteId
      console.log('Deleted institute:', institute);
      if (!institute) {
        return res.status(404).json({ msg: 'Institute not found' });
      }
  
      res.status(200).json({ msg: 'Institute deleted successfully' });
    } catch (err) {
      console.error('Error deleting institute:', err.message);
      res.status(500).json({ msg: 'Internal server error' });
    }
  };

exports.sendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, body } = req.body;
    const mailType = req.body.mailType? req.body.mailType :'registered'; 
     

    let institute ;
    if(mailType === 'request'){
       institute = await InstituteRequest.findById(id).select('instituteAdminEmail instituteAdminName');

      if (!institute) return res.status(404).json({ msg: 'Institute not found' });
    }else{
       institute = await ApproveInstitute.findById(id).select('instituteAdminEmail instituteAdminName');
      if (!institute) return res.status(404).json({ msg: 'Institute not found' });
    
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
          user: process.env.EMAIL_USER, // Your Gmail address
          pass: process.env.EMAIL_PASS     // Replace with the generated app password
      }
  });

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: institute.instituteAdminEmail,
      subject,
      text: body,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ msg: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error.message);
    res.status(500).json({ msg: 'Internal server error' });
  }
};


exports.getNotifications = async (req, res) => {
  try {
      const notifications = await Notification.find().sort({ createdAt: -1 });
      res.status(200).json(notifications);
  } catch (err) {
      console.error('Error fetching notifications:', err.message);
      res.status(500).json({ msg: 'Internal server error. Please try again later.' });
  }
};
