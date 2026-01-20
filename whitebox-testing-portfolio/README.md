# Whitebox Testing Portfolio

A TypeScript/Express/MongoDB Todo API demonstrating comprehensive testing practices including unit testing, integration testing, and white box testing with Testcontainers.

## Tech Stack

- **Runtime**: Node.js 20
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest, Supertest, Testcontainers
- **Containerization**: Docker & Docker Compose

## Project Structure

```
whitebox-testing-portfolio/
├── src/
│   ├── config/
│   │   └── database.ts          # Database connection configuration
│   ├── models/
│   │   └── todo.model.ts        # Mongoose schema and model
│   ├── repositories/
│   │   └── todo.repository.ts   # Data access layer
│   ├── services/
│   │   └── todo.service.ts      # Business logic layer
│   ├── routes/
│   │   └── todo.routes.ts       # API routes
│   ├── app.ts                   # Express application setup
│   └── index.ts                 # Application entry point
├── tests/
│   ├── fixtures/
│   │   └── todo.fixtures.ts     # Test data fixtures
│   ├── unit/
│   │   └── todo.service.test.ts # Unit tests with mocks
│   └── integration/
│       ├── todo.repository.test.ts  # Repository integration tests
│       └── todo.api.test.ts         # API integration tests
├── Dockerfile                   # Production Docker image
├── Dockerfile.test              # Test Docker image
├── docker-compose.yml           # Production compose file
└── docker-compose.test.yml      # Test compose file
```

## Architecture

The project follows a layered architecture pattern for testability:

```
┌─────────────────────────────────────────┐
│              Routes Layer               │
│         (HTTP Request Handling)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│             Service Layer               │
│   (Business Logic & Validation)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Repository Layer              │
│          (Data Access/CRUD)             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│             Model Layer                 │
│        (Mongoose Schema/ODM)            │
└─────────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests
- Test service layer business logic in isolation
- Mock repository dependencies using Jest
- Verify validation rules and error handling
- Located in `tests/unit/`

### Integration Tests
- Test repository layer with real MongoDB instance
- Test API endpoints end-to-end
- Use **Testcontainers** to spin up MongoDB containers
- Located in `tests/integration/`

### White Box Testing Techniques
- **Statement Coverage**: Ensure all code statements are executed
- **Branch Coverage**: Test all conditional branches (if/else)
- **Path Coverage**: Test different execution paths
- **Boundary Testing**: Test edge cases and limits

## Getting Started

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Running Locally

```bash
# Start MongoDB with Docker
npm run docker:up

# Run in development mode
npm run dev

# Or build and run production
npm run build
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only (requires Docker)
npm run test:integration

# Run tests with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Docker Commands

```bash
# Build Docker images
npm run docker:build

# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down

# Run tests in Docker
npm run docker:test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/todos` | Get all todos (with optional filters) |
| GET | `/api/todos/stats` | Get todo statistics |
| GET | `/api/todos/overdue` | Get overdue todos |
| GET | `/api/todos/:id` | Get a todo by ID |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/:id` | Update a todo |
| PATCH | `/api/todos/:id/complete` | Mark todo as completed |
| DELETE | `/api/todos/:id` | Delete a todo |

### Query Parameters

- `status`: Filter by status (`pending`, `in_progress`, `completed`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `tags`: Filter by tags (comma-separated)

### Request/Response Examples

**Create Todo**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Testcontainers",
    "description": "Master integration testing with containers",
    "priority": "high",
    "tags": ["learning", "testing"]
  }'
```

**Get Todo Statistics**
```bash
curl http://localhost:3000/api/todos/stats
```

Response:
```json
{
  "total": 10,
  "pending": 5,
  "inProgress": 3,
  "completed": 2,
  "completionRate": 20
}
```

## Testcontainers Usage

This project uses [Testcontainers](https://testcontainers.com/) to provide real MongoDB instances during integration tests:

```typescript
import { MongoDBContainer } from '@testcontainers/mongodb';

describe('Integration Tests', () => {
  let mongoContainer: StartedMongoDBContainer;

  beforeAll(async () => {
    // Start a real MongoDB container
    mongoContainer = await new MongoDBContainer('mongo:7.0').start();

    // Connect to the containerized database
    await mongoose.connect(mongoContainer.getConnectionString());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoContainer.stop();
  });

  // Tests run against real MongoDB...
});
```

### Benefits of Testcontainers

- **Real Database**: Tests run against actual MongoDB, not mocks
- **Isolation**: Each test suite gets a fresh container
- **Reproducibility**: Consistent test environment across machines
- **CI/CD Ready**: Works seamlessly in GitHub Actions

## Coverage Report

Run `npm run test:coverage` to generate a coverage report. The report includes:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

Coverage thresholds are configured in `jest.config.js`.

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **Lint**: Code style and quality checks
2. **Unit Tests**: Fast, isolated tests with mocks
3. **Integration Tests**: Full tests with Testcontainers
4. **Build**: TypeScript compilation
5. **Docker**: Image build and health check

## License

MIT
