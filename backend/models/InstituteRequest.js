const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const InstituteRequestSchema = new mongoose.Schema({
    instituteName: {
        type: String,
        required: true
    },
    numberOfStudents: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    institutePhoneNumber: {
        type: String,
        required: true
    },
    domainName: {
        type: String,
        required: true
    }
}, { timestamps: true });

InstituteRequestSchema.plugin(AutoIncrement, { inc_field: 'requestId' });

module.exports = mongoose.model('InstituteRequest', InstituteRequestSchema);
