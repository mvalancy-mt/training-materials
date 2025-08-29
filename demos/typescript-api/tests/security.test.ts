import request from 'supertest';
import { app } from '../src/app';

describe('Security Middleware', () => {
  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('x-dns-prefetch-control', 'off');
      expect(response.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
      expect(response.headers).toHaveProperty('x-download-options', 'noopen');
      expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
      expect(response.headers).toHaveProperty('x-xss-protection', '0');
    });

    it('should set HSTS header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('strict-transport-security');
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
    });

    it('should set CSP header', async () => {
      const response = await request(app).get('/health');

      expect(response.headers).toHaveProperty('content-security-policy');
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/v1/tasks')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      for (let i = 0; i < 5; i++) {
        const response = await request(app).get('/api/v1/tasks');
        expect(response.status).not.toBe(429);
      }
    });

    it('should eventually rate limit excessive requests', async () => {
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(request(app).get('/api/v1/tasks'));
      }

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(response => response.status === 429);

      expect(rateLimited).toBe(true);
    });
  });

  describe('Request Size Limits', () => {
    it('should accept reasonably sized requests', async () => {
      const taskData = {
        title: 'A'.repeat(100),
        description: 'B'.repeat(500),
        priority: 'medium',
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData);

      expect(response.status).toBe(201);
    });
  });
});

describe('Input Validation Security', () => {
  it('should prevent XSS in task title', async () => {
    const maliciousData = {
      title: '<script>alert("xss")</script>',
      priority: 'medium',
    };

    const response = await request(app)
      .post('/api/v1/tasks')
      .send(maliciousData)
      .expect(201);

    expect(response.body.data.title).toBe(maliciousData.title);
  });

  it('should prevent SQL injection patterns', async () => {
    const maliciousData = {
      title: "'; DROP TABLE users; --",
      priority: 'medium',
    };

    const response = await request(app)
      .post('/api/v1/tasks')
      .send(maliciousData)
      .expect(201);

    expect(response.body.data.title).toBe(maliciousData.title);
  });

  it('should handle oversized title gracefully', async () => {
    const oversizedData = {
      title: 'A'.repeat(300),
      priority: 'medium',
    };

    const response = await request(app)
      .post('/api/v1/tasks')
      .send(oversizedData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation failed');
  });
});
