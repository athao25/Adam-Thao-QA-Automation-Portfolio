import { TodoService, TodoNotFoundError, TodoValidationError } from '../../src/services/todo.service';
import { ITodoRepository, CreateTodoDto, UpdateTodoDto, TodoFilter } from '../../src/repositories/todo.repository';
import { ITodoDocument, TodoStatus, TodoPriority } from '../../src/models/todo.model';
import {
  createTodoFixtures,
  invalidCreateTodoFixtures,
  updateTodoFixtures,
  invalidUpdateTodoFixtures,
  createMockTodoDocument,
  createMockTodoDocuments,
  validObjectId,
  invalidObjectId,
} from '../fixtures/todo.fixtures';

// Mock repository implementation for unit testing
function createMockRepository(): jest.Mocked<ITodoRepository> {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    countByStatus: jest.fn(),
  };
}

describe('TodoService', () => {
  let todoService: TodoService;
  let mockRepository: jest.Mocked<ITodoRepository>;

  beforeEach(() => {
    mockRepository = createMockRepository();
    todoService = new TodoService(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTodo', () => {
    it('should create a todo with minimal data', async () => {
      const createData = createTodoFixtures.minimal;
      const mockTodo = createMockTodoDocument({ title: createData.title });
      mockRepository.create.mockResolvedValue(mockTodo);

      const result = await todoService.createTodo(createData);

      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(result).toBe(mockTodo);
    });

    it('should create a todo with complete data', async () => {
      const createData = createTodoFixtures.complete;
      const mockTodo = createMockTodoDocument(createData);
      mockRepository.create.mockResolvedValue(mockTodo);

      const result = await todoService.createTodo(createData);

      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(result).toBe(mockTodo);
    });

    it('should throw TodoValidationError for empty title', async () => {
      const createData = invalidCreateTodoFixtures.emptyTitle as CreateTodoDto;

      await expect(todoService.createTodo(createData)).rejects.toThrow(TodoValidationError);
      await expect(todoService.createTodo(createData)).rejects.toThrow('Title is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for whitespace-only title', async () => {
      const createData = invalidCreateTodoFixtures.whitespaceTitle as CreateTodoDto;

      await expect(todoService.createTodo(createData)).rejects.toThrow(TodoValidationError);
      await expect(todoService.createTodo(createData)).rejects.toThrow('Title is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for title exceeding 200 characters', async () => {
      const createData = invalidCreateTodoFixtures.titleTooLong as CreateTodoDto;

      await expect(todoService.createTodo(createData)).rejects.toThrow(TodoValidationError);
      await expect(todoService.createTodo(createData)).rejects.toThrow('Title cannot exceed 200 characters');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for description exceeding 2000 characters', async () => {
      const createData = invalidCreateTodoFixtures.descriptionTooLong as CreateTodoDto;

      await expect(todoService.createTodo(createData)).rejects.toThrow(TodoValidationError);
      await expect(todoService.createTodo(createData)).rejects.toThrow('Description cannot exceed 2000 characters');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTodoById', () => {
    it('should return a todo when found', async () => {
      const mockTodo = createMockTodoDocument();
      mockRepository.findById.mockResolvedValue(mockTodo);

      const result = await todoService.getTodoById(validObjectId);

      expect(mockRepository.findById).toHaveBeenCalledWith(validObjectId);
      expect(result).toBe(mockTodo);
    });

    it('should throw TodoNotFoundError when todo not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(todoService.getTodoById(validObjectId)).rejects.toThrow(TodoNotFoundError);
      await expect(todoService.getTodoById(validObjectId)).rejects.toThrow(`Todo with id ${validObjectId} not found`);
    });

    it('should throw TodoValidationError for invalid ID format', async () => {
      await expect(todoService.getTodoById(invalidObjectId)).rejects.toThrow(TodoValidationError);
      await expect(todoService.getTodoById(invalidObjectId)).rejects.toThrow('Invalid todo ID format');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for empty ID', async () => {
      await expect(todoService.getTodoById('')).rejects.toThrow(TodoValidationError);
      await expect(todoService.getTodoById('')).rejects.toThrow('Invalid todo ID');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('getAllTodos', () => {
    it('should return all todos without filter', async () => {
      const mockTodos = createMockTodoDocuments(3);
      mockRepository.findAll.mockResolvedValue(mockTodos);

      const result = await todoService.getAllTodos();

      expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toBe(mockTodos);
      expect(result).toHaveLength(3);
    });

    it('should return todos filtered by status', async () => {
      const filter: TodoFilter = { status: TodoStatus.PENDING };
      const mockTodos = createMockTodoDocuments(2);
      mockRepository.findAll.mockResolvedValue(mockTodos);

      const result = await todoService.getAllTodos(filter);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
      expect(result).toBe(mockTodos);
    });

    it('should return todos filtered by priority', async () => {
      const filter: TodoFilter = { priority: TodoPriority.HIGH };
      const mockTodos = createMockTodoDocuments(1);
      mockRepository.findAll.mockResolvedValue(mockTodos);

      const result = await todoService.getAllTodos(filter);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
      expect(result).toBe(mockTodos);
    });

    it('should return todos filtered by tags', async () => {
      const filter: TodoFilter = { tags: ['urgent', 'work'] };
      const mockTodos = createMockTodoDocuments(2);
      mockRepository.findAll.mockResolvedValue(mockTodos);

      const result = await todoService.getAllTodos(filter);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filter);
      expect(result).toBe(mockTodos);
    });

    it('should return empty array when no todos match filter', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await todoService.getAllTodos({ status: TodoStatus.COMPLETED });

      expect(result).toEqual([]);
    });
  });

  describe('updateTodo', () => {
    it('should update todo title', async () => {
      const updateData = updateTodoFixtures.titleOnly;
      const mockTodo = createMockTodoDocument({ title: updateData.title });
      mockRepository.update.mockResolvedValue(mockTodo);

      const result = await todoService.updateTodo(validObjectId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(validObjectId, updateData);
      expect(result).toBe(mockTodo);
    });

    it('should update todo status', async () => {
      const updateData = updateTodoFixtures.statusToCompleted;
      const mockTodo = createMockTodoDocument({ status: updateData.status });
      mockRepository.update.mockResolvedValue(mockTodo);

      const result = await todoService.updateTodo(validObjectId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(validObjectId, updateData);
      expect(result.status).toBe(TodoStatus.COMPLETED);
    });

    it('should update multiple fields', async () => {
      const updateData = updateTodoFixtures.multiplFields;
      const mockTodo = createMockTodoDocument(updateData);
      mockRepository.update.mockResolvedValue(mockTodo);

      const result = await todoService.updateTodo(validObjectId, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith(validObjectId, updateData);
      expect(result).toBe(mockTodo);
    });

    it('should throw TodoNotFoundError when todo not found', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(todoService.updateTodo(validObjectId, updateTodoFixtures.titleOnly)).rejects.toThrow(TodoNotFoundError);
    });

    it('should throw TodoValidationError for invalid ID format', async () => {
      await expect(todoService.updateTodo(invalidObjectId, updateTodoFixtures.titleOnly)).rejects.toThrow(TodoValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for empty title update', async () => {
      await expect(todoService.updateTodo(validObjectId, invalidUpdateTodoFixtures.emptyTitle)).rejects.toThrow(TodoValidationError);
      await expect(todoService.updateTodo(validObjectId, invalidUpdateTodoFixtures.emptyTitle)).rejects.toThrow('Title cannot be empty');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for title exceeding 200 characters', async () => {
      await expect(todoService.updateTodo(validObjectId, invalidUpdateTodoFixtures.titleTooLong)).rejects.toThrow(TodoValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw TodoValidationError for description exceeding 2000 characters', async () => {
      await expect(todoService.updateTodo(validObjectId, invalidUpdateTodoFixtures.descriptionTooLong)).rejects.toThrow(TodoValidationError);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo successfully', async () => {
      mockRepository.delete.mockResolvedValue(true);

      await todoService.deleteTodo(validObjectId);

      expect(mockRepository.delete).toHaveBeenCalledWith(validObjectId);
    });

    it('should throw TodoNotFoundError when todo not found', async () => {
      mockRepository.delete.mockResolvedValue(false);

      await expect(todoService.deleteTodo(validObjectId)).rejects.toThrow(TodoNotFoundError);
    });

    it('should throw TodoValidationError for invalid ID format', async () => {
      await expect(todoService.deleteTodo(invalidObjectId)).rejects.toThrow(TodoValidationError);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('markAsCompleted', () => {
    it('should mark a todo as completed', async () => {
      const mockTodo = createMockTodoDocument({ status: TodoStatus.COMPLETED });
      mockRepository.update.mockResolvedValue(mockTodo);

      const result = await todoService.markAsCompleted(validObjectId);

      expect(mockRepository.update).toHaveBeenCalledWith(validObjectId, { status: TodoStatus.COMPLETED });
      expect(result.status).toBe(TodoStatus.COMPLETED);
    });

    it('should throw TodoNotFoundError when todo not found', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(todoService.markAsCompleted(validObjectId)).rejects.toThrow(TodoNotFoundError);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      mockRepository.countByStatus.mockImplementation(async (status: TodoStatus) => {
        const counts: Record<TodoStatus, number> = {
          [TodoStatus.PENDING]: 5,
          [TodoStatus.IN_PROGRESS]: 3,
          [TodoStatus.COMPLETED]: 2,
        };
        return counts[status];
      });

      const stats = await todoService.getStats();

      expect(stats.total).toBe(10);
      expect(stats.pending).toBe(5);
      expect(stats.inProgress).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.completionRate).toBe(20);
    });

    it('should return 0 completion rate when no todos', async () => {
      mockRepository.countByStatus.mockResolvedValue(0);

      const stats = await todoService.getStats();

      expect(stats.total).toBe(0);
      expect(stats.completionRate).toBe(0);
    });

    it('should round completion rate to 2 decimal places', async () => {
      mockRepository.countByStatus.mockImplementation(async (status: TodoStatus) => {
        const counts: Record<TodoStatus, number> = {
          [TodoStatus.PENDING]: 1,
          [TodoStatus.IN_PROGRESS]: 1,
          [TodoStatus.COMPLETED]: 1,
        };
        return counts[status];
      });

      const stats = await todoService.getStats();

      expect(stats.completionRate).toBe(33.33);
    });
  });

  describe('getOverdueTodos', () => {
    it('should return overdue pending todos', async () => {
      const mockTodos = [createMockTodoDocument({ status: TodoStatus.PENDING, dueDate: new Date('2020-01-01') })];
      mockRepository.findAll.mockResolvedValue(mockTodos);

      const result = await todoService.getOverdueTodos();

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          dueBefore: expect.any(Date),
          status: TodoStatus.PENDING,
        })
      );
      expect(result).toBe(mockTodos);
    });

    it('should return empty array when no overdue todos', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      const result = await todoService.getOverdueTodos();

      expect(result).toEqual([]);
    });
  });
});
