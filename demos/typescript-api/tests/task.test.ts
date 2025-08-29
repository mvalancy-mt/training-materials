import request from 'supertest';
import { app } from '../src/app';
import { TaskModel } from '../src/models/task';

describe('Task API Endpoints', () => {
  let taskModel: TaskModel;

  beforeEach(() => {
    taskModel = new TaskModel();
  });

  afterEach(() => {
    taskModel.clearAllTasks();
  });

  describe('POST /api/v1/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        priority: 'high',
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'pending',
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should reject task with empty title', async () => {
      const taskData = {
        title: '',
        description: 'This task has no title',
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject task with invalid priority', async () => {
      const taskData = {
        title: 'Test Task',
        priority: 'invalid-priority',
      };

      const response = await request(app)
        .post('/api/v1/tasks')
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/tasks').send({
        title: 'Task 1',
        priority: 'high',
      });
      await request(app).post('/api/v1/tasks').send({
        title: 'Task 2',
        priority: 'low',
      });
    });

    it('should return all tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?status=pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((task: any) => task.status === 'pending')).toBe(true);
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app)
        .get('/api/v1/tasks?priority=high')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((task: any) => task.priority === 'high')).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/tasks').send({
        title: 'Test Task',
        priority: 'medium',
      });
      taskId = response.body.data.id;
    });

    it('should return a task by id', async () => {
      const response = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(taskId);
      expect(response.body.data.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/api/v1/tasks/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/tasks').send({
        title: 'Test Task',
        priority: 'medium',
      });
      taskId = response.body.data.id;
    });

    it('should update a task', async () => {
      const updates = {
        title: 'Updated Task',
        status: 'in-progress',
        priority: 'high',
      };

      const response = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(updates);
      expect(response.body.data.updatedAt).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/v1/tasks/non-existent-id')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const response = await request(app).post('/api/v1/tasks').send({
        title: 'Test Task',
        priority: 'medium',
      });
      taskId = response.body.data.id;
    });

    it('should delete a task', async () => {
      await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .expect(204);

      await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .expect(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/api/v1/tasks/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('GET /api/v1/tasks/stats', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/tasks').send({
        title: 'Task 1',
        priority: 'high',
      });
      await request(app).post('/api/v1/tasks').send({
        title: 'Task 2',
        priority: 'low',
      });
    });

    it('should return task statistics', async () => {
      const response = await request(app)
        .get('/api/v1/tasks/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        total: 2,
        byStatus: {
          pending: 2,
          'in-progress': 0,
          completed: 0,
          cancelled: 0,
        },
        byPriority: {
          low: 1,
          medium: 0,
          high: 1,
          critical: 0,
        },
      });
    });
  });
});
