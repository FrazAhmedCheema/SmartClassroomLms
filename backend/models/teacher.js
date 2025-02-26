const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const TeacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'active' },
    role: { type: String, required: true }, // Role field added
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true }, // Institute reference added
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }] // Classes array added
}, {
    timestamps: true
});

TeacherSchema.plugin(AutoIncrement, { inc_field: 'teacherId' });

module.exports = mongoose.model('Teacher', TeacherSchema);
