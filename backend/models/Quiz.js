const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  key: { type: String, required: true },
  url: { type: String, required: true }
});

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  instructions: { type: String, trim: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  dueDate: { type: Date },
  points: { type: Number, default: 0 },
  attachments: [attachmentSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  questions: [{
    questionText: { type: String, required: true },
    options: [String],
    correctAnswer: { type: String }
  }],
  category: {
    type: String,
    enum: ['general', 'java', 'c++', 'python', 'mern'],
    default: 'general'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', QuizSchema);
