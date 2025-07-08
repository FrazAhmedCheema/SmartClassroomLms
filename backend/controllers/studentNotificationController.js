const StudentNotification = require('../models/StudentNotification');

// Get all notifications for a student
exports.getStudentNotifications = async (req, res) => {
    try {
        const studentId = req.studentId; // from auth middleware
        
        console.log('Fetching notifications for student ID:', studentId);
        
        // Check what types of notifications exist for debugging
        const notificationTypes = await StudentNotification.distinct('type');
        console.log('Available notification types in DB:', notificationTypes);
        
        // Check if there are any discussion notifications
        const discussionCount = await StudentNotification.countDocuments({ 
            type: 'discussion'
        });
        console.log(`Found ${discussionCount} total discussion notifications in DB`);
        
        // Check specifically for this student
        const studentDiscussionCount = await StudentNotification.countDocuments({ 
            type: 'discussion',
            studentId: studentId
        });
        console.log(`Found ${studentDiscussionCount} discussion notifications for student ${studentId}`);
        
        // Find all notifications
        const notifications = await StudentNotification.find({ studentId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to 50 most recent notifications

        console.log(`Found ${notifications.length} notifications for student`);
        console.log('Notification types in response:', notifications.map(n => n.type));

        res.status(200).json({
            success: true,
            notifications,
            unreadCount: notifications.filter(n => !n.isRead).length
        });
    } catch (error) {
        console.error('Error fetching student notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const studentId = req.studentId; // from auth middleware
        
        const notification = await StudentNotification.findOneAndUpdate(
            { _id: notificationId, studentId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const studentId = req.studentId; // from auth middleware
        
        await StudentNotification.updateMany(
            { studentId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

// Get unread notification count
exports.getUnreadNotificationCount = async (req, res) => {
    try {
        const studentId = req.studentId; // from auth middleware
        
        const count = await StudentNotification.countDocuments({ 
            studentId, 
            isRead: false 
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread notification count',
            error: error.message
        });
    }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const studentId = req.studentId; // from auth middleware
        
        const notification = await StudentNotification.findOneAndDelete({
            _id: notificationId,
            studentId
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: error.message
        });
    }
};

// Add a debug endpoint to create a test notification
exports.createTestNotification = async (req, res) => {
    try {
        const studentId = req.studentId; // from auth middleware
        const { classId } = req.body;
        
        if (!classId) {
            return res.status(400).json({
                success: false,
                message: 'Class ID is required'
            });
        }
        
        console.log('Creating test notification for student:', studentId);
        
        // Find the class to get class name
        const classDoc = await require('../models/Class').findById(classId);
        
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        // Check if StudentNotification model has the discussion type
        const validTypes = StudentNotification.schema.path('type').enumValues;
        console.log('[DEBUG] Valid notification types:', validTypes);
        
        if (!validTypes.includes('discussion')) {
            console.error('[DEBUG] Discussion type not found in StudentNotification model!');
            return res.status(400).json({
                success: false,
                message: 'Discussion notification type is not registered in the model',
                validTypes
            });
        }
        
        // Create a test notification
        const notification = new StudentNotification({
            studentId,
            classId,
            type: 'discussion',
            title: 'Test Discussion Notification',
            message: `This is a test discussion notification for class ${classDoc.className}`,
            teacherName: 'Test Teacher',
            className: classDoc.className,
            isRead: false,
            createdAt: new Date(),
            metadata: {
                discussionId: '1234567890'
            }
        });
        
        const savedNotification = await notification.save();
        console.log('[DEBUG] Test notification created:', savedNotification);
        
        // Double check that it was saved by fetching it again
        const fetchedNotification = await StudentNotification.findById(savedNotification._id);
        console.log('[DEBUG] Fetched notification after save:', fetchedNotification);
        
        res.status(201).json({
            success: true,
            message: 'Test notification created successfully',
            notification: savedNotification
        });
    } catch (error) {
        console.error('Error creating test notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create test notification',
            error: error.message
        });
    }
};

// Add a debug endpoint to get discussion notifications count
exports.getDiscussionNotificationsDebug = async (req, res) => {
    try {
        // Count all discussion notifications in the system
        const totalCount = await StudentNotification.countDocuments({ 
            type: 'discussion'
        });
        
        // Get details of all discussion notifications
        const allDiscussionNotifications = await StudentNotification.find({
            type: 'discussion'
        }).sort({ createdAt: -1 });
        
        // If student ID is available, get that student's notifications
        let studentNotifications = [];
        let studentCount = 0;
        
        if (req.studentId) {
            studentCount = await StudentNotification.countDocuments({ 
                type: 'discussion',
                studentId: req.studentId
            });
            
            studentNotifications = await StudentNotification.find({
                type: 'discussion',
                studentId: req.studentId
            }).sort({ createdAt: -1 });
        }
        
        res.status(200).json({
            success: true,
            totalCount,
            studentCount,
            studentId: req.studentId,
            allDiscussionNotifications,
            studentNotifications
        });
    } catch (error) {
        console.error('Error in discussion notifications debug:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get discussion notifications debug info',
            error: error.message
        });
    }
};
