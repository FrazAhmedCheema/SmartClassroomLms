const mongoose = require('mongoose');

const studentInvitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    invitedByName: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7 days in seconds
    }
}, {
    timestamps: true
});

// Index for efficient queries
studentInvitationSchema.index({ email: 1, classId: 1 });
studentInvitationSchema.index({ token: 1 });
studentInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('StudentInvitation', studentInvitationSchema);
