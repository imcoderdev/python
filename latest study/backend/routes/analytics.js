const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

// Validation middleware
const studySessionValidation = [
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('topic').trim().notEmpty().withMessage('Topic is required'),
  body('engagement')
    .isInt({ min: 0, max: 100 })
    .withMessage('Engagement must be between 0 and 100'),
  body('notes').optional().trim()
];

// Routes
router.get('/:id', auth, analyticsController.getAnalytics);
router.post('/:id/session', auth, studySessionValidation, analyticsController.updateStudySession);
router.get('/:id/insights', auth, analyticsController.getStudyInsights);

module.exports = router; 