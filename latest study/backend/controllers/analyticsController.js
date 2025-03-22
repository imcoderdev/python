const Analytics = require('../models/Analytics');
const StudyPlan = require('../models/StudyPlan');

// Get analytics for a study plan
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.findOne({
      studyPlan: req.params.id,
      student: req.user._id
    });

    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update study session
exports.updateStudySession = async (req, res) => {
  try {
    const { duration, subject, topic, engagement, notes } = req.body;
    const analytics = await Analytics.findOne({
      studyPlan: req.params.id,
      student: req.user._id
    });

    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    // Add new study session
    analytics.studySessions.push({
      date: new Date(),
      duration,
      subject,
      topic,
      engagement,
      notes
    });

    // Update weekly progress
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let weeklyProgress = analytics.weeklyProgress.find(
      week => week.weekStart <= now && week.weekEnd >= now
    );

    if (!weeklyProgress) {
      weeklyProgress = {
        weekStart,
        weekEnd,
        totalStudyTime: 0,
        completedTopics: 0,
        averageEngagement: 0,
        goalsAchieved: 0
      };
      analytics.weeklyProgress.push(weeklyProgress);
    }

    // Update weekly metrics
    weeklyProgress.totalStudyTime += duration;
    weeklyProgress.averageEngagement = 
      (weeklyProgress.averageEngagement * (analytics.studySessions.length - 1) + engagement) / 
      analytics.studySessions.length;

    // Update subject analytics
    let subjectAnalytics = analytics.subjectAnalytics.find(
      sa => sa.subject === subject
    );

    if (!subjectAnalytics) {
      subjectAnalytics = {
        subject,
        totalStudyTime: 0,
        completedTopics: 0,
        averageEngagement: 0,
        lastStudied: new Date()
      };
      analytics.subjectAnalytics.push(subjectAnalytics);
    }

    subjectAnalytics.totalStudyTime += duration;
    subjectAnalytics.averageEngagement = 
      (subjectAnalytics.averageEngagement * (analytics.studySessions.length - 1) + engagement) / 
      analytics.studySessions.length;
    subjectAnalytics.lastStudied = new Date();

    // Update engagement metrics
    const recentSessions = analytics.studySessions.slice(-7); // Last 7 sessions
    analytics.engagementMetrics = {
      averageDailyStudyTime: recentSessions.reduce((acc, session) => acc + session.duration, 0) / 7,
      consistencyScore: calculateConsistencyScore(analytics.studySessions),
      focusScore: calculateFocusScore(analytics.studySessions),
      productivityScore: calculateProductivityScore(analytics.studySessions)
    };

    // Update improvement areas
    analytics.improvementAreas = await generateImprovementAreas(analytics);

    await analytics.save();
    res.json(analytics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get study insights
exports.getStudyInsights = async (req, res) => {
  try {
    const analytics = await Analytics.findOne({
      studyPlan: req.params.id,
      student: req.user._id
    });

    if (!analytics) {
      return res.status(404).json({ message: 'Analytics not found' });
    }

    const insights = {
      bestStudyTime: findBestStudyTime(analytics.studySessions),
      mostProductiveSubject: findMostProductiveSubject(analytics.subjectAnalytics),
      consistencyTrend: analyzeConsistencyTrend(analytics.weeklyProgress),
      improvementSuggestions: generateImprovementSuggestions(analytics)
    };

    res.json(insights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions
const calculateConsistencyScore = (sessions) => {
  if (sessions.length < 2) return 0;

  const dates = sessions.map(session => new Date(session.date));
  const intervals = [];
  
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i] - dates[i - 1]);
  }

  const averageInterval = intervals.reduce((acc, val) => acc + val, 0) / intervals.length;
  const variance = intervals.reduce((acc, val) => acc + Math.pow(val - averageInterval, 2), 0) / intervals.length;
  
  return Math.max(0, 100 - (variance / (24 * 60 * 60 * 1000)) * 10);
};

const calculateFocusScore = (sessions) => {
  if (sessions.length === 0) return 0;

  const averageEngagement = sessions.reduce((acc, session) => acc + session.engagement, 0) / sessions.length;
  const averageDuration = sessions.reduce((acc, session) => acc + session.duration, 0) / sessions.length;

  return (averageEngagement * 0.7 + (Math.min(averageDuration / 120, 1) * 100) * 0.3);
};

const calculateProductivityScore = (sessions) => {
  if (sessions.length === 0) return 0;

  const totalTime = sessions.reduce((acc, session) => acc + session.duration, 0);
  const averageEngagement = sessions.reduce((acc, session) => acc + session.engagement, 0) / sessions.length;

  return (totalTime / (7 * 24 * 60)) * 100 * 0.5 + averageEngagement * 0.5;
};

const findBestStudyTime = (sessions) => {
  if (sessions.length === 0) return null;

  const timeSlots = new Array(24).fill(0);
  sessions.forEach(session => {
    const hour = new Date(session.date).getHours();
    timeSlots[hour] += session.engagement;
  });

  const bestHour = timeSlots.indexOf(Math.max(...timeSlots));
  return `${bestHour}:00`;
};

const findMostProductiveSubject = (subjectAnalytics) => {
  if (subjectAnalytics.length === 0) return null;

  return subjectAnalytics.reduce((best, current) => 
    current.averageEngagement > best.averageEngagement ? current : best
  );
};

const analyzeConsistencyTrend = (weeklyProgress) => {
  if (weeklyProgress.length < 2) return 'insufficient data';

  const recentWeeks = weeklyProgress.slice(-4);
  const trend = recentWeeks.reduce((acc, week, index) => {
    if (index === 0) return 0;
    return acc + (week.totalStudyTime - recentWeeks[index - 1].totalStudyTime);
  }, 0);

  if (trend > 0) return 'improving';
  if (trend < 0) return 'declining';
  return 'stable';
};

const generateImprovementSuggestions = (analytics) => {
  const suggestions = [];

  // Check study time consistency
  if (analytics.engagementMetrics.consistencyScore < 70) {
    suggestions.push({
      type: 'consistency',
      message: 'Try to maintain a more consistent study schedule',
      action: 'Set specific study times and stick to them'
    });
  }

  // Check focus
  if (analytics.engagementMetrics.focusScore < 70) {
    suggestions.push({
      type: 'focus',
      message: 'Work on improving your focus during study sessions',
      action: 'Try the Pomodoro technique or study in shorter, focused intervals'
    });
  }

  // Check subject balance
  const subjectAnalytics = analytics.subjectAnalytics;
  const averageTime = subjectAnalytics.reduce((acc, subject) => acc + subject.totalStudyTime, 0) / subjectAnalytics.length;
  
  subjectAnalytics.forEach(subject => {
    if (subject.totalStudyTime < averageTime * 0.5) {
      suggestions.push({
        type: 'balance',
        message: `Consider spending more time on ${subject.subject}`,
        action: 'Adjust your schedule to include more study time for this subject'
      });
    }
  });

  return suggestions;
};

const generateImprovementAreas = async (analytics) => {
  const improvementAreas = [];

  // Analyze subject performance
  analytics.subjectAnalytics.forEach(subject => {
    if (subject.averageEngagement < 70) {
      improvementAreas.push({
        subject: subject.subject,
        reason: 'Low engagement during study sessions',
        suggestedActions: [
          'Try different study methods',
          'Break down topics into smaller chunks',
          'Use active recall techniques'
        ]
      });
    }
  });

  // Analyze study patterns
  if (analytics.engagementMetrics.consistencyScore < 70) {
    improvementAreas.push({
      subject: 'General',
      reason: 'Inconsistent study schedule',
      suggestedActions: [
        'Create a daily study routine',
        'Set reminders for study sessions',
        'Track your study time more consistently'
      ]
    });
  }

  return improvementAreas;
}; 