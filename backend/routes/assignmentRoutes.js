const express = require('express');
const { createAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('Instructor'), createAssignment);

module.exports = router;