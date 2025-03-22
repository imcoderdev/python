const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studyPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan',
    required: true
  },
  studySessions: [{
    date: Date,
    duration: Number, // in minutes
    subject: String,
    topic: String,
    engagement: {
      type: Number,
      min: 0,
      max: 100
    },
    notes: String
  }],
  weeklyProgress: [{
    weekStart: Date,
    weekEnd: Date,
    totalStudyTime: Number,
    completedTopics: Number,
    averageEngagement: Number,
    goalsAchieved: Number
  }],
  subjectAnalytics: [{
    subject: String,
    totalStudyTime: Number,
    completedTopics: Number,
    averageEngagement: Number,
    lastStudied: Date
  }],
  engagementMetrics: {
    averageDailyStudyTime: Number,
    consistencyScore: Number,
    focusScore: Number,
    productivityScore: Number
  },
  improvementAreas: [{
    subject: String,
    topic: String,
    reason: String,
    suggestedActions: [String]
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    type: String // 'milestone', 'goal', 'streak', etc.
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update the lastUpdated timestamp before saving
analyticsSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics; 