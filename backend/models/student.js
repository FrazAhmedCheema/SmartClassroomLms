const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const AddStudentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationId: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: 'active' },
    role: { type: String, required: true }, // Role field added
    enrolledClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }], // Class reference added
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true } // Institute reference added
});

AddStudentSchema.plugin(AutoIncrement, { inc_field: 'studentId' });

AddStudentSchema.methods.enrollInClass = function(classId) {
  if (!this.enrolledClasses.includes(classId)) {
    this.enrolledClasses.push(classId);
  }
  return this.save();
};

module.exports = mongoose.model('Student', AddStudentSchema);
