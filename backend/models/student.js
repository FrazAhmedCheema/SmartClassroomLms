const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const AddStudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'active' },
    role: { type: String, required: true }, // Role field added
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true } // Institute reference added
});

AddStudentSchema.plugin(AutoIncrement, { inc_field: 'studentId' });

module.exports = mongoose.model('Student', AddStudentSchema);
