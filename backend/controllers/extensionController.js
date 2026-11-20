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

const getPendingExtensionRequests = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id }).select('_id');
    const assignmentIds = assignments.map((assignment) => assignment._id);
    const extensionRequests = await ExtensionRequest.find({
      status: 'Pending',
      assignment: { $in: assignmentIds },
    })
      .populate('assignment', 'title dueDate')
      .populate('student', 'name email')
      .sort({ requestedAt: 1 });

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

const decideExtensionRequest = async (req, res) => {
  const { status, decisionComment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid extension request id' });
  }

  try {
    const extensionRequest = await ExtensionRequest.findById(req.params.id);
    if (!extensionRequest) {
      return res.status(404).json({ message: 'Extension request not found' });
    }

    const assignment = await Assignment.findById(extensionRequest.assignment);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'You can only decide requests for your own assignments',
      });
    }

    if (extensionRequest.status !== 'Pending') {
      return res.status(409).json({ message: 'This extension request has already been decided' });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Choose Approved or Rejected' });
    }

    if (
      status === 'Rejected' &&
      (typeof decisionComment !== 'string' || !decisionComment.trim())
    ) {
      return res.status(400).json({ message: 'A comment is required to reject the request' });
    }

    if (
      status === 'Approved' &&
      decisionComment !== undefined &&
      decisionComment !== null &&
      typeof decisionComment !== 'string'
    ) {
      return res.status(400).json({ message: 'Decision comment must be text' });
    }

    if (status === 'Approved') {
      const extendedDueDate = new Date(assignment.dueDate);
      extendedDueDate.setUTCDate(extendedDueDate.getUTCDate() + 2);
      extensionRequest.extendedDueDate = extendedDueDate;
    }

    extensionRequest.status = status;
    extensionRequest.decisionComment = decisionComment?.trim() || '';
    extensionRequest.decidedBy = req.user._id;
    extensionRequest.decidedAt = new Date();
    await extensionRequest.save();

    return res.status(200).json(extensionRequest);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExtensionRequest,
  getStudentExtensionRequests,
  getPendingExtensionRequests,
  decideExtensionRequest,
};
