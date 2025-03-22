const Feedback = require('../models/Feedback');
const StudyPlan = require('../models/StudyPlan');

// Get feedback for a study plan
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      studyPlan: req.params.id
    }).populate('user', 'name role');

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add feedback to a study plan
exports.addFeedback = async (req, res) => {
  try {
    const { content, type } = req.body;
    const studyPlan = await StudyPlan.findById(req.params.id);

    if (!studyPlan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    const feedback = new Feedback({
      studyPlan: req.params.id,
      user: req.user._id,
      content,
      type
    });

    await feedback.save();

    // Update study plan with feedback
    studyPlan.feedback.push(feedback._id);
    await studyPlan.save();

    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    const { content } = req.body;
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user is the author of the feedback
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }

    feedback.content = content;
    feedback.updatedAt = new Date();
    await feedback.save();

    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user is the author of the feedback
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    // Remove feedback from study plan
    const studyPlan = await StudyPlan.findById(feedback.studyPlan);
    if (studyPlan) {
      studyPlan.feedback = studyPlan.feedback.filter(
        id => id.toString() !== feedback._id.toString()
      );
      await studyPlan.save();
    }

    await feedback.remove();
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get feedback statistics
exports.getFeedbackStats = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      studyPlan: req.params.id
    });

    const stats = {
      total: feedback.length,
      byType: feedback.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {}),
      byUser: feedback.reduce((acc, curr) => {
        acc[curr.user.toString()] = (acc[curr.user.toString()] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 