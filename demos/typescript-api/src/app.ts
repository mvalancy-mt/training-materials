import express from 'express';
import dotenv from 'dotenv';
import { TaskController } from './controllers/task-controller';
import { HealthChecker } from './utils/health';
import { securityMiddleware, requestLogger, rateLimiter } from './middleware/security';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

dotenv.config();

const app = express();
const port = process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000;

const taskController = new TaskController();
const healthChecker = new HealthChecker('1.0.0');

app.use(...securityMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', rateLimiter(60 * 1000, 100));

app.get('/health', healthChecker.healthEndpoint);
app.get('/ready', healthChecker.readinessEndpoint);

const apiRouter = express.Router();

apiRouter.get('/tasks', taskController.getAllTasks);
apiRouter.post('/tasks', taskController.createTask);
apiRouter.get('/tasks/stats', taskController.getTaskStats);
apiRouter.get('/tasks/:id', taskController.getTaskById);
apiRouter.put('/tasks/:id', taskController.updateTask);
apiRouter.delete('/tasks/:id', taskController.deleteTask);

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, '0.0.0.0', () => {
  if (process.env['NODE_ENV'] !== 'test') {
    console.log(`🚀 TypeScript API server running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🎯 API endpoints: http://localhost:${port}/api/v1/tasks`);
  }
});

export { app, server };
export default app;
