const TeacherNotification = require('../models/TeacherNotification');

// Get all notifications for a teacher
exports.getTeacherNotifications = async (req, res) => {
    try {
        const teacherId = req.teacherId; // from auth middleware
        
        console.log('[DEBUG] Fetching notifications for teacher ID:', teacherId);
        console.log('[DEBUG] req.user:', req.user);
        
        if (!teacherId) {
            console.error('[DEBUG] teacherId is undefined or null! Using req.user.id as fallback');
            req.teacherId = req.user?.id;
        }
        
        // Find all notifications
        const notifications = await TeacherNotification.find({ teacherId })
            .sort({ createdAt: -1 })
            .limit(50); // Limit to 50 most recent notifications

        console.log(`[DEBUG] Found ${notifications.length} notifications for teacher ${teacherId}`);
        
        if (notifications.length > 0) {
            console.log('[DEBUG] First notification:', JSON.stringify(notifications[0]));
        } else {
            // Double-check if there are any teacher notifications at all
            const allTeacherNotifs = await TeacherNotification.find({}).limit(5);
            console.log(`[DEBUG] Are there any teacher notifications in the system? ${allTeacherNotifs.length > 0 ? 'Yes' : 'No'}`);
            if (allTeacherNotifs.length > 0) {
                console.log(`[DEBUG] Sample teacher notification (may be for a different teacher):`, 
                    JSON.stringify(allTeacherNotifs[0]));
            }
        }

        res.status(200).json({
            success: true,
            notifications,
            unreadCount: notifications.filter(n => !n.isRead).length
        });
    } catch (error) {
        console.error('Error fetching teacher notifications:', error);
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
        const teacherId = req.teacherId; // from auth middleware
        
        const notification = await TeacherNotification.findOneAndUpdate(
            { _id: notificationId, teacherId },
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
        const teacherId = req.teacherId; // from auth middleware
        
        await TeacherNotification.updateMany(
            { teacherId, isRead: false },
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
        const teacherId = req.teacherId; // from auth middleware
        
        const count = await TeacherNotification.countDocuments({ 
            teacherId, 
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
        const teacherId = req.teacherId; // from auth middleware
        
        const notification = await TeacherNotification.findOneAndDelete({
            _id: notificationId,
            teacherId
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

// Create a test notification (for debugging)
exports.createTestNotification = async (req, res) => {
    try {
        const teacherId = req.teacherId; // from auth middleware
        const { classId } = req.body;
        
        if (!classId) {
            return res.status(400).json({
                success: false,
                message: 'Class ID is required'
            });
        }
        
        console.log('Creating test notification for teacher:', teacherId);
        
        // Find the class to get class name
        const classDoc = await require('../models/Class').findById(classId);
        
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        // Create a test notification
        const notification = new TeacherNotification({
            teacherId,
            classId,
            type: 'discussion',
            title: 'Test Discussion Notification',
            message: `This is a test discussion notification for class ${classDoc.className}`,
            studentName: 'Test Student',
            className: classDoc.className,
            isRead: false,
            createdAt: new Date(),
            metadata: {
                discussionId: '1234567890'
            }
        });
        
        const savedNotification = await notification.save();
        console.log('Test notification created:', savedNotification);
        
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

// Debug endpoint for discussion notifications
exports.getDiscussionDebugInfo = async (req, res) => {
    try {
        const teacherId = req.teacherId; // from auth middleware
        
        // Find all discussion notifications
        const allDiscussionNotifications = await TeacherNotification.find({ 
            type: 'discussion' 
        }).sort({ createdAt: -1 });
        
        // Find discussion notifications for this teacher
        const teacherDiscussionNotifications = await TeacherNotification.find({ 
            teacherId,
            type: 'discussion' 
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${allDiscussionNotifications.length} total discussion notifications, ${teacherDiscussionNotifications.length} for teacher ${teacherId}`);
        
        res.status(200).json({
            success: true,
            totalCount: allDiscussionNotifications.length,
            teacherCount: teacherDiscussionNotifications.length,
            recentNotifications: teacherDiscussionNotifications.slice(0, 5),
            teacherId
        });
    } catch (error) {
        console.error('Error fetching discussion debug info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch discussion debug info',
            error: error.message
        });
    }
};
