const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const classSchema = new mongoose.Schema({
    classId: Number,  // This will be auto-incremented
    className: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    classCode: {
        type: String,
        required: true,
        unique: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    announcements: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'announcements.authorModel',
            required: true
        },
        authorModel: {
            type: String,
            required: true,
            enum: ['Teacher', 'Student']
        },
        authorName: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    discussions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

classSchema.plugin(AutoIncrement, { inc_field: 'classId' });

module.exports = mongoose.model('Class', classSchema);
