import mongoose from 'mongoose';
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';
import { TodoRepository } from '../../src/repositories/todo.repository';
import { Todo, TodoStatus, TodoPriority } from '../../src/models/todo.model';
import { createTodoFixtures } from '../fixtures/todo.fixtures';

describe('TodoRepository Integration Tests', () => {
  let mongoContainer: StartedMongoDBContainer;
  let repository: TodoRepository;

  beforeAll(async () => {
    // Start MongoDB container using Testcontainers
    mongoContainer = await new MongoDBContainer('mongo:7.0').start();

    // Connect to the containerized MongoDB
    const connectionString = mongoContainer.getConnectionString();
    await mongoose.connect(connectionString, { directConnection: true });

    repository = new TodoRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoContainer.stop();
  });

  beforeEach(async () => {
    // Clean the database before each test
    await Todo.deleteMany({});
  });

  describe('create', () => {
    it('should create a todo with minimal data', async () => {
      const createData = createTodoFixtures.minimal;

      const result = await repository.create(createData);

      expect(result._id).toBeDefined();
      expect(result.title).toBe(createData.title);
      expect(result.status).toBe(TodoStatus.PENDING);
      expect(result.priority).toBe(TodoPriority.MEDIUM);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create a todo with complete data', async () => {
      const createData = createTodoFixtures.complete;

      const result = await repository.create(createData);

      expect(result.title).toBe(createData.title);
      expect(result.description).toBe(createData.description);
      expect(result.status).toBe(createData.status);
      expect(result.priority).toBe(createData.priority);
      expect(result.tags).toEqual(createData.tags);
    });

    it('should set default values for optional fields', async () => {
      const result = await repository.create(createTodoFixtures.minimal);

      expect(result.status).toBe(TodoStatus.PENDING);
      expect(result.priority).toBe(TodoPriority.MEDIUM);
      expect(result.tags).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a todo by ID', async () => {
      const created = await repository.create(createTodoFixtures.minimal);

      const result = await repository.findById(created._id.toString());

      expect(result).not.toBeNull();
      expect(result!._id.toString()).toBe(created._id.toString());
      expect(result!.title).toBe(created.title);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await repository.findById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Create test data
      await repository.create(createTodoFixtures.minimal);
      await repository.create(createTodoFixtures.highPriority);
      await repository.create(createTodoFixtures.inProgress);
      await repository.create(createTodoFixtures.completed);
      await repository.create(createTodoFixtures.withTags);
    });

    it('should return all todos without filter', async () => {
      const result = await repository.findAll();

      expect(result).toHaveLength(5);
    });

    it('should filter by status', async () => {
      const result = await repository.findAll({ status: TodoStatus.PENDING });

      expect(result.every((todo) => todo.status === TodoStatus.PENDING)).toBe(true);
    });

    it('should filter by priority', async () => {
      const result = await repository.findAll({ priority: TodoPriority.HIGH });

      expect(result).toHaveLength(1);
      expect(result[0].priority).toBe(TodoPriority.HIGH);
    });

    it('should filter by tags', async () => {
      const result = await repository.findAll({ tags: ['urgent'] });

      expect(result).toHaveLength(1);
      expect(result[0].tags).toContain('urgent');
    });

    it('should filter by due date range', async () => {
      const todoWithDueDate = await repository.create(createTodoFixtures.withDueDate);
      const dueBefore = new Date('2025-12-31');
      const dueAfter = new Date('2025-01-01');

      const result = await repository.findAll({ dueBefore, dueAfter });

      expect(result.some((t) => t._id.toString() === todoWithDueDate._id.toString())).toBe(true);
    });

    it('should return todos sorted by createdAt descending', async () => {
      const result = await repository.findAll();

      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].createdAt.getTime()).toBeGreaterThanOrEqual(result[i + 1].createdAt.getTime());
      }
    });

    it('should return empty array when no todos match filter', async () => {
      await Todo.deleteMany({});

      const result = await repository.findAll({ status: TodoStatus.COMPLETED });

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update todo title', async () => {
      const created = await repository.create(createTodoFixtures.minimal);
      const newTitle = 'Updated Title';

      const result = await repository.update(created._id.toString(), { title: newTitle });

      expect(result).not.toBeNull();
      expect(result!.title).toBe(newTitle);
    });

    it('should update todo status', async () => {
      const created = await repository.create(createTodoFixtures.minimal);

      const result = await repository.update(created._id.toString(), { status: TodoStatus.COMPLETED });

      expect(result!.status).toBe(TodoStatus.COMPLETED);
    });

    it('should update multiple fields', async () => {
      const created = await repository.create(createTodoFixtures.minimal);
      const updateData = {
        title: 'New Title',
        description: 'New Description',
        priority: TodoPriority.HIGH,
        status: TodoStatus.IN_PROGRESS,
      };

      const result = await repository.update(created._id.toString(), updateData);

      expect(result!.title).toBe(updateData.title);
      expect(result!.description).toBe(updateData.description);
      expect(result!.priority).toBe(updateData.priority);
      expect(result!.status).toBe(updateData.status);
    });

    it('should return null for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await repository.update(nonExistentId, { title: 'New Title' });

      expect(result).toBeNull();
    });

    it('should update the updatedAt timestamp', async () => {
      const created = await repository.create(createTodoFixtures.minimal);
      const originalUpdatedAt = created.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = await repository.update(created._id.toString(), { title: 'Updated' });

      expect(result!.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should delete a todo and return true', async () => {
      const created = await repository.create(createTodoFixtures.minimal);

      const result = await repository.delete(created._id.toString());

      expect(result).toBe(true);

      const found = await repository.findById(created._id.toString());
      expect(found).toBeNull();
    });

    it('should return false for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const result = await repository.delete(nonExistentId);

      expect(result).toBe(false);
    });
  });

  describe('countByStatus', () => {
    beforeEach(async () => {
      await repository.create(createTodoFixtures.minimal); // PENDING
      await repository.create(createTodoFixtures.minimal); // PENDING
      await repository.create(createTodoFixtures.inProgress); // IN_PROGRESS
      await repository.create(createTodoFixtures.completed); // COMPLETED
      await repository.create(createTodoFixtures.completed); // COMPLETED
      await repository.create(createTodoFixtures.completed); // COMPLETED
    });

    it('should count pending todos', async () => {
      const count = await repository.countByStatus(TodoStatus.PENDING);
      expect(count).toBe(2);
    });

    it('should count in-progress todos', async () => {
      const count = await repository.countByStatus(TodoStatus.IN_PROGRESS);
      expect(count).toBe(1);
    });

    it('should count completed todos', async () => {
      const count = await repository.countByStatus(TodoStatus.COMPLETED);
      expect(count).toBe(3);
    });

    it('should return 0 when no todos with given status', async () => {
      await Todo.deleteMany({});

      const count = await repository.countByStatus(TodoStatus.PENDING);

      expect(count).toBe(0);
    });
  });
});
