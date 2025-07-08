const StudentNotification = require('../models/StudentNotification');
const TeacherNotification = require('../models/TeacherNotification');
const Class = require('../models/Class');

/**
 * Creates notifications for students when teacher adds new classwork
 * @param {string} classId - The ID of the class
 * @param {string} workType - Type of work: 'assignment', 'quiz', 'material', 'question', 'announcement'
 * @param {string} workTitle - Title of the work
 * @param {string} teacherName - Name of the teacher who created the work
 * @param {Object} workData - Additional work data (optional)
 */
const createClassworkNotifications = async (classId, workType, workTitle, teacherName, workData = {}) => {
    try {
        console.log(`Creating ${workType} notifications for class:`, classId);
        
        // Find the class with students populated
        const classDoc = await Class.findById(classId).populate('students', '_id name');
        
        if (!classDoc) {
            console.error('Class not found for notifications:', classId);
            return false;
        }

        console.log(`Found class: ${classDoc.className} with ${classDoc.students.length} students`);

        if (classDoc.students.length === 0) {
            console.log('No students in class, skipping notifications');
            return true;
        }

        // Create notification message based on work type
        const messages = {
            assignment: `${teacherName} assigned "${workTitle}" in ${classDoc.className}`,
            quiz: `${teacherName} created a quiz "${workTitle}" in ${classDoc.className}`,
            material: `${teacherName} shared material "${workTitle}" in ${classDoc.className}`,
            question: `${teacherName} posted a question "${workTitle}" in ${classDoc.className}`,
            announcement: `${teacherName} posted a new announcement in ${classDoc.className}`
        };

        const titles = {
            assignment: 'New Assignment',
            quiz: 'New Quiz',
            material: 'New Material',
            question: 'New Question',
            announcement: 'New Announcement'
        };

        const message = messages[workType] || `${teacherName} added new ${workType} "${workTitle}" in ${classDoc.className}`;
        const title = titles[workType] || `New ${workType.charAt(0).toUpperCase() + workType.slice(1)}`;

        // Create notifications for all students
        const notifications = classDoc.students.map(student => ({
            studentId: student._id,
            classId: classDoc._id,
            type: workType,
            title: title,
            message: message,
            teacherName: teacherName,
            className: classDoc.className,
            isRead: false,
            createdAt: new Date(),
            // Store additional data for potential future use
            metadata: {
                workId: workData.workId,
                dueDate: workData.dueDate,
                points: workData.points
            }
        }));

        try {
            const createdNotifications = await StudentNotification.insertMany(notifications);
            console.log(`Successfully created ${createdNotifications.length} ${workType} notifications`);
            return true;
        } catch (notificationError) {
            console.error(`Error creating ${workType} notifications:`, notificationError);
            return false;
        }

    } catch (error) {
        console.error(`Error in createClassworkNotifications for ${workType}:`, error);
        return false;
    }
};

/**
 * Creates a notification for a student when their work is graded
 * @param {string} studentId - The ID of the student
 * @param {string} classId - The ID of the class
 * @param {string} workType - Type of work: 'assignment' or 'quiz'
 * @param {string} workTitle - Title of the work
 * @param {string} teacherName - Name of the teacher who graded the work
 * @param {Object} gradeData - Additional grade data (points, feedback, etc.)
 */
const createGradeNotification = async (studentId, classId, workType, workTitle, teacherName, gradeData = {}) => {
    try {
        console.log(`Creating grade notification for student ${studentId} in class ${classId}`);
        
        // Find the class to get class name
        const classDoc = await Class.findById(classId);
        
        if (!classDoc) {
            console.error('Class not found for grade notification:', classId);
            return false;
        }

        // Create notification message based on work type
        const score = gradeData.grade !== undefined ? `${gradeData.grade} ${gradeData.points ? `out of ${gradeData.points}` : ''}` : '';
        
        const message = `${teacherName} graded your ${workType} "${workTitle}" ${score ? `with a score of ${score}` : ''} in ${classDoc.className}`;
        const title = `${workType.charAt(0).toUpperCase() + workType.slice(1)} Graded`;

        const notification = {
            studentId: studentId,
            classId: classId,
            type: `${workType}-grade`,
            title: title,
            message: message,
            teacherName: teacherName,
            className: classDoc.className,
            isRead: false,
            createdAt: new Date(),
            metadata: {
                workId: gradeData.workId,
                grade: gradeData.grade,
                points: gradeData.points,
                submissionId: gradeData.submissionId
            }
        };

        try {
            const createdNotification = await StudentNotification.create(notification);
            console.log(`Successfully created grade notification for student ${studentId}`);
            return true;
        } catch (notificationError) {
            console.error(`Error creating grade notification:`, notificationError);
            return false;
        }

    } catch (error) {
        console.error(`Error in createGradeNotification:`, error);
        return false;
    }
};

/**
 * Creates notifications for both students and teachers when a new discussion is created
 * @param {string} classId - The ID of the class
 * @param {string} discussionTitle - Title of the discussion
 * @param {string} authorName - Name of the user who created the discussion
 * @param {string} authorRole - Role of the creator ('teacher' or 'student')
 * @param {string} discussionId - ID of the created discussion
 * @param {string} authorId - ID of the author
 */
