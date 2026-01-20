import mongoose from 'mongoose';
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb';
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app';
import { Todo, TodoStatus, TodoPriority } from '../../src/models/todo.model';
import { createTodoFixtures } from '../fixtures/todo.fixtures';

describe('Todo API Integration Tests', () => {
  let mongoContainer: StartedMongoDBContainer;
  let app: Application;

  beforeAll(async () => {
    // Start MongoDB container using Testcontainers
    mongoContainer = await new MongoDBContainer('mongo:7.0').start();

    // Connect to the containerized MongoDB
    const connectionString = mongoContainer.getConnectionString();
    await mongoose.connect(connectionString, { directConnection: true });

    app = createApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoContainer.stop();
  });

  beforeEach(async () => {
    await Todo.deleteMany({});
  });

  describe('GET /api/todos', () => {
    it('should return empty array when no todos', async () => {
      const response = await request(app).get('/api/todos').expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all todos', async () => {
      await Todo.create(createTodoFixtures.minimal);
      await Todo.create(createTodoFixtures.highPriority);

      const response = await request(app).get('/api/todos').expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should filter by status', async () => {
      await Todo.create(createTodoFixtures.minimal);
      await Todo.create(createTodoFixtures.completed);

      const response = await request(app).get('/api/todos?status=completed').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].status).toBe(TodoStatus.COMPLETED);
    });

    it('should filter by priority', async () => {
      await Todo.create(createTodoFixtures.minimal);
      await Todo.create(createTodoFixtures.highPriority);

      const response = await request(app).get('/api/todos?priority=high').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].priority).toBe(TodoPriority.HIGH);
    });

    it('should filter by tags', async () => {
      await Todo.create(createTodoFixtures.minimal);
      await Todo.create(createTodoFixtures.withTags);

      const response = await request(app).get('/api/todos?tags=urgent').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].tags).toContain('urgent');
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a todo by ID', async () => {
      const created = await Todo.create(createTodoFixtures.complete);

      const response = await request(app).get(`/api/todos/${created._id}`).expect(200);

      expect(response.body.title).toBe(createTodoFixtures.complete.title);
      expect(response.body.description).toBe(createTodoFixtures.complete.description);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).get(`/api/todos/${nonExistentId}`).expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).get('/api/todos/invalid-id').expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/todos', () => {
    it('should create a todo with minimal data', async () => {
      const response = await request(app).post('/api/todos').send(createTodoFixtures.minimal).expect(201);

      expect(response.body._id).toBeDefined();
      expect(response.body.title).toBe(createTodoFixtures.minimal.title);
      expect(response.body.status).toBe(TodoStatus.PENDING);
      expect(response.body.priority).toBe(TodoPriority.MEDIUM);
    });

    it('should create a todo with complete data', async () => {
      const response = await request(app).post('/api/todos').send(createTodoFixtures.complete).expect(201);

      expect(response.body.title).toBe(createTodoFixtures.complete.title);
      expect(response.body.description).toBe(createTodoFixtures.complete.description);
      expect(response.body.status).toBe(createTodoFixtures.complete.status);
      expect(response.body.priority).toBe(createTodoFixtures.complete.priority);
      expect(response.body.tags).toEqual(createTodoFixtures.complete.tags);
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app).post('/api/todos').send({}).expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app).post('/api/todos').send({ title: '' }).expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for title exceeding max length', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'a'.repeat(201) })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app).post('/api/todos').send({ title: 'Test', status: 'invalid' }).expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo title', async () => {
      const created = await Todo.create(createTodoFixtures.minimal);
      const newTitle = 'Updated Title';

      const response = await request(app).put(`/api/todos/${created._id}`).send({ title: newTitle }).expect(200);

      expect(response.body.title).toBe(newTitle);
    });

    it('should update todo status', async () => {
      const created = await Todo.create(createTodoFixtures.minimal);

      const response = await request(app).put(`/api/todos/${created._id}`).send({ status: TodoStatus.COMPLETED }).expect(200);

      expect(response.body.status).toBe(TodoStatus.COMPLETED);
    });

    it('should update multiple fields', async () => {
      const created = await Todo.create(createTodoFixtures.minimal);
      const updateData = {
        title: 'New Title',
        description: 'New Description',
        priority: TodoPriority.HIGH,
      };

      const response = await request(app).put(`/api/todos/${created._id}`).send(updateData).expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.priority).toBe(updateData.priority);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).put(`/api/todos/${nonExistentId}`).send({ title: 'Test' }).expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).put('/api/todos/invalid-id').send({ title: 'Test' }).expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PATCH /api/todos/:id/complete', () => {
    it('should mark a todo as completed', async () => {
      const created = await Todo.create(createTodoFixtures.minimal);

      const response = await request(app).patch(`/api/todos/${created._id}/complete`).expect(200);

      expect(response.body.status).toBe(TodoStatus.COMPLETED);
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).patch(`/api/todos/${nonExistentId}/complete`).expect(404);

      expect(response.body.error).toContain('not found');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const created = await Todo.create(createTodoFixtures.minimal);

      await request(app).delete(`/api/todos/${created._id}`).expect(204);

      const found = await Todo.findById(created._id);
      expect(found).toBeNull();
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app).delete(`/api/todos/${nonExistentId}`).expect(404);

      expect(response.body.error).toContain('not found');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app).delete('/api/todos/invalid-id').expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/todos/stats', () => {
    it('should return correct statistics', async () => {
      await Todo.create(createTodoFixtures.minimal); // PENDING
      await Todo.create(createTodoFixtures.minimal); // PENDING
      await Todo.create(createTodoFixtures.inProgress); // IN_PROGRESS
      await Todo.create(createTodoFixtures.completed); // COMPLETED

      const response = await request(app).get('/api/todos/stats').expect(200);

      expect(response.body.total).toBe(4);
      expect(response.body.pending).toBe(2);
      expect(response.body.inProgress).toBe(1);
      expect(response.body.completed).toBe(1);
      expect(response.body.completionRate).toBe(25);
    });

    it('should return zeros when no todos', async () => {
      const response = await request(app).get('/api/todos/stats').expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.pending).toBe(0);
      expect(response.body.inProgress).toBe(0);
      expect(response.body.completed).toBe(0);
      expect(response.body.completionRate).toBe(0);
    });
  });

  describe('GET /api/todos/overdue', () => {
    it('should return overdue pending todos', async () => {
      await Todo.create(createTodoFixtures.overdue);
      await Todo.create(createTodoFixtures.minimal);

      const response = await request(app).get('/api/todos/overdue').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe(createTodoFixtures.overdue.title);
    });

    it('should return empty array when no overdue todos', async () => {
      await Todo.create(createTodoFixtures.minimal);

      const response = await request(app).get('/api/todos/overdue').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown').expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });
});
