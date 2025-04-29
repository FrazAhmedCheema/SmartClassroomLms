const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
});

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  dueDate: {
    type: Date
  },
  points: {
    type: Number,
    default: 0
  },
  attachments: [attachmentSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  allowLateSubmissions: {
    type: Boolean,
    default: false
  },
  studentSubmissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission' // Reference to the Submission model
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);
