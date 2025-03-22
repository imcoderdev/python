const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const {
  testUser,
  testStudyPlan,
  testFeedback,
  createTestUser,
  createTestStudyPlan,
  createTestFeedback,
  getAuthToken,
  clearDatabase
} = require('../helpers/testUtils');
const User = require('../../models/User');
const StudyPlan = require('../../models/StudyPlan');
const Feedback = require('../../models/Feedback');

describe('Feedback Controller', () => {
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

  describe('GET /api/feedback/:id', () => {
    beforeEach(async () => {
      await createTestFeedback(studyPlanId, userId);
    });

    it('should get all feedback for a study plan', async () => {
      const response = await request(app)
        .get(`/api/feedback/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('content', testFeedback.content);
      expect(response.body[0]).toHaveProperty('type', testFeedback.type);
      expect(response.body[0]).toHaveProperty('user');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/feedback/${studyPlanId}`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/feedback/:id', () => {
    it('should add feedback to a study plan', async () => {
      const response = await request(app)
        .post(`/api/feedback/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(testFeedback);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('content', testFeedback.content);
      expect(response.body).toHaveProperty('type', testFeedback.type);
      expect(response.body).toHaveProperty('user', userId.toString());
      expect(response.body).toHaveProperty('studyPlan', studyPlanId.toString());

      // Check if feedback was added to study plan
      const studyPlan = await StudyPlan.findById(studyPlanId);
      expect(studyPlan.feedback).toContainEqual(response.body._id);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/feedback/${studyPlanId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/feedback/${studyPlanId}`)
        .send(testFeedback);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/feedback/:id/:feedbackId', () => {
    let feedbackId;

    beforeEach(async () => {
      const feedback = await createTestFeedback(studyPlanId, userId);
      feedbackId = feedback._id;
    });

    it('should update feedback', async () => {
      const updateData = {
        content: 'Updated feedback content'
      };

      const response = await request(app)
        .put(`/api/feedback/${studyPlanId}/${feedbackId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content', updateData.content);
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should not update feedback of another user', async () => {
      const otherUser = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const otherFeedback = await createTestFeedback(studyPlanId, otherUser._id);
      const response = await request(app)
        .put(`/api/feedback/${studyPlanId}/${otherFeedback._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated content' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/feedback/:id/:feedbackId', () => {
    let feedbackId;

    beforeEach(async () => {
      const feedback = await createTestFeedback(studyPlanId, userId);
      feedbackId = feedback._id;
    });

    it('should delete feedback', async () => {
      const response = await request(app)
        .delete(`/api/feedback/${studyPlanId}/${feedbackId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);

      const deletedFeedback = await Feedback.findById(feedbackId);
      expect(deletedFeedback).toBeNull();

      // Check if feedback was removed from study plan
      const studyPlan = await StudyPlan.findById(studyPlanId);
      expect(studyPlan.feedback).not.toContainEqual(feedbackId);
    });

    it('should not delete feedback of another user', async () => {
      const otherUser = await createTestUser({
        ...testUser,
        email: 'other@example.com'
      });

      const otherFeedback = await createTestFeedback(studyPlanId, otherUser._id);
      const response = await request(app)
        .delete(`/api/feedback/${studyPlanId}/${otherFeedback._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);

      const feedback = await Feedback.findById(otherFeedback._id);
      expect(feedback).toBeTruthy();
    });
  });

  describe('GET /api/feedback/:id/stats', () => {
    beforeEach(async () => {
      await createTestFeedback(studyPlanId, userId);
    });

    it('should get feedback statistics', async () => {
      const response = await request(app)
        .get(`/api/feedback/${studyPlanId}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total', 1);
      expect(response.body).toHaveProperty('byType');
      expect(response.body).toHaveProperty('byUser');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/feedback/${studyPlanId}/stats`);

      expect(response.status).toBe(401);
    });
  });
}); 