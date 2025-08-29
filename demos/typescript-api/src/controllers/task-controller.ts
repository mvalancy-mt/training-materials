import { Request, Response } from 'express';
import { TaskModel, CreateTaskSchema, UpdateTaskSchema, TaskStatus, TaskPriority } from '../models/task';
import { z } from 'zod';

export class TaskController {
  private taskModel: TaskModel;

  constructor() {
    this.taskModel = new TaskModel();
  }

  createTask = (req: Request, res: Response): void => {
    try {
      const validatedData = CreateTaskSchema.parse(req.body);
      const task = this.taskModel.createTask(validatedData);

      res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getAllTasks = (req: Request, res: Response): void => {
    try {
      const { status, priority } = req.query;

      let tasks = this.taskModel.getAllTasks();

      if (status && typeof status === 'string') {
        const statusResult = TaskStatus.safeParse(status);
        if (statusResult.success) {
          tasks = this.taskModel.getTasksByStatus(statusResult.data);
        }
      }

      if (priority && typeof priority === 'string') {
        const priorityResult = TaskPriority.safeParse(priority);
        if (priorityResult.success) {
          tasks = tasks.filter(task => task.priority === priorityResult.data);
        }
      }

      res.json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getTaskById = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const task = this.taskModel.getTaskById(id);

      if (!task) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  updateTask = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const validatedData = UpdateTaskSchema.parse(req.body);

      const updatedTask = this.taskModel.updateTask(id, validatedData);

      if (!updatedTask) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.json({
        success: true,
        data: updatedTask,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.errors,
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  deleteTask = (req: Request, res: Response): void => {
    try {
      const { id } = req.params;
      const deleted = this.taskModel.deleteTask(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Task not found',
        });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getTaskStats = (req: Request, res: Response): void => {
    try {
      const allTasks = this.taskModel.getAllTasks();

      const stats = {
        total: allTasks.length,
        byStatus: {
          pending: this.taskModel.getTasksByStatus('pending').length,
          'in-progress': this.taskModel.getTasksByStatus('in-progress').length,
          completed: this.taskModel.getTasksByStatus('completed').length,
          cancelled: this.taskModel.getTasksByStatus('cancelled').length,
        },
        byPriority: {
          low: this.taskModel.getTasksByPriority('low').length,
          medium: this.taskModel.getTasksByPriority('medium').length,
          high: this.taskModel.getTasksByPriority('high').length,
          critical: this.taskModel.getTasksByPriority('critical').length,
        },
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };

  getTaskModel(): TaskModel {
    return this.taskModel;
  }
}
