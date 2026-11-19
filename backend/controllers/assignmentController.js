const Assignment = require('../models/Assignment');

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

module.exports = { createAssignment };