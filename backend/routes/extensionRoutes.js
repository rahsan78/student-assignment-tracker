const express = require('express');
const {
  createExtensionRequest,
  getStudentExtensionRequests,
  getPendingExtensionRequests,
  decideExtensionRequest,
} = require('../controllers/extensionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/pending', protect, authorize('Instructor'), getPendingExtensionRequests);
router.get('/', protect, authorize('Student'), getStudentExtensionRequests);
router.post('/', protect, authorize('Student'), createExtensionRequest);
router.put('/:id/decision', protect, authorize('Instructor'), decideExtensionRequest);

module.exports = router;
