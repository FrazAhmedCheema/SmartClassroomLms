const mongoose = require('mongoose');

// Drop existing indices before creating new ones
if (mongoose.connection.models['Submission']) {
  delete mongoose.connection.models['Submission'];
}

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
    default: null,
    sparse: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null,
    sparse: true
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

// Remove old composite index
SubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { sparse: true });
SubmissionSchema.index({ quizId: 1, studentId: 1 }, { sparse: true });

// Add a compound index with a custom partial filter expression
SubmissionSchema.index(
  { studentId: 1, assignmentId: 1, quizId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [
        { assignmentId: { $exists: true, $ne: null } },
        { quizId: { $exists: true, $ne: null } }
      ]
    }
  }
);

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;
