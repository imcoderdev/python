const mongoose = require('mongoose');
const User = require('../../models/User');
const StudyPlan = require('../../models/StudyPlan');
const Analytics = require('../../models/Analytics');
const Feedback = require('../../models/Feedback');

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'student'
};

const testStudyPlan = {
  title: 'Test Study Plan',
  description: 'Test Description',
  subjects: [
    {
      name: 'Mathematics',
      topics: [
        {
          name: 'Algebra',
          status: 'not_started'
        }
      ]
    }
  ],
  goals: ['Master Algebra']
};

const testFeedback = {
  content: 'Test feedback content',
  type: 'suggestion'
};

const testSession = {
  duration: 60,
  subject: 'Mathematics',
  topic: 'Algebra',
  engagement: 85,
  notes: 'Test notes'
};

async function createTestUser(userData = testUser) {
  return await User.create(userData);
}

async function createTestStudyPlan(userId, studyPlanData = testStudyPlan) {
  return await StudyPlan.create({
    ...studyPlanData,
    user: userId
  });
}

async function createTestFeedback(studyPlanId, userId, feedbackData = testFeedback) {
  return await Feedback.create({
    ...feedbackData,
    studyPlan: studyPlanId,
    user: userId
  });
}

async function createTestAnalytics(studyPlanId, userId) {
  return await Analytics.create({
    studyPlan: studyPlanId,
    student: userId
  });
}

async function getAuthToken(user) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: user.password
    });
  return response.body.token;
}

async function clearDatabase() {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
}

module.exports = {
  testUser,
  testStudyPlan,
  testFeedback,
  testSession,
  createTestUser,
  createTestStudyPlan,
  createTestFeedback,
  createTestAnalytics,
  getAuthToken,
  clearDatabase
}; 