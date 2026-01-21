# QA Automation Portfolio

A comprehensive QA automation portfolio demonstrating professional testing practices across UI, API, and architectural testing. This repository showcases modern testing frameworks, design patterns, and best practices used in the software testing industry.

## Projects

| Project | Description | Tech Stack |
|---------|-------------|------------|
| [Sauce Demo UI Tests](./sauce-demo-ui-tests) | End-to-end UI automation for an e-commerce application | TypeScript, Playwright |
| [Restful Booker API Tests](./restful-booker-api-tests) | Comprehensive API test suite with schema validation | Python, pytest, requests |
| [Layered Architecture Tests](./layered-architecture-tests) | Unit and integration testing with Testcontainers | TypeScript, Jest, MongoDB |
| [Sock Shop Contract Tests](./sockshop-contract-tests) | Consumer-Driven Contract testing for microservices | TypeScript, Pact, Jest |

---

## Sauce Demo UI Tests

End-to-end UI automation tests for the [Sauce Demo](https://www.saucedemo.com/) e-commerce application using Playwright.

### Tech Stack
- **TypeScript** - Type-safe test development
- **Playwright** - Modern browser automation
- **Axe-core** - Accessibility testing
- **Faker.js** - Test data generation
- **ESLint & Prettier** - Code quality

### Features
- Page Object Model design pattern
- Cross-browser testing (Chromium, Firefox, WebKit)
- Visual regression testing with screenshots
- Accessibility testing integration
- Smoke and regression test suites
- CI/CD with GitHub Actions

### Quick Start
```bash
cd sauce-demo-ui-tests
npm install
npx playwright install
npm test
```

### Available Scripts
```bash
npm test              # Run all tests
npm run test:smoke    # Run smoke tests
npm run test:headed   # Run with browser visible
npm run test:ui       # Open Playwright UI mode
npm run test:debug    # Debug mode
```

---

## Restful Booker API Tests

A professional API test automation suite for the [Restful-Booker](https://restful-booker.herokuapp.com/) API demonstrating comprehensive API testing practices.

### Tech Stack
- **Python 3.11+** - Programming language
- **pytest** - Test framework with BDD-style organization
- **requests** - HTTP client
- **Pydantic** - Data validation and models
- **jsonschema** - Response schema validation
- **Allure** - Test reporting

### Features
- API client pattern for centralized request handling
- JSON schema validation
- Authentication testing (token & basic auth)
- Data-driven testing with parameterization
- Security testing (SQL injection, XSS prevention)
- Comprehensive CRUD operation coverage

### API Coverage
| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/ping` | GET | Health check |
| `/auth` | POST | Authentication |
| `/booking` | GET, POST | Booking collection |
| `/booking/:id` | GET, PUT, PATCH, DELETE | Individual booking |

### Quick Start
```bash
cd restful-booker-api-tests
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
pytest
```

### Test Categories
```bash
pytest -m smoke       # Critical path tests
pytest -m regression  # Comprehensive tests
pytest -m validation  # Input validation tests
pytest -m schema      # Schema compliance tests
```

---

## Layered Architecture Tests

A TypeScript/Express/MongoDB Todo API demonstrating comprehensive testing practices across architectural layers using Testcontainers for real database integration testing.

### Tech Stack
- **Node.js 20** - Runtime
- **TypeScript** - Type-safe development
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Jest** - Testing framework
- **Testcontainers** - Container-based integration testing
- **Docker** - Containerization

### Architecture
```
Routes Layer (HTTP Handling)
        │
Service Layer (Business Logic)
        │
Repository Layer (Data Access)
        │
Model Layer (Mongoose Schema)
```

### Testing Strategy
- **Unit Tests** - Service layer with mocked dependencies
- **Integration Tests** - Repository and API tests with real MongoDB via Testcontainers
- **Coverage Analysis** - Statement, branch, and path coverage

### Quick Start
```bash
cd layered-architecture-tests
npm install
cp .env.example .env
npm run docker:up   # Start MongoDB
npm test            # Run all tests
```

### Available Scripts
```bash
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests (requires Docker)
npm run test:coverage     # Generate coverage report
npm run docker:test       # Run tests in Docker
```

---

## Sock Shop Contract Tests

Consumer-Driven Contract (CDC) testing suite for the Sock Shop microservices platform using Pact-JS. This project demonstrates how to validate API contracts between microservices without requiring end-to-end integration environments.

### Tech Stack
- **TypeScript** - Type-safe development
- **Pact-JS** - Contract testing framework
- **Jest** - Test runner
- **Express** - Mock provider servers
- **Axios** - HTTP client

### Architecture
```
Consumer Tests          Provider Tests
      │                       │
      ▼                       ▼
┌──────────┐           ┌──────────────┐
│  Generate │           │    Verify    │
│   Pact    │──────────►│   Contract   │
│   JSON    │           │   Honored    │
└──────────┘           └──────────────┘
```

### Contracts Under Test
| Contract | Consumer | Provider | Interactions |
|----------|----------|----------|--------------|
| CDC-001 | Frontend | Catalogue | 4 |
| CDC-002 | Orders | Carts | 3 |
| CDC-003 | Orders | Payment | 2 |

### Features
- Consumer-driven contract definition
- Provider state handlers for test scenarios
- Pact matchers for flexible contract validation
- Reusable test utilities (DRY patterns)
- CI/CD ready with GitHub Actions

### Quick Start
```bash
cd sockshop-contract-tests
npm install
npm test
```

### Available Scripts
```bash
npm test              # Run all contract tests
npm run test:consumer # Generate pact contracts
npm run test:provider # Verify provider compliance
npm run lint          # Code quality checks
```

---

## Skills Demonstrated

### Testing Practices
- Test automation framework design
- Page Object Model pattern
- API client abstraction pattern
- Layered architecture testing
- Consumer-Driven Contract testing
- BDD-style test organization
- Data-driven testing
- Schema validation

### Technical Skills
- TypeScript & Python
- Playwright & Jest
- pytest & requests
- Pact-JS (Contract Testing)
- MongoDB & Testcontainers
- Docker & Docker Compose
- GitHub Actions CI/CD
- Code quality tools (ESLint, Prettier)

### Testing Types
- Functional testing (UI & API)
- Contract testing (CDC)
- Integration testing
- Unit testing
- Accessibility testing
- Visual regression testing
- Security testing
- Schema validation testing

---

## CI/CD

Each project includes GitHub Actions workflows for automated testing:

- Runs on push to main and pull requests
- Cross-platform testing
- Test result reporting
- Code quality checks

---

## Author

**Adam Thao**

---

## License

MIT License - See individual project LICENSE files for details.
