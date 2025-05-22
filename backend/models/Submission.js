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
    default: null
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
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

// Clear existing indexes first
// mongoose.connection.once('open', async () => {
//   try {
//     await mongoose.connection.collections.submissions.dropIndexes();
//   } catch (error) {
//     console.log('No indexes to drop');
//   }
// });

// // Create a compound index with partial filter expressions
// SubmissionSchema.index(
//   { studentId: 1, quizId: 1 },
//   { 
//     unique: true,
//     sparse: true,
//     partialFilterExpression: { quizId: { $exists: true, $ne: null } }
//   }
// );

// SubmissionSchema.index(
//   { studentId: 1, assignmentId: 1 },
//   { 
//     unique: true,
//     sparse: true,
//     partialFilterExpression: { assignmentId: { $exists: true, $ne: null } }
//   }
// );

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;
