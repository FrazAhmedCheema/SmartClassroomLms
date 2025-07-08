const StudentNotification = require('../models/StudentNotification');

// Create a test notification for debugging
exports.createTestNotification = async (req, res) => {
    try {
        const studentId = req.studentId;
        
        const testNotification = new StudentNotification({
            studentId: studentId,
            classId: new require('mongoose').Types.ObjectId(), // Dummy class ID
            type: 'announcement',
            title: 'Test Notification',
            message: 'This is a test notification to verify the system is working',
            teacherName: 'Test Teacher',
            className: 'Test Class',
            isRead: false,
            createdAt: new Date()
        });
        
        await testNotification.save();
        
        console.log('Test notification created for student:', studentId);
        
        res.json({
            success: true,
            message: 'Test notification created successfully',
            notification: testNotification
        });
        
    } catch (error) {
        console.error('Error creating test notification:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
