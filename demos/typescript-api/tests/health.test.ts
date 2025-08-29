import request from 'supertest';
import { app } from '../src/app';

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        status: expect.stringMatching(/^(healthy|degraded|unhealthy)$/),
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: '1.0.0',
        environment: expect.any(String),
        memory: {
          used: expect.any(Number),
          total: expect.any(Number),
          percentage: expect.any(Number),
        },
      });
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.data.timestamp);
    });

    it('should have reasonable memory usage', async () => {
      const response = await request(app).get('/health');

      const memory = response.body.data.memory;
      expect(memory.percentage).toBeGreaterThanOrEqual(0);
      expect(memory.percentage).toBeLessThanOrEqual(100);
      expect(memory.used).toBeLessThanOrEqual(memory.total);
    });
  });

  describe('GET /ready', () => {
    it('should return readiness status', async () => {
      const response = await request(app)
        .get('/ready')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        status: 'ready',
        timestamp: expect.any(String),
      });
    });

    it('should have valid timestamp format', async () => {
      const response = await request(app).get('/ready');

      const timestamp = new Date(response.body.data.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.data.timestamp);
    });
  });
});

describe('Error Handling', () => {
  it('should handle 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/non-existent-route')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Route GET /non-existent-route not found');
  });

  it('should handle invalid JSON in request body', async () => {
    const response = await request(app)
      .post('/api/v1/tasks')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }')
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
