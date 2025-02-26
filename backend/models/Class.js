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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

classSchema.plugin(AutoIncrement, { inc_field: 'classId' });

module.exports = mongoose.model('Class', classSchema);
