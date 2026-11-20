const mongoose = require('mongoose');
const Assignment = require('../models/Assignment');
const ExtensionRequest = require('../models/ExtensionRequest');

const getStudentExtensionRequests = async (req, res) => {
  try {
    const extensionRequests = await ExtensionRequest.find({ student: req.user._id })
      .populate('assignment', 'title dueDate')
      .sort({ requestedAt: -1 });

    return res.status(200).json(extensionRequests);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createExtensionRequest = async (req, res) => {
  const { assignmentId, reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({ message: 'A valid assignment is required' });
  }

  if (typeof reason !== 'string' || !reason.trim()) {
    return res.status(400).json({ message: 'A reason is required' });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dueDate = new Date(assignment.dueDate);
    dueDate.setUTCHours(0, 0, 0, 0);

    if (dueDate < today) {
      return res.status(400).json({ message: 'The assignment due date has passed' });
    }

    const extensionRequest = await ExtensionRequest.create({
      assignment: assignment._id,
      student: req.user._id,
      reason: reason.trim(),
    });

    return res.status(201).json(extensionRequest);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'You have already requested an extension for this assignment',
      });
    }
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createExtensionRequest, getStudentExtensionRequests };
