const mongoose = require('mongoose');

const teacherNotificationSchema = new mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    type: { 
        type: String, 
        enum: ['announcement', 'assignment', 'quiz', 'material', 'question', 'general', 'discussion'], 
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    studentName: { type: String },
    className: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    metadata: { 
        type: Object, 
        default: {} 
    }
});

// Index for efficient querying
teacherNotificationSchema.index({ teacherId: 1, createdAt: -1 });
teacherNotificationSchema.index({ teacherId: 1, isRead: 1 });

module.exports = mongoose.model('TeacherNotification', teacherNotificationSchema);
