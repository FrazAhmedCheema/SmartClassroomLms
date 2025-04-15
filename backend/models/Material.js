const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  classworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classwork',
    required: true
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

module.exports = mongoose.model('Material', MaterialSchema);
