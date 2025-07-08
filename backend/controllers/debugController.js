const StudentNotification = require('../models/StudentNotification');
const Class = require('../models/Class');

// Debug endpoint to test notification creation
exports.debugNotifications = async (req, res) => {
    try {
        const studentId = req.studentId;
        
        console.log('=== NOTIFICATION DEBUG ===');
        console.log('Student ID:', studentId);
        
        // Get all notifications for this student
        const notifications = await StudentNotification.find({ studentId });
        console.log('All notifications for student:', notifications);
        
        // Get all classes where this student is enrolled
        const classes = await Class.find({ students: studentId }).populate('teacherId', 'name');
        console.log('Classes student is enrolled in:', classes.map(c => ({
            id: c._id,
            name: c.className,
            teacher: c.teacherId?.name,
            students: c.students.length
        })));
        
        // Get total notification count in database
        const totalNotifications = await StudentNotification.countDocuments();
        console.log('Total notifications in database:', totalNotifications);
        
        // Get latest announcements from classes
        const classesWithAnnouncements = await Class.find({ students: studentId })
            .select('className announcements')
            .limit(5);
        
        console.log('Recent announcements in student classes:');
        classesWithAnnouncements.forEach(cls => {
            console.log(`Class: ${cls.className}, Announcements: ${cls.announcements.length}`);
            if (cls.announcements.length > 0) {
                console.log('Latest announcement:', cls.announcements[0]);
            }
        });
        
        res.json({
            success: true,
            debug: {
                studentId,
                notificationCount: notifications.length,
                notifications,
                enrolledClasses: classes.length,
                classes: classes.map(c => ({
                    id: c._id,
                    name: c.className,
                    teacher: c.teacherId?.name
                })),
                totalNotificationsInDB: totalNotifications
            }
        });
        
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
