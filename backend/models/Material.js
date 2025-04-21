const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'authorModel',
    required: true
  },
  authorModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student'],
    default: 'Student'
  },
  authorName: {
    type: String,
    required: true,
    default: 'Anonymous User' // Add a default value
  },
  authorRole: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student'],
    default: 'Student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  attachments: [{
    fileName: String,
    fileType: String,
    key: String,
    url: String
  }],
  comments: [commentSchema],
  type: {
    type: String,
    default: 'material'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Material', materialSchema);
