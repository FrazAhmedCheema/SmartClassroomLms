const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'authorModel'
  },
  authorModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student']
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const discussionSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  title: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'authorModel',
    required: true
  },
  authorModel: {
    type: String,
    required: true,
    enum: ['Teacher', 'Student']
  },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  terminated: {
    type: Boolean,
    default: false // Default to false, meaning the discussion is active
  }
});

// Pre-save middleware
discussionSchema.pre('save', function(next) {
  if (this.messages && this.messages.length > 0) {
    this.lastActivity = this.messages[this.messages.length - 1].createdAt;
  }
  next();
});

// Add virtual for easier model resolution
discussionSchema.virtual('authorModelClass').get(function() {
  return this.authorModel === 'Teacher' ? Teacher : Student;
});

const Discussion = mongoose.model('Discussion', discussionSchema);
module.exports = Discussion;
