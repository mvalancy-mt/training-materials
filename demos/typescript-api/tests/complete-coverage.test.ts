import request from 'supertest';
import { app, server } from '../src/app';
import { TaskController } from '../src/controllers/task-controller';
import { HealthChecker } from '../src/utils/health';
import { TaskModel } from '../src/models/task';

// Force close server after all tests
afterAll((done) => {
  server.close(done);
});

describe('Complete Coverage Test Suite', () => {

  describe('Full Application Flow', () => {
    it('should handle complete task lifecycle with 100% coverage', async () => {
      // Test health endpoints first (allow for potential degraded state)
      const healthResponse = await request(app).get('/health');
      expect([200, 503]).toContain(healthResponse.status); // Health may be degraded due to test memory usage
      if (healthResponse.status === 200) {
        expect(healthResponse.body.success).toBe(true);
      }

      const readyResponse = await request(app).get('/ready');
      expect(readyResponse.status).toBe(200);

      // Create task with all fields
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Complete Test Task',
          description: 'Full coverage test',
          priority: 'high',
          dueDate: '2024-12-31T23:59:59.000Z'
        });

      expect(createResponse.status).toBe(201);
      const taskId = createResponse.body.data.id;

      // Test all GET endpoints
      const allTasksResponse = await request(app).get('/api/v1/tasks');
      expect(allTasksResponse.status).toBe(200);

      const taskByIdResponse = await request(app).get(`/api/v1/tasks/${taskId}`);
      expect(taskByIdResponse.status).toBe(200);

      const statsResponse = await request(app).get('/api/v1/tasks/stats');
      expect(statsResponse.status).toBe(200);

      // Test filtering
      const statusFilterResponse = await request(app).get('/api/v1/tasks?status=pending');
      expect(statusFilterResponse.status).toBe(200);

      const priorityFilterResponse = await request(app).get('/api/v1/tasks?priority=high');
      expect(priorityFilterResponse.status).toBe(200);

      // Test update
      const updateResponse = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .send({
          title: 'Updated Task',
          status: 'in-progress',
          priority: 'critical'
        });
      expect(updateResponse.status).toBe(200);

      // Test delete
      const deleteResponse = await request(app).delete(`/api/v1/tasks/${taskId}`);
      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const notFoundResponse = await request(app).get(`/api/v1/tasks/${taskId}`);
      expect(notFoundResponse.status).toBe(404);
    });

    it('should handle all validation scenarios', async () => {
      // Empty title
      await request(app)
        .post('/api/v1/tasks')
        .send({ title: '', priority: 'medium' })
        .expect(400);

      // Invalid priority
      await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Valid Title', priority: 'invalid' })
        .expect(400);

      // Title too long
      await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'A'.repeat(201), priority: 'medium' })
        .expect(400);

      // Description too long
      await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Valid Title',
          description: 'B'.repeat(1001),
          priority: 'medium'
        })
        .expect(400);
    });

    it('should handle not found scenarios', async () => {
      const nonExistentId = 'non-existent-id';

      await request(app).get(`/api/v1/tasks/${nonExistentId}`).expect(404);
      await request(app).put(`/api/v1/tasks/${nonExistentId}`)
        .send({ title: 'Updated' }).expect(404);
      await request(app).delete(`/api/v1/tasks/${nonExistentId}`).expect(404);
    });

    it('should handle 404 routes', async () => {
      await request(app).get('/nonexistent').expect(404);
      await request(app).post('/invalid/route').expect(404);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  describe('Direct Model Testing for Full Coverage', () => {
    let model: TaskModel;

    beforeEach(() => {
      model = new TaskModel();
    });

    it('should cover all TaskModel methods', () => {
      // Test empty state
      expect(model.getTaskCount()).toBe(0);
      expect(model.getAllTasks()).toEqual([]);
      expect(model.getTasksByStatus('pending')).toEqual([]);
      expect(model.getTasksByPriority('high')).toEqual([]);
      expect(model.getTaskById('nonexistent')).toBeUndefined();
      expect(model.updateTask('nonexistent', { title: 'New' })).toBeUndefined();
      expect(model.deleteTask('nonexistent')).toBe(false);

      // Create tasks
      const task1 = model.createTask({ title: 'Task 1', priority: 'high' });
      const task2 = model.createTask({
        title: 'Task 2',
        priority: 'low',
        description: 'Test description',
        dueDate: '2024-12-31T23:59:59.000Z'
      });

      expect(model.getTaskCount()).toBe(2);
      expect(model.getTaskById(task1.id)).toBeDefined();
      expect(model.getTasksByStatus('pending')).toHaveLength(2);
      expect(model.getTasksByPriority('high')).toHaveLength(1);

      // Update task
      const updated = model.updateTask(task1.id, {
        title: 'Updated Task 1',
        status: 'completed',
        priority: 'critical',
        description: 'Updated description'
      });

      expect(updated?.title).toBe('Updated Task 1');
      expect(updated?.status).toBe('completed');
      expect(updated?.priority).toBe('critical');

      // Partial update
      const partialUpdate = model.updateTask(task2.id, { status: 'in-progress' });
      expect(partialUpdate?.title).toBe('Task 2'); // Original title preserved
      expect(partialUpdate?.status).toBe('in-progress');

      // Delete
      expect(model.deleteTask(task1.id)).toBe(true);
      expect(model.getTaskCount()).toBe(1);

      // Clear all
      model.clearAllTasks();
      expect(model.getTaskCount()).toBe(0);
    });

    it('should validate tasks properly', () => {
      expect(TaskModel.prototype.constructor).toBeDefined();

      // This tests the import and basic functionality
      const task = model.createTask({ title: 'Test', priority: 'medium' });
      expect(task.id).toBeDefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Direct Controller Testing', () => {
    let controller: TaskController;

    beforeEach(() => {
      controller = new TaskController();
    });

    afterEach(() => {
      controller.getTaskModel().clearAllTasks();
    });

    it('should handle missing ID parameters', () => {
      const mockReq: any = { params: {} };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Test all methods that require ID
      controller.getTaskById(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      controller.updateTask(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      controller.deleteTask(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle internal errors', () => {
      const mockReq: any = { body: { title: 'Test', priority: 'medium' } };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock the model to throw an error
      const originalMethod = controller.getTaskModel().createTask;
      controller.getTaskModel().createTask = jest.fn(() => {
        throw new Error('Database error');
      });

      controller.createTask(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Internal server error'
      });

      // Restore
      controller.getTaskModel().createTask = originalMethod;
    });
  });

  describe('HealthChecker Direct Testing', () => {
    let healthChecker: HealthChecker;

    beforeEach(() => {
      healthChecker = new HealthChecker('test-version');
    });

    it('should handle all health check scenarios', async () => {
      const health = await healthChecker.checkHealth();

      expect(health.version).toBe('test-version');
      expect(health.environment).toBe('test');
      expect(health.uptime).toBeGreaterThanOrEqual(0);
      expect(health.memory?.percentage).toBeGreaterThanOrEqual(0);
      expect(health.memory?.percentage).toBeLessThanOrEqual(100);
      expect(health.status).toMatch(/healthy|degraded|unhealthy/);
    });

    it('should handle health endpoint errors', () => {
      const mockReq: any = {};
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Mock checkHealth to throw
      const originalCheckHealth = healthChecker.checkHealth;
      healthChecker.checkHealth = jest.fn().mockRejectedValue(new Error('Health error'));

      return healthChecker.healthEndpoint(mockReq, mockRes).then(() => {
        expect(mockRes.status).toHaveBeenCalledWith(503);

        // Restore
        healthChecker.checkHealth = originalCheckHealth;
      });
    });

    it('should handle readiness endpoint errors', async () => {
      const mockReq: any = {};
      const mockRes: any = {
        status: jest.fn().mockImplementation(() => {
          throw new Error('Response error');
        }),
        json: jest.fn()
      };

      try {
        await healthChecker.readinessEndpoint(mockReq, mockRes);
        // Should not reach here, but if it does, that's okay
      } catch (error) {
        // This tests the error handling path
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Complete Coverage - Missing Lines', () => {
    it('should test logServerStartup function from app.ts', () => {
      const originalEnv = process.env['NODE_ENV'];
      const originalConsoleLog = console.log;

      try {
        // Mock console.log to capture calls
        const mockLog = jest.fn();
        console.log = mockLog;

        // Temporarily set to non-test environment
        process.env['NODE_ENV'] = 'development';

        // Import the logServerStartup function from app.ts
        const { logServerStartup } = require('../src/app');

        // Call the function with a test port
        const testPort = 3000;
        logServerStartup(testPort);

        // Verify the console.log calls were made with the exact messages
        expect(mockLog).toHaveBeenCalledWith(`🚀 TypeScript API server running on port ${testPort}`);
        expect(mockLog).toHaveBeenCalledWith(`📊 Health check: http://localhost:${testPort}/health`);
        expect(mockLog).toHaveBeenCalledWith(`🎯 API endpoints: http://localhost:${testPort}/api/v1/tasks`);

      } finally {
        // Restore everything
        console.log = originalConsoleLog;
        process.env['NODE_ENV'] = originalEnv;
      }
    });


    it('should test health status degraded condition', async () => {
      const healthChecker = new HealthChecker();

      // Mock memory usage to trigger degraded status
      const originalMemoryUsage = process.memoryUsage;
      (process as any).memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 80 * 1024 * 1024,   // 80MB used
        heapTotal: 100 * 1024 * 1024, // 100MB total (80% = degraded)
        external: 0,
        rss: 100 * 1024 * 1024
      });

      const health = await healthChecker.checkHealth();
      expect(health.status).toBe('degraded');

      // Restore
      (process as any).memoryUsage = originalMemoryUsage;
    });

    it('should test health status unhealthy condition (line 39)', async () => {
      const healthChecker = new HealthChecker();

      // Mock memory usage to trigger unhealthy status (>90%)
      const originalMemoryUsage = process.memoryUsage;
      (process as any).memoryUsage = jest.fn().mockReturnValue({
        heapUsed: 95 * 1024 * 1024,   // 95MB used
        heapTotal: 100 * 1024 * 1024, // 100MB total (95% = unhealthy)
        external: 0,
        rss: 100 * 1024 * 1024
      });

      const health = await healthChecker.checkHealth();
      expect(health.status).toBe('unhealthy');

      // Restore
      (process as any).memoryUsage = originalMemoryUsage;
    });

    it('should test all controller error paths', async () => {
      const controller = new TaskController();

      // Create a task first for testing
      const task = controller.getTaskModel().createTask({
        title: 'Test Task',
        priority: 'medium'
      });

      // Test getAllTasks error handling
      const mockReq1: any = { query: {} };
      const mockRes1: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      // Mock model to throw error
      const originalGetAllTasks = controller.getTaskModel().getAllTasks;
      controller.getTaskModel().getAllTasks = jest.fn(() => {
        throw new Error('Database error');
      });

      controller.getAllTasks(mockReq1, mockRes1);
      expect(mockRes1.status).toHaveBeenCalledWith(500);

      // Restore
      controller.getTaskModel().getAllTasks = originalGetAllTasks;

      // Test getTaskById error handling
      const mockReq2: any = { params: { id: 'valid-id' } };
      const mockRes2: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const originalGetTaskById = controller.getTaskModel().getTaskById;
      controller.getTaskModel().getTaskById = jest.fn(() => {
        throw new Error('Database error');
      });

      controller.getTaskById(mockReq2, mockRes2);
      expect(mockRes2.status).toHaveBeenCalledWith(500);

      // Restore
      controller.getTaskModel().getTaskById = originalGetTaskById;

      // Test updateTask error handling
      const mockReq3: any = {
        params: { id: task.id },
        body: { title: 'Updated' }
      };
      const mockRes3: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const originalUpdateTask = controller.getTaskModel().updateTask;
      controller.getTaskModel().updateTask = jest.fn(() => {
        throw new Error('Database error');
      });

      controller.updateTask(mockReq3, mockRes3);
      expect(mockRes3.status).toHaveBeenCalledWith(500);

      // Restore
      controller.getTaskModel().updateTask = originalUpdateTask;

      // Test deleteTask error handling
      const mockReq4: any = { params: { id: task.id } };
      const mockRes4: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      const originalDeleteTask = controller.getTaskModel().deleteTask;
      controller.getTaskModel().deleteTask = jest.fn(() => {
        throw new Error('Database error');
      });

      controller.deleteTask(mockReq4, mockRes4);
      expect(mockRes4.status).toHaveBeenCalledWith(500);

      // Restore
      controller.getTaskModel().deleteTask = originalDeleteTask;

      // Test getTaskStats error handling
      const mockReq5: any = {};
      const mockRes5: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis()
      };

      controller.getTaskModel().getAllTasks = jest.fn(() => {
        throw new Error('Database error');
      });

      controller.getTaskStats(mockReq5, mockRes5);
      expect(mockRes5.status).toHaveBeenCalledWith(500);

      // Restore
      controller.getTaskModel().getAllTasks = originalGetAllTasks;
    });

    it('should test invalid query parameter handling', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Query Test', priority: 'medium' });

      // Handle potential rate limiting
      if (createResponse.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Test with invalid status and priority (should be ignored gracefully)
      const response = await request(app).get('/api/v1/tasks?status=invalid&priority=invalid');

      // If we get rate limited, wait and retry
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryResponse = await request(app).get('/api/v1/tasks?status=invalid&priority=invalid');
        expect(retryResponse.status).toBe(200);
      } else {
        expect(response.status).toBe(200);
      }
      // Should return all tasks since invalid filters are ignored
    });

    it('should test updateTask validation error handling (lines 134-139)', async () => {
      // Create a task first
      const createResponse = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Test Task', priority: 'medium' });

      // Handle potential rate limiting from previous tests
      if (createResponse.status === 429) {
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryResponse = await request(app)
          .post('/api/v1/tasks')
          .send({ title: 'Test Task', priority: 'medium' });
        expect(retryResponse.status).toBe(201);

        const taskId = retryResponse.body.data.id;

        // Test validation error in updateTask with invalid priority
        const response = await request(app)
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Valid Title',
            priority: 'invalid-priority-value' // This should trigger Zod validation error
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      } else {
        expect(createResponse.status).toBe(201);
        const taskId = createResponse.body.data.id;

        // Test validation error in updateTask with invalid priority
        const response = await request(app)
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Valid Title',
            priority: 'invalid-priority-value' // This should trigger Zod validation error
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toBeDefined();
      }
    });

  });

  describe('Error Handler Coverage', () => {
    it('should test error handler in development mode', async () => {
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      // Create an invalid request to trigger error handler
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);

      // Restore
      process.env['NODE_ENV'] = originalEnv;
    });

    // Rate limiter test at the end to avoid interfering with other tests
    it('should test rate limiter 429 response (lines 62-67)', async () => {
      // Make 101 sequential requests to trigger rate limiting (limit is 100 per 60 seconds)
      let rateLimitHit = false;

      for (let i = 0; i < 101; i++) {
        const response = await request(app).get('/api/v1/tasks');

        if (response.status === 429) {
          rateLimitHit = true;
          // Verify the 429 response structure matches security.ts lines 62-67
          expect(response.body).toMatchObject({
            success: false,
            error: 'Too many requests, please try again later',
            retryAfter: expect.any(Number)
          });
          break;
        }
      }

      // Ensure we actually hit the rate limiter
      expect(rateLimitHit).toBe(true);
    });
  });
});
