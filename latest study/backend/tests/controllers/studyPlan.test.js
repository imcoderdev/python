const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const {
  testUser,
  testStudyPlan,
  createTestUser,
  createTestStudyPlan,
  getAuthToken,
  clearDatabase
} = require('../helpers/testUtils');
const User = require('../../models/User');
const StudyPlan = require('../../models/StudyPlan');

describe('Study Plan Controller', () => {
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
  });

  describe('POST /api/study-plans', () => {
    it('should create a new study plan', async () => {
      const response = await request(app)
        .post('/api/study-plans')
        .set('Authorization', `Bearer ${token}`)
        .send(testStudyPlan);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', testStudyPlan.title);
      expect(response.body).toHaveProperty('description', testStudyPlan.description);
      expect(response.body).toHaveProperty('subjects');
      expect(response.body).toHaveProperty('goals');
      expect(response.body).toHaveProperty('user', userId.toString());
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/study-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/study-plans')
        .send(testStudyPlan);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/study-plans', () => {
    it('should get all study plans for the user', async () => {
      const response = await request(app)
        .get('/api/study-plans')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('title', testStudyPlan.title);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/study-plans');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/study-plans/:id', () => {
    it('should get a specific study plan', async () => {
      const response = await request(app)
        .get(`/api/study-plans/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', testStudyPlan.title);
      expect(response.body).toHaveProperty('_id', studyPlanId.toString());
    });

    it('should return 404 for non-existent study plan', async () => {
      const response = await request(app)
        .get(`/api/study-plans/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/study-plans/:id', () => {
    it('should update a study plan', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description'
      };

      const response = await request(app)
        .put(`/api/study-plans/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('description', updateData.description);
    });

    it('should not update study plan of another user', async () => {
      const otherUser = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const otherStudyPlan = await createTestStudyPlan(otherUser._id);
      const response = await request(app)
        .put(`/api/study-plans/${otherStudyPlan._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/study-plans/:id', () => {
    it('should delete a study plan', async () => {
      const response = await request(app)
        .delete(`/api/study-plans/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedPlan = await StudyPlan.findById(studyPlanId);
      expect(deletedPlan).toBeNull();
    });

    it('should not delete study plan of another user', async () => {
      const otherUser = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const otherStudyPlan = await createTestStudyPlan(otherUser._id);
      const response = await request(app)
        .delete(`/api/study-plans/${otherStudyPlan._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);

      const plan = await StudyPlan.findById(otherStudyPlan._id);
      expect(plan).toBeTruthy();
    });
  });
}); 