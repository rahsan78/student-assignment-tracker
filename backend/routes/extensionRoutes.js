const express = require('express');
const { createExtensionRequest, getStudentExtensionRequests } = require('../controllers/extensionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, authorize('Student'), getStudentExtensionRequests);
router.post('/', protect, authorize('Student'), createExtensionRequest);

module.exports = router;
