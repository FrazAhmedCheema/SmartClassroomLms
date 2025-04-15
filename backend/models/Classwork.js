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
  driveFileId: {
    type: String,
    required: true
  },
  driveViewLink: {
    type: String,
    required: true
  },
  driveDownloadLink: {
    type: String,
    required: true
  }
});

const ClassworkSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['assignment', 'quiz', 'material', 'question']
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
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Classwork', ClassworkSchema);
