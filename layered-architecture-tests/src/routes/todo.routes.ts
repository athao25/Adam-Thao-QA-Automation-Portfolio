import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import { TodoService, TodoNotFoundError, TodoValidationError } from '../services/todo.service';
import { TodoStatus, TodoPriority } from '../models/todo.model';

export function createTodoRouter(todoService: TodoService): Router {
  const router = Router();

  const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    next();
  };

  const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };

  // GET /todos - Get all todos with optional filtering
  router.get(
    '/',
    [
      query('status').optional().isIn(Object.values(TodoStatus)),
      query('priority').optional().isIn(Object.values(TodoPriority)),
      query('tags').optional().isString(),
    ],
    handleValidationErrors,
    asyncHandler(async (req: Request, res: Response) => {
      const filter: Record<string, unknown> = {};

      if (req.query.status) {
        filter.status = req.query.status as TodoStatus;
      }
      if (req.query.priority) {
        filter.priority = req.query.priority as TodoPriority;
      }
      if (req.query.tags) {
        filter.tags = (req.query.tags as string).split(',');
      }

      const todos = await todoService.getAllTodos(filter);
      res.json(todos);
    })
  );

  // GET /todos/stats - Get todo statistics
  router.get(
    '/stats',
    asyncHandler(async (_req: Request, res: Response) => {
      const stats = await todoService.getStats();
      res.json(stats);
    })
  );

  // GET /todos/overdue - Get overdue todos
  router.get(
    '/overdue',
    asyncHandler(async (_req: Request, res: Response) => {
      const todos = await todoService.getOverdueTodos();
      res.json(todos);
    })
  );

  // GET /todos/:id - Get a single todo by ID
  router.get(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid todo ID format')],
    handleValidationErrors,
    asyncHandler(async (req: Request, res: Response) => {
      const todo = await todoService.getTodoById(req.params.id);
      res.json(todo);
    })
  );

  // POST /todos - Create a new todo
  router.post(
    '/',
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('title').isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
      body('description').optional().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
      body('status').optional().isIn(Object.values(TodoStatus)),
      body('priority').optional().isIn(Object.values(TodoPriority)),
      body('dueDate').optional().isISO8601().toDate(),
      body('tags').optional().isArray(),
    ],
    handleValidationErrors,
    asyncHandler(async (req: Request, res: Response) => {
      const todo = await todoService.createTodo(req.body);
      res.status(StatusCodes.CREATED).json(todo);
    })
  );

  // PUT /todos/:id - Update a todo
  router.put(
    '/:id',
    [
      param('id').isMongoId().withMessage('Invalid todo ID format'),
      body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
      body('title').optional().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
      body('description').optional().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
      body('status').optional().isIn(Object.values(TodoStatus)),
      body('priority').optional().isIn(Object.values(TodoPriority)),
      body('dueDate').optional().isISO8601().toDate(),
      body('tags').optional().isArray(),
    ],
    handleValidationErrors,
    asyncHandler(async (req: Request, res: Response) => {
      const todo = await todoService.updateTodo(req.params.id, req.body);
      res.json(todo);
    })
  );

  // PATCH /todos/:id/complete - Mark a todo as completed
  router.patch(
    '/:id/complete',
    [param('id').isMongoId().withMessage('Invalid todo ID format')],
    handleValidationErrors,
    asyncHandler(async (req: Request, res: Response) => {
      const todo = await todoService.markAsCompleted(req.params.id);
      res.json(todo);
    })
  );

  // DELETE /todos/:id - Delete a todo
  router.delete(
    '/:id',
    [param('id').isMongoId().withMessage('Invalid todo ID format')],
    handleValidationErrors,
    asyncHandler(async (req: Request, res: Response) => {
      await todoService.deleteTodo(req.params.id);
      res.status(StatusCodes.NO_CONTENT).send();
    })
  );

  return router;
}

export function todoErrorHandler(err: Error, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof TodoNotFoundError) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: err.message,
    });
  }

  if (err instanceof TodoValidationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: err.message,
    });
  }

  next(err);
}
