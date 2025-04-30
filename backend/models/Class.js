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
        content: {
            type: String,
            required: true
        },
        author: {
            name: {
                type: String,
                default: 'Teacher' // Add default to prevent validation errors
            }
        },
        authorRole: {
            type: String,
            enum: ['Teacher', 'Student'],
            default: 'Teacher'
        },
        attachments: [{
            fileName: String,
            fileUrl: String,
            fileType: String
        }],
        comments: [{ // Add comments array to each announcement
            content: {
                type: String,
                required: true
            },
            author: {
                name: {
                    type: String,
                    required: true
                },
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    refPath: 'announcements.comments.authorModel'
                }
            },
            authorModel: {
                type: String,
                enum: ['Teacher', 'Student'],
                default: 'Student'
            },
            authorRole: {
                type: String,
                enum: ['Teacher', 'Student'],
                default: 'Student'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
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
    quizzes: [{ // Add quizzes array to reference Quiz model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    materials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material'
    }],
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

classSchema.plugin(AutoIncrement, { inc_field: 'classId' });

module.exports = mongoose.model('Class', classSchema);
