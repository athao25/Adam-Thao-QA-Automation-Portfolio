import express, { Application, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { createTodoRouter, todoErrorHandler } from './routes/todo.routes';
import { TodoService } from './services/todo.service';
import { TodoRepository } from './repositories/todo.repository';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Initialize dependencies
  const todoRepository = new TodoRepository();
  const todoService = new TodoService(todoRepository);

  // Routes
  app.use('/api/todos', createTodoRouter(todoService));

  // Todo-specific error handler
  app.use('/api/todos', todoErrorHandler);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
      error: 'Not Found',
      message: 'The requested resource was not found',
    });
  });

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    });
  });

  return app;
}
