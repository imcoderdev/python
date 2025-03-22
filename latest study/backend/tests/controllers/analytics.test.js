const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const {
  testUser,
  testStudyPlan,
  testSession,
  createTestUser,
  createTestStudyPlan,
  createTestAnalytics,
  getAuthToken,
  clearDatabase
} = require('../helpers/testUtils');

describe('Analytics Controller', () => {
  let token;
  let userId;
  let studyPlanId;

  beforeEach(async () => {
    await clearDatabase();
    
    // Create test user and get token
    const user = await createTestUser();
    userId = user._id;
    token = await getAuthToken(user);

    // Create test study plan
    const studyPlan = await createTestStudyPlan(userId);
    studyPlanId = studyPlan._id;

    // Create test analytics
    await createTestAnalytics(studyPlanId, userId);
  });

  describe('GET /api/analytics/:id', () => {
    it('should get analytics for a study plan', async () => {
      const response = await request(app)
        .get(`/api/analytics/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('studyPlan', studyPlanId.toString());
      expect(response.body).toHaveProperty('student', userId.toString());
      expect(response.body).toHaveProperty('studySessions');
      expect(response.body).toHaveProperty('weeklyProgress');
      expect(response.body).toHaveProperty('subjectAnalytics');
      expect(response.body).toHaveProperty('engagementMetrics');
      expect(response.body).toHaveProperty('improvementAreas');
    });

    it('should return 404 for non-existent analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/analytics/${studyPlanId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/analytics/:id/session', () => {
    it('should update study session data', async () => {
      const response = await request(app)
        .post(`/api/analytics/${studyPlanId}/session`)
        .set('Authorization', `Bearer ${token}`)
        .send(testSession);

      expect(response.status).toBe(200);
      expect(response.body.studySessions).toHaveLength(1);
      expect(response.body.studySessions[0]).toMatchObject(testSession);
      expect(response.body.weeklyProgress[0]).toHaveProperty('totalStudyTime', testSession.duration);
      expect(response.body.subjectAnalytics[0]).toHaveProperty('totalStudyTime', testSession.duration);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/analytics/${studyPlanId}/session`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/analytics/${studyPlanId}/session`)
        .send(testSession);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/analytics/:id/insights', () => {
    beforeEach(async () => {
      // Add some study sessions
      const analytics = await Analytics.findOne({
        studyPlan: studyPlanId,
        student: userId
      });

      analytics.studySessions.push({
        date: new Date(),
        duration: 60,
        subject: 'Mathematics',
        topic: 'Algebra',
        engagement: 85,
        notes: 'Test notes'
      });

      await analytics.save();
    });

    it('should get study insights', async () => {
      const response = await request(app)
        .get(`/api/analytics/${studyPlanId}/insights`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('bestStudyTime');
      expect(response.body).toHaveProperty('mostProductiveSubject');
      expect(response.body).toHaveProperty('consistencyTrend');
      expect(response.body).toHaveProperty('improvementSuggestions');
    });

    it('should return 404 for non-existent analytics', async () => {
      const response = await request(app)
        .get(`/api/analytics/${new mongoose.Types.ObjectId()}/insights`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/analytics/${studyPlanId}/insights`);

      expect(response.status).toBe(401);
    });
  });
}); 