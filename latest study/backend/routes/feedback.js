const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');

// Validation middleware
const feedbackValidation = [
  body('content').notEmpty().withMessage('Feedback content is required'),
  body('type').isIn(['suggestion', 'question', 'comment']).withMessage('Invalid feedback type')
];

// Routes
router.get('/:id', auth, feedbackController.getFeedback);
router.post('/:id', auth, feedbackValidation, feedbackController.addFeedback);
router.put('/:id/:feedbackId', auth, feedbackValidation, feedbackController.updateFeedback);
router.delete('/:id/:feedbackId', auth, feedbackController.deleteFeedback);
router.get('/:id/stats', auth, feedbackController.getFeedbackStats);

module.exports = router; 