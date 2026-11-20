const mongoose = require('mongoose');

const extensionRequestSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: { type: String, required: true, trim: true },
  requestedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  decisionComment: { type: String, trim: true, default: '' },
  decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  decidedAt: { type: Date },
  extendedDueDate: { type: Date, default: null },
});

extensionRequestSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ExtensionRequest', extensionRequestSchema);
