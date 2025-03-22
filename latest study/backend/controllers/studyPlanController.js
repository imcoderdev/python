const StudyPlan = require('../models/StudyPlan');
const Analytics = require('../models/Analytics');
const { validationResult } = require('express-validator');

// Create new study plan
exports.createStudyPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const studyPlan = new StudyPlan({
      ...req.body,
      student: req.user._id
    });

    await studyPlan.save();

    // Initialize analytics for the study plan
    const analytics = new Analytics({
      student: req.user._id,
      studyPlan: studyPlan._id
    });
    await analytics.save();

    res.status(201).json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all study plans for the current user
exports.getStudyPlans = async (req, res) => {
  try {
    const studyPlans = await StudyPlan.find({ student: req.user._id })
      .populate('feedback.from', 'name role')
      .sort({ createdAt: -1 });
    res.json(studyPlans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific study plan
exports.getStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      student: req.user._id
    }).populate('feedback.from', 'name role');

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    res.json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update study plan
exports.updateStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      studyPlan[key] = req.body[key];
    });

    await studyPlan.save();
    res.json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete study plan
exports.deleteStudyPlan = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Delete associated analytics
    await Analytics.findOneAndDelete({
      studyPlan: req.params.id
    });

    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update topic status
exports.updateTopicStatus = async (req, res) => {
  try {
    const { subjectIndex, topicIndex, status } = req.body;
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    studyPlan.subjects[subjectIndex].topics[topicIndex].status = status;
    await studyPlan.save();

    // Update analytics
    await Analytics.findOneAndUpdate(
      { studyPlan: studyPlan._id },
      {
        $push: {
          studySessions: {
            date: new Date(),
            subject: studyPlan.subjects[subjectIndex].name,
            topic: studyPlan.subjects[subjectIndex].topics[topicIndex].name,
            engagement: 100 // Default value, can be adjusted based on actual metrics
          }
        }
      }
    );

    res.json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add feedback to study plan
exports.addFeedback = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    studyPlan.feedback.push({
      from: req.user._id,
      content: req.body.content,
      type: req.body.type,
      subject: req.body.subject,
      topic: req.body.topic
    });

    await studyPlan.save();
    res.json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update study plan progress
exports.updateProgress = async (req, res) => {
  try {
    const studyPlan = await StudyPlan.findOne({
      _id: req.params.id,
      student: req.user._id
    });

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    // Calculate overall progress
    let totalTopics = 0;
    let completedTopics = 0;

    studyPlan.subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        totalTopics++;
        if (topic.status === 'completed') {
          completedTopics++;
        }
      });
    });

    studyPlan.progress.overallProgress = (completedTopics / totalTopics) * 100;

    // Update subject progress
    studyPlan.progress.subjectProgress = studyPlan.subjects.map(subject => {
      const subjectTopics = subject.topics.length;
      const completedSubjectTopics = subject.topics.filter(
        topic => topic.status === 'completed'
      ).length;

      return {
        subject: subject.name,
        progress: (completedSubjectTopics / subjectTopics) * 100
      };
    });

    await studyPlan.save();
    res.json(studyPlan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 