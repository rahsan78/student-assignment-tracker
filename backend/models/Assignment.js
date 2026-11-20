const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    attachment: {
      originalName: { type: String },
      storedName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);