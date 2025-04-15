const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  classworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classwork',
    required: true
  },
  questionType: {
    type: String,
    enum: ['short_answer', 'multiple_choice', 'checkbox', 'dropdown'],
    default: 'short_answer'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
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

module.exports = mongoose.model('Question', QuestionSchema);
