const Assignment = require('../models/Assignment');
const ExtensionRequest = require('../models/ExtensionRequest');
const fs = require('fs/promises');

const deleteUploadedFile = async (file) => {
  if (!file) return;

  try {
    await fs.unlink(file.path);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
};

const getDueStatus = (dueDate) => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const assignmentDueDate = new Date(dueDate);
  assignmentDueDate.setUTCHours(0, 0, 0, 0);

  if (assignmentDueDate < today) {
    return 'Overdue';
  }

  const daysUntilDue = (assignmentDueDate - today) / (1000 * 60 * 60 * 24);
  return daysUntilDue <= 7 ? 'Due soon' : 'Upcoming';
};

const getInstructorAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id }).sort({ dueDate: 1 });
    return res.status(200).json(assignments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getStudentAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ dueDate: 1 }).lean();
    const approvedRequests = await ExtensionRequest.find({
      student: req.user._id,
      status: 'Approved',
    }).select('assignment extendedDueDate').lean();
    const extendedDueDates = new Map(
      approvedRequests.map((request) => [
        request.assignment.toString(),
        request.extendedDueDate,
      ])
    );
    const assignmentsWithDueStatus = assignments
      .map((assignment) => {
        const extendedDueDate = extendedDueDates.get(assignment._id.toString()) || null;
        return {
          ...assignment,
          extendedDueDate,
          dueStatus: getDueStatus(extendedDueDate || assignment.dueDate),
        };
      })
      .sort(
        (first, second) =>
          new Date(first.extendedDueDate || first.dueDate) -
          new Date(second.extendedDueDate || second.dueDate)
      );

    return res.status(200).json(assignmentsWithDueStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createAssignment = async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (typeof title !== 'string' || !title.trim()) {
    try {
      await deleteUploadedFile(req.file);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(400).json({ message: 'Title is required' });
  }

  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date()) {
    try {
      await deleteUploadedFile(req.file);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(400).json({ message: 'Due date must be a valid future date' });
  }

  try {
    const assignment = await Assignment.create({
      title: title.trim(),
      description,
      dueDate: parsedDueDate,
      createdBy: req.user._id,
      ...(req.file && {
        attachment: {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
        },
      }),
    });

    return res.status(201).json(assignment);
  } catch (error) {
    try {
      await deleteUploadedFile(req.file);
    } catch (cleanupError) {
      console.error('Failed to delete uploaded file after assignment creation failed:', cleanupError);
    }
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createAssignment, getInstructorAssignments, getStudentAssignments };