const express = require('express');
const { createAssignment, getInstructorAssignments, getStudentAssignments } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('Instructor'), getInstructorAssignments);
router.get('/student', protect, authorize('Student'), getStudentAssignments);
router.post('/', protect, authorize('Instructor'), createAssignment);

module.exports = router;