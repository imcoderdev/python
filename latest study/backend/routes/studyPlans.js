const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth, checkRole } = require('../middleware/auth');
const {
  createStudyPlan,
  getStudyPlans,
  getStudyPlan,
  updateStudyPlan,
  deleteStudyPlan,
  updateTopicStatus,
  addFeedback,
  updateProgress
} = require('../controllers/studyPlanController');

// Validation middleware
const studyPlanValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('subjects').isArray().withMessage('Subjects must be an array'),
  body('subjects.*.name').trim().notEmpty().withMessage('Subject name is required'),
  body('subjects.*.topics').isArray().withMessage('Topics must be an array'),
  body('subjects.*.topics.*.name').trim().notEmpty().withMessage('Topic name is required'),
  body('schedule').optional().isArray().withMessage('Schedule must be an array'),
  body('goals').optional().isArray().withMessage('Goals must be an array')
];

const topicStatusValidation = [
  body('subjectIndex').isInt().withMessage('Subject index must be a number'),
  body('topicIndex').isInt().withMessage('Topic index must be a number'),
  body('status')
    .isIn(['not-started', 'in-progress', 'completed'])
    .withMessage('Invalid status')
];

const feedbackValidation = [
  body('content').trim().notEmpty().withMessage('Feedback content is required'),
  body('type')
    .isIn(['general', 'subject-specific', 'schedule', 'goal'])
    .withMessage('Invalid feedback type'),
  body('subject').optional().trim(),
  body('topic').optional().trim()
];

// Routes
router.post('/', auth, studyPlanValidation, createStudyPlan);
router.get('/', auth, getStudyPlans);
router.get('/:id', auth, getStudyPlan);
router.put('/:id', auth, studyPlanValidation, updateStudyPlan);
router.delete('/:id', auth, deleteStudyPlan);
router.put('/:id/topic-status', auth, topicStatusValidation, updateTopicStatus);
router.post('/:id/feedback', auth, checkRole(['parent', 'tutor']), feedbackValidation, addFeedback);
router.put('/:id/progress', auth, updateProgress);

module.exports = router; 