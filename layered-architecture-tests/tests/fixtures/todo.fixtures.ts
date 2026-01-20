import { CreateTodoDto, UpdateTodoDto } from '../../src/repositories/todo.repository';
import { TodoStatus, TodoPriority, ITodoDocument } from '../../src/models/todo.model';
import mongoose from 'mongoose';

export const validObjectId = new mongoose.Types.ObjectId().toString();
export const invalidObjectId = 'invalid-id';

export const createTodoFixtures: Record<string, CreateTodoDto> = {
  minimal: {
    title: 'Test Todo',
  },
  complete: {
    title: 'Complete Todo',
    description: 'This is a complete todo with all fields',
    status: TodoStatus.PENDING,
    priority: TodoPriority.HIGH,
    dueDate: new Date('2025-12-31'),
    tags: ['test', 'fixture'],
  },
  withDescription: {
    title: 'Todo with Description',
    description: 'This todo has a description',
  },
  highPriority: {
    title: 'High Priority Todo',
    priority: TodoPriority.HIGH,
  },
  lowPriority: {
    title: 'Low Priority Todo',
    priority: TodoPriority.LOW,
  },
  inProgress: {
    title: 'In Progress Todo',
    status: TodoStatus.IN_PROGRESS,
  },
  completed: {
    title: 'Completed Todo',
    status: TodoStatus.COMPLETED,
  },
  withTags: {
    title: 'Tagged Todo',
    tags: ['urgent', 'work'],
  },
  withDueDate: {
    title: 'Todo with Due Date',
    dueDate: new Date('2025-06-15'),
  },
  overdue: {
    title: 'Overdue Todo',
    status: TodoStatus.PENDING,
    dueDate: new Date('2020-01-01'),
  },
};

export const invalidCreateTodoFixtures: Record<string, Partial<CreateTodoDto>> = {
  emptyTitle: {
    title: '',
  },
  whitespaceTitle: {
    title: '   ',
  },
  titleTooLong: {
    title: 'a'.repeat(201),
  },
  descriptionTooLong: {
    title: 'Valid Title',
    description: 'a'.repeat(2001),
  },
  invalidStatus: {
    title: 'Valid Title',
    status: 'invalid' as TodoStatus,
  },
  invalidPriority: {
    title: 'Valid Title',
    priority: 'invalid' as TodoPriority,
  },
};

export const updateTodoFixtures: Record<string, UpdateTodoDto> = {
  titleOnly: {
    title: 'Updated Title',
  },
  descriptionOnly: {
    description: 'Updated description',
  },
  statusToPending: {
    status: TodoStatus.PENDING,
  },
  statusToInProgress: {
    status: TodoStatus.IN_PROGRESS,
  },
  statusToCompleted: {
    status: TodoStatus.COMPLETED,
  },
  priorityToHigh: {
    priority: TodoPriority.HIGH,
  },
  priorityToMedium: {
    priority: TodoPriority.MEDIUM,
  },
  priorityToLow: {
    priority: TodoPriority.LOW,
  },
  multiplFields: {
    title: 'Updated Title',
    description: 'Updated description',
    status: TodoStatus.IN_PROGRESS,
    priority: TodoPriority.HIGH,
  },
  addTags: {
    tags: ['new-tag', 'another-tag'],
  },
  updateDueDate: {
    dueDate: new Date('2025-12-25'),
  },
};

export const invalidUpdateTodoFixtures: Record<string, UpdateTodoDto> = {
  emptyTitle: {
    title: '',
  },
  titleTooLong: {
    title: 'a'.repeat(201),
  },
  descriptionTooLong: {
    description: 'a'.repeat(2001),
  },
};

export function createMockTodoDocument(overrides: Partial<ITodoDocument> = {}): ITodoDocument {
  const now = new Date();
  return {
    _id: new mongoose.Types.ObjectId(),
    title: 'Mock Todo',
    description: undefined,
    status: TodoStatus.PENDING,
    priority: TodoPriority.MEDIUM,
    dueDate: undefined,
    tags: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  } as ITodoDocument;
}

export function createMockTodoDocuments(count: number): ITodoDocument[] {
  return Array.from({ length: count }, (_, index) =>
    createMockTodoDocument({
      _id: new mongoose.Types.ObjectId(),
      title: `Mock Todo ${index + 1}`,
    })
  );
}
