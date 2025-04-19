const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['short_answer', 'multiple_choice', 'checkbox', 'dropdown'],
    default: 'short_answer'
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: String,
    default: ''
  },
  allowMultipleAnswers: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
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
  type: {
    type: String,
    default: 'question'
  },
  dueDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', questionSchema);
