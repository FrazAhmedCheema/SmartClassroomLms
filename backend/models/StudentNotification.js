const mongoose = require('mongoose');

const studentNotificationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    announcementId: { type: mongoose.Schema.Types.ObjectId },
    type: { 
        type: String, 
        enum: ['announcement', 'assignment', 'quiz', 'material', 'question', 'general', 'assignment-grade', 'quiz-grade', 'discussion'], 
        required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    teacherName: { type: String, required: true },
    className: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    metadata: { 
        type: Object, 
        default: {} 
    }
});

// Index for efficient querying
studentNotificationSchema.index({ studentId: 1, createdAt: -1 });
studentNotificationSchema.index({ studentId: 1, isRead: 1 });

module.exports = mongoose.model('StudentNotification', studentNotificationSchema);
