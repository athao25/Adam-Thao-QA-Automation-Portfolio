import { Todo, ITodoDocument, TodoStatus, TodoPriority } from '../models/todo.model';

export interface CreateTodoDto {
  title: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTodoDto {
  title?: string;
  description?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  dueDate?: Date;
  tags?: string[];
}

export interface TodoFilter {
  status?: TodoStatus;
  priority?: TodoPriority;
  tags?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface ITodoRepository {
  create(data: CreateTodoDto): Promise<ITodoDocument>;
  findById(id: string): Promise<ITodoDocument | null>;
  findAll(filter?: TodoFilter): Promise<ITodoDocument[]>;
  update(id: string, data: UpdateTodoDto): Promise<ITodoDocument | null>;
  delete(id: string): Promise<boolean>;
  countByStatus(status: TodoStatus): Promise<number>;
}

export class TodoRepository implements ITodoRepository {
  async create(data: CreateTodoDto): Promise<ITodoDocument> {
    const todo = new Todo(data);
    return todo.save();
  }

  async findById(id: string): Promise<ITodoDocument | null> {
    return Todo.findById(id).exec();
  }

  async findAll(filter?: TodoFilter): Promise<ITodoDocument[]> {
    const query: Record<string, unknown> = {};

    if (filter?.status) {
      query.status = filter.status;
    }

    if (filter?.priority) {
      query.priority = filter.priority;
    }

    if (filter?.tags && filter.tags.length > 0) {
      query.tags = { $in: filter.tags };
    }

    if (filter?.dueBefore || filter?.dueAfter) {
      query.dueDate = {};
      if (filter.dueBefore) {
        (query.dueDate as Record<string, Date>).$lte = filter.dueBefore;
      }
      if (filter.dueAfter) {
        (query.dueDate as Record<string, Date>).$gte = filter.dueAfter;
      }
    }

    return Todo.find(query).sort({ createdAt: -1 }).exec();
  }

  async update(id: string, data: UpdateTodoDto): Promise<ITodoDocument | null> {
    return Todo.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await Todo.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async countByStatus(status: TodoStatus): Promise<number> {
    return Todo.countDocuments({ status }).exec();
  }
}
