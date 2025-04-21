const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

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
    enum: ['short_answer', 'poll'], // Changed from 'multiple_choice' to 'poll'
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
  },
  answers: [answerSchema], // Add answers array to store student responses
  pollResponses: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    response: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  results: [{
    optionIndex: Number,
    votes: Number,
    percentage: Number
  }]
});

// Add pre-save middleware to update vote counts
questionSchema.pre('save', function(next) {
  if (this.questionType === 'poll' && this.pollResponses) {
    // Calculate total votes
    this.totalVotes = this.pollResponses.length;
    
    // Calculate results for each option
    const voteCounts = {};
    this.pollResponses.forEach(response => {
      voteCounts[response.response] = (voteCounts[response.response] || 0) + 1;
    });

    this.results = Object.keys(voteCounts).map(optionIndex => ({
      optionIndex: Number(optionIndex),
      votes: voteCounts[optionIndex],
      percentage: (voteCounts[optionIndex] / this.totalVotes) * 100
    }));
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema);
