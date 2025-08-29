import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const TaskStatus = z.enum(['pending', 'in-progress', 'completed', 'cancelled']);
export const TaskPriority = z.enum(['low', 'medium', 'high', 'critical']);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: TaskStatus,
  priority: TaskPriority,
  createdAt: z.date(),
  updatedAt: z.date(),
  dueDate: z.date().optional(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: TaskPriority.default('medium'),
  dueDate: z.string().datetime().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  status: TaskStatus.optional(),
});

export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskRequest = z.infer<typeof UpdateTaskSchema>;

export class TaskModel {
  private tasks: Map<string, Task> = new Map();

  createTask(data: CreateTaskRequest): Task {
    const task: Task = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      status: 'pending',
      priority: data.priority ?? 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };

    this.tasks.set(task.id, task);
    return task;
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  updateTask(id: string, updates: UpdateTaskRequest): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
      dueDate: updates.dueDate ? new Date(updates.dueDate) : existing.dueDate,
    };

    this.tasks.set(id, updated);
    return updated;
  }

  deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  getTasksByStatus(status: z.infer<typeof TaskStatus>): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === status);
  }

  getTasksByPriority(priority: z.infer<typeof TaskPriority>): Task[] {
    return Array.from(this.tasks.values()).filter((task) => task.priority === priority);
  }

  getTaskCount(): number {
    return this.tasks.size;
  }

  clearAllTasks(): void {
    this.tasks.clear();
  }
}
