const mongoose = require('mongoose');

const submissionFileSchema = new mongoose.Schema({
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

const SubmissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: function () {
      return !this.quizId; // Either assignmentId or quizId must be present
    }
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: function () {
      return !this.assignmentId; // Either quizId or assignmentId must be present
    }
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  files: [submissionFileSchema],
  privateComment: {
    type: String,
    default: ''
  },
  grade: {
    type: Number,
    default: null
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded'],
    default: 'submitted'
  },
  isLate: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index to ensure a student can only have one submission per assignment or quiz
SubmissionSchema.index({ assignmentId: 1, quizId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
