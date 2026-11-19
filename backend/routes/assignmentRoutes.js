const express = require('express');
const { createAssignment, getInstructorAssignments } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('Instructor'), getInstructorAssignments);
router.post('/', protect, authorize('Instructor'), createAssignment);

module.exports = router;