import {
  ITodoRepository,
  CreateTodoDto,
  UpdateTodoDto,
  TodoFilter,
} from '../repositories/todo.repository';
import { ITodoDocument, TodoStatus } from '../models/todo.model';

export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with id ${id} not found`);
    this.name = 'TodoNotFoundError';
  }
}

export class TodoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TodoValidationError';
  }
}

export interface TodoStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
}

export interface ITodoService {
  createTodo(data: CreateTodoDto): Promise<ITodoDocument>;
  getTodoById(id: string): Promise<ITodoDocument>;
  getAllTodos(filter?: TodoFilter): Promise<ITodoDocument[]>;
  updateTodo(id: string, data: UpdateTodoDto): Promise<ITodoDocument>;
  deleteTodo(id: string): Promise<void>;
  markAsCompleted(id: string): Promise<ITodoDocument>;
  getStats(): Promise<TodoStats>;
  getOverdueTodos(): Promise<ITodoDocument[]>;
}

export class TodoService implements ITodoService {
  constructor(private readonly repository: ITodoRepository) {}

  async createTodo(data: CreateTodoDto): Promise<ITodoDocument> {
    this.validateCreateData(data);
    return this.repository.create(data);
  }

  async getTodoById(id: string): Promise<ITodoDocument> {
    this.validateId(id);
    const todo = await this.repository.findById(id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  async getAllTodos(filter?: TodoFilter): Promise<ITodoDocument[]> {
    return this.repository.findAll(filter);
  }

  async updateTodo(id: string, data: UpdateTodoDto): Promise<ITodoDocument> {
    this.validateId(id);
    this.validateUpdateData(data);

    const todo = await this.repository.update(id, data);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  async deleteTodo(id: string): Promise<void> {
    this.validateId(id);
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new TodoNotFoundError(id);
    }
  }

  async markAsCompleted(id: string): Promise<ITodoDocument> {
    return this.updateTodo(id, { status: TodoStatus.COMPLETED });
  }

  async getStats(): Promise<TodoStats> {
    const [pending, inProgress, completed] = await Promise.all([
      this.repository.countByStatus(TodoStatus.PENDING),
      this.repository.countByStatus(TodoStatus.IN_PROGRESS),
      this.repository.countByStatus(TodoStatus.COMPLETED),
    ]);

    const total = pending + inProgress + completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      pending,
      inProgress,
      completed,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  async getOverdueTodos(): Promise<ITodoDocument[]> {
    const now = new Date();
    return this.repository.findAll({
      dueBefore: now,
      status: TodoStatus.PENDING,
    });
  }

  private validateId(id: string): void {
    if (!id || typeof id !== 'string') {
      throw new TodoValidationError('Invalid todo ID');
    }
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      throw new TodoValidationError('Invalid todo ID format');
    }
  }

  private validateCreateData(data: CreateTodoDto): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new TodoValidationError('Title is required');
    }
    if (data.title.length > 200) {
      throw new TodoValidationError('Title cannot exceed 200 characters');
    }
    if (data.description && data.description.length > 2000) {
      throw new TodoValidationError('Description cannot exceed 2000 characters');
    }
  }

  private validateUpdateData(data: UpdateTodoDto): void {
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new TodoValidationError('Title cannot be empty');
      }
      if (data.title.length > 200) {
        throw new TodoValidationError('Title cannot exceed 200 characters');
      }
    }
    if (data.description && data.description.length > 2000) {
      throw new TodoValidationError('Description cannot exceed 2000 characters');
    }
  }
}