const createDiscussionNotifications = async (classId, discussionTitle, authorName, authorRole, discussionId, authorId) => {
    try {
        console.log(`=== CREATING DISCUSSION NOTIFICATIONS ===`);
        console.log(`Class ID: ${classId}`);
        console.log(`Discussion Title: ${discussionTitle}`);
        console.log(`Author Name: ${authorName}`);
        console.log(`Author Role: ${authorRole}`);
        console.log(`Discussion ID: ${discussionId}`);
        console.log(`Author ID: ${authorId}`);
        
        // Find the class with students and teacher populated
        const classDoc = await Class.findById(classId)
            .populate('students', '_id name')
            .populate('teacherId', '_id name');
        
        if (!classDoc) {
            console.error('Class not found for discussion notifications:', classId);
            return false;
        }

        console.log(`Found class: "${classDoc.className}" with ${classDoc.students.length} students`);
        
        // Log teacher info for debugging
        if (classDoc.teacherId) {
            console.log(`Class teacher: ${classDoc.teacherId.name || 'Unknown'} (ID: ${classDoc.teacherId._id})`);
        } else {
            console.log(`No teacher information found for class. Using teacherId: ${classDoc.teacherId}`);
        }
        
        console.log(`Student IDs in class:`, classDoc.students.map(s => s._id.toString()));

        // Create notification message
        const message = `${authorName} started a new discussion "${discussionTitle}" in ${classDoc.className}`;
        const title = 'New Discussion';

        // Create notifications for all recipients
        const notifications = [];
        
        // Add notifications for all students regardless of who created the discussion
        classDoc.students.forEach(student => {
            // Log comparison for debugging
            const studentId = student._id.toString();
            console.log(`Comparing student ID (${studentId}) with author ID (${authorId})`);
            
            // Create notification for all students except the author
            if (authorRole === 'student' && studentId === authorId) {
                console.log(`Skipping notification for discussion creator: ${studentId}`);
                return;
            }
            
            console.log(`Creating notification for student: ${studentId} (${student.name})`);
            
            // Extra logging for debugging
            console.log(`Author role: ${authorRole}, Author ID type: ${typeof authorId}`);
            console.log(`Student ID type: ${typeof studentId}`);
            console.log(`Comparison result: ${studentId === authorId}`);
            console.log(`Direct string values - studentId: '${studentId}', authorId: '${authorId}'`);
            
            notifications.push({
                studentId: student._id,
                classId: classDoc._id,
                type: 'discussion',
                title: title,
                message: message,
                teacherName: authorRole === 'teacher' ? authorName : classDoc.teacherId?.name || 'Teacher',
                className: classDoc.className,
                isRead: false,
                createdAt: new Date(),
                metadata: {
                    discussionId: discussionId
                }
            });
        });

        console.log(`Created ${notifications.length} notification objects`);

        // Create teacher notification if the author is a student
        let teacherNotification = null;
        if (authorRole === 'student' && classDoc.teacherId) {
            console.log(`Creating teacher notification for teacher: ${classDoc.teacherId._id} (${classDoc.teacherId.name || 'Unknown'})`);
            teacherNotification = {
                teacherId: classDoc.teacherId._id,
                classId: classDoc._id,
                type: 'discussion',
                title: title,
                message: message,
                studentName: authorName,
                className: classDoc.className,
                isRead: false,
                createdAt: new Date(),
                metadata: {
                    discussionId: discussionId
                }
            };
        } else {
            console.log(`Skipping teacher notification because author is a teacher or teacher not found`);
        }

        if (notifications.length === 0 && !teacherNotification) {
            console.log('No notifications to create - returning');
            return true;
        }

        try {
            console.log('Attempting to save notifications to database');
            // Add extra check to ensure we have valid data
            if (!notifications.length && !teacherNotification) {
                console.log('No valid notifications to save - empty array');
                return {
                    success: false,
                    error: 'No notifications to create',
                    notifications: []
                };
            }
            
            let createdNotifications = [];
            let createdTeacherNotification = null;
            
            // Save student notifications if any
            if (notifications.length > 0) {
                // Log first notification for debugging
                console.log('First student notification object:', JSON.stringify(notifications[0], null, 2));
                createdNotifications = await StudentNotification.insertMany(notifications);
                console.log(`Successfully created ${createdNotifications.length} student discussion notifications`);
            }
            
            // Save teacher notification if exists
            if (teacherNotification) {
                console.log('Teacher notification object:', JSON.stringify(teacherNotification, null, 2));
                const teacherNotificationModel = new TeacherNotification(teacherNotification);
                createdTeacherNotification = await teacherNotificationModel.save();
                console.log('Successfully created teacher discussion notification:', createdTeacherNotification._id);
            }
            
            return {
                success: true,
                studentCount: createdNotifications.length,
                teacherNotification: createdTeacherNotification ? true : false,
                firstStudentNotification: createdNotifications.length > 0 ? createdNotifications[0] : null,
                teacherNotificationData: createdTeacherNotification
            };
        } catch (notificationError) {
            console.error(`Error creating discussion notifications:`, notificationError);
            return {
                success: false,
                error: notificationError.message,
                details: notificationError
            };
        }

    } catch (error) {
        console.error(`Error in createDiscussionNotifications:`, error);
        return false;
    }
};

module.exports = {
    createClassworkNotifications,
    createGradeNotification,
    createDiscussionNotifications
};
