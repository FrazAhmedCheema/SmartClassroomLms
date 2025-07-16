const mongoose = require('mongoose');

const plagiarismReportSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  reportId: {
    type: String,
    required: true,
    unique: true
  },
  checkId: {
    type: String,
    required: true
  },
  reportUrl: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['codequiry'], // add more types in future like 'turnitin' etc.
    default: 'codequiry'
  },
  overview: {
    type: mongoose.Schema.Types.Mixed, // stores entire overview object from Codequiry
    required: true
  },
  results: {
    type: Map,
    of: {
      scanId: String,
      studentName: String,
      studentId: mongoose.Schema.Types.ObjectId,
      fileName: String,
      error: String,
      similarity: Number,
      results: mongoose.Schema.Types.Mixed,
      pdfUrl: String
    },
    default: undefined
  },
  statistics: {
    averageSimilarity: Number,
    maxSimilarity: Number,
    totalFiles: Number,
    distribution: {
      low: Number,
      medium: Number,
      high: Number,
      critical: Number
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for performance
plagiarismReportSchema.index({ assignmentId: 1, createdAt: -1 });
plagiarismReportSchema.index({ reportId: 1 });

module.exports = mongoose.model('PlagiarismReport', plagiarismReportSchema);
