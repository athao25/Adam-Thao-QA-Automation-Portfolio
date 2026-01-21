# Consumer-Driven Contract Testing Suite

## Sock Shop Microservices - Pact Implementation

This project implements **Consumer-Driven Contract (CDC) Testing** using [Pact-JS](https://github.com/pact-foundation/pact-js) to validate API contracts between microservices in the Sock Shop e-commerce platform.

## Overview

Consumer-Driven Contract Testing shifts contract ownership to consumers, ensuring providers never break integrations. This approach:

- **Prevents integration failures** by validating contracts before deployment
- **Enables independent deployments** of microservices
- **Documents API interactions** through generated contract files
- **Provides fast feedback** without requiring live services

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTRACT TEST FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CONSUMER SIDE                      PROVIDER SIDE              │
│   ─────────────                      ─────────────              │
│                                                                 │
│   ┌─────────────┐                    ┌─────────────┐           │
│   │  Consumer   │   generates        │  Provider   │           │
│   │   Tests     │ ──────────────►    │   Tests     │           │
│   └─────────────┘    Pact JSON       └─────────────┘           │
│         │                                   │                   │
│         ▼                                   ▼                   │
│   ┌─────────────┐                    ┌─────────────┐           │
│   │ Mock Server │                    │ Real/Mock   │           │
│   │   (Pact)    │                    │  Provider   │           │
│   └─────────────┘                    └─────────────┘           │
│         │                                   │                   │
│         ▼                                   ▼                   │
│   ┌─────────────┐                    ┌─────────────┐           │
│   │   Verify    │                    │   Verify    │           │
│   │  Consumer   │                    │  Contract   │           │
│   │   Works     │                    │  Honored    │           │
│   └─────────────┘                    └─────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Contracts Under Test

| Contract ID | Consumer | Provider | Interactions |
|-------------|----------|----------|--------------|
| CDC-001 | Frontend | Catalogue | 4 |
| CDC-002 | Orders | Carts | 3 |
| CDC-003 | Orders | Payment | 2 |

### CDC-001: Frontend → Catalogue

- **CDC-001-01**: List all products (`GET /catalogue`)
- **CDC-001-02**: Get product details (`GET /catalogue/{id}`)
- **CDC-001-03**: Get catalogue count (`GET /catalogue/size`)
- **CDC-001-04**: List product tags (`GET /tags`)

### CDC-002: Orders → Carts

- **CDC-002-01**: Retrieve customer cart (`GET /carts/{customerId}`)
- **CDC-002-02**: Get cart line items (`GET /carts/{customerId}/items`)
- **CDC-002-03**: Clear cart post-order (`DELETE /carts/{customerId}`)

### CDC-003: Orders → Payment

- **CDC-003-01**: Authorize payment (`POST /paymentAuth`)
- **CDC-003-02**: Declined payment (`POST /paymentAuth`)

## Project Structure

```
sockshop-contract-tests/
├── src/
│   ├── config/           # Pact and environment configuration
│   ├── clients/          # Consumer HTTP clients
│   ├── providers/        # Provider state handlers
│   ├── models/           # Domain models with validation
│   └── utils/            # Pact matchers and test helpers
├── tests/
│   ├── consumer/         # Consumer contract tests
│   ├── provider/         # Provider verification tests
│   └── fixtures/         # Test data factories
├── pacts/                # Generated contract files
└── logs/                 # Pact interaction logs
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
cd sockshop-contract-tests
npm install
```

### Configuration

Copy the example environment file and configure as needed:

```bash
cp .env.example .env
```

## Running Tests

### All Tests

```bash
npm test
```

### Consumer Tests Only

Generate Pact contract files:

```bash
npm run test:consumer
```

This generates three contract files in the `pacts/` directory:
- `Frontend-Catalogue.json`
- `Orders-Carts.json`
- `Orders-Payment.json`

### Provider Verification Only

Verify providers honor the contracts:

```bash
npm run test:provider
```

### Single Provider Verification

```bash
npm run test:provider -- --testNamePattern="Catalogue"
```

### With Coverage

```bash
npm run test:coverage
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm test` | Run all contract tests |
| `npm run test:consumer` | Run consumer tests (generates pacts) |
| `npm run test:provider` | Run provider verification |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ci` | Run tests in CI mode |

## How It Works

### Consumer Tests

1. Consumer tests define expected interactions with a provider
2. Pact starts a mock server that simulates the provider
3. The consumer client makes requests to the mock server
4. Pact records the interactions and generates a contract file

### Provider Verification

1. The contract file defines expected behavior
2. State handlers set up the provider in required states
3. Pact replays consumer interactions against the real/mock provider
4. Verification passes if the provider honors all contracts

## Key Concepts

### Provider States

Provider states describe the condition the provider should be in before an interaction:

```typescript
// Consumer defines the required state
await provider.addInteraction({
  state: 'products exist in catalogue',
  uponReceiving: 'a request to list all products',
  // ...
});

// Provider handles the state setup
const stateHandlers = {
  'products exist in catalogue': async () => {
    // Set up test data
    productStore.set('id', mockProduct);
  },
};
```

### Matchers

Pact matchers allow flexible contract verification:

```typescript
// Exact match not required - just structure and types
body: {
  id: Matchers.uuid(),
  name: Matchers.string('Example'),
  price: Matchers.decimal(19.99),
  tags: Matchers.eachLike('category'),
}
```

## CI/CD Integration

The GitHub Actions workflow:

1. **Lint** - TypeScript check and ESLint
2. **Consumer Tests** - Generate pact files
3. **Provider Verification** - Verify each provider (matrix strategy)
4. **Summary** - Report results

See `.github/workflows/contract-tests.yml` for details.

## Best Practices

1. **Write consumer tests first** - They define the contract
2. **Use meaningful provider states** - Clearly describe required conditions
3. **Use matchers** - Avoid brittle exact-value matching
4. **Keep contracts focused** - Test one interaction per test
5. **Version your contracts** - Pact spec version ensures compatibility

## Troubleshooting

### Pact files not generated

Ensure the `pacts/` and `logs/` directories exist:

```bash
mkdir -p pacts logs
```

### Provider verification fails

1. Check that consumer tests ran successfully first
2. Verify state handlers match state descriptions exactly
3. Check provider mock server returns expected response structure

### Type errors

Run TypeScript compilation to see detailed errors:

```bash
npm run build
```

## Technologies

- **[Pact-JS](https://github.com/pact-foundation/pact-js)** - Contract testing framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Jest](https://jestjs.io/)** - Testing framework
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Express](https://expressjs.com/)** - Mock provider servers

## License

MIT
