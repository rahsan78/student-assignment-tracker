const Assignment = require('../models/Assignment');

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
    const assignmentsWithDueStatus = assignments.map((assignment) => ({
      ...assignment,
      dueStatus: getDueStatus(assignment.dueDate),
    }));

    return res.status(200).json(assignmentsWithDueStatus);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createAssignment = async (req, res) => {
  const { title, description, dueDate } = req.body;

  if (typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime()) || parsedDueDate <= new Date()) {
    return res.status(400).json({ message: 'Due date must be a valid future date' });
  }

  try {
    const assignment = await Assignment.create({
      title: title.trim(),
      description,
      dueDate: parsedDueDate,
      createdBy: req.user._id,
    });

    return res.status(201).json(assignment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createAssignment, getInstructorAssignments, getStudentAssignments };