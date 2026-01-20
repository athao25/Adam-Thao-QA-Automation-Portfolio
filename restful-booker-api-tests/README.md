# Restful-Booker API Test Suite

A comprehensive API test automation suite for the [Restful-Booker](https://restful-booker.herokuapp.com/) API, demonstrating professional API testing practices using Python.

## Tech Stack

- **Python 3.11+** - Programming language
- **pytest** - Test framework
- **pytest-describe** - BDD-style test organization
- **requests** - HTTP client library
- **expects** - Fluent assertion library
- **jsonschema** - JSON schema validation
- **Pydantic** - Data validation and models
- **Faker** - Test data generation
- **Allure** - Test reporting

## Project Structure

```
restful-booker-api-tests/
├── src/
│   ├── endpoints/           # API endpoint definitions
│   │   ├── config.py        # Base URL and headers
│   │   ├── auth.py          # Authentication endpoint
│   │   ├── booking.py       # Booking endpoints
│   │   └── ping.py          # Health check endpoint
│   ├── api_client.py        # Main API client class
│   ├── models.py            # Pydantic data models
│   └── schemas.py           # JSON schemas for validation
├── tests/
│   ├── data/
│   │   └── test_data.py     # Test data and scenarios
│   ├── conftest.py          # Pytest fixtures
│   ├── test_health_check.py # Health check tests
│   ├── test_authentication.py # Auth tests
│   ├── test_booking_create.py # POST /booking tests
│   ├── test_booking_read.py   # GET /booking tests
│   ├── test_booking_update.py # PUT/PATCH /booking tests
│   ├── test_booking_delete.py # DELETE /booking tests
│   └── test_validation.py     # Input validation tests
├── .github/
│   └── workflows/
│       └── api-tests.yml    # CI/CD pipeline
├── requirements.txt
├── pyproject.toml
└── README.md
```

## Installation

```bash
# Clone the repository
git clone https://github.com/athao25/Adam-Thao-QA-Automation-Portfolio.git
cd Adam-Thao-QA-Automation-Portfolio/restful-booker-api-tests

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Running Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test markers
pytest -m smoke          # Smoke tests
pytest -m regression     # Regression tests
pytest -m booking        # Booking-related tests
pytest -m auth           # Authentication tests
pytest -m validation     # Validation tests
pytest -m schema         # Schema validation tests

# Run specific test file
pytest tests/test_booking_create.py

# Run with coverage
pytest --cov=src --cov-report=html

# Generate Allure report
pytest --alluredir=allure-results
allure serve allure-results
```

## Test Categories

### Smoke Tests (`-m smoke`)
Critical path tests verifying core functionality:
- Health check endpoint responds
- Authentication works
- Basic CRUD operations function

### Regression Tests (`-m regression`)
Comprehensive tests covering:
- Edge cases
- Boundary conditions
- Data filtering
- Error handling

### Validation Tests (`-m validation`)
Input validation and error handling:
- Invalid data types
- Missing required fields
- Malformed requests
- SQL injection attempts
- XSS prevention

### Schema Tests (`-m schema`)
Response structure validation:
- JSON schema compliance
- Required fields presence
- Data type verification

## API Coverage

| Endpoint | Method | Description | Coverage |
|----------|--------|-------------|----------|
| `/ping` | GET | Health check | ✅ |
| `/auth` | POST | Create auth token | ✅ |
| `/booking` | GET | Get booking IDs | ✅ |
| `/booking` | POST | Create booking | ✅ |
| `/booking/:id` | GET | Get booking | ✅ |
| `/booking/:id` | PUT | Update booking | ✅ |
| `/booking/:id` | PATCH | Partial update | ✅ |
| `/booking/:id` | DELETE | Delete booking | ✅ |

## Test Design Patterns

### BDD-Style Organization
Tests use `describe_*` functions for clear, readable test organization:

```python
def describe_create_booking():
    """Tests for POST /booking endpoint."""

    def test_should_create_booking_with_valid_data(api_client):
        """Verify successful booking creation."""
        result = api_client.create_booking(valid_data)
        expect(result.status_code).to(equal(HTTPStatus.OK))
```

### Fluent Assertions
Using the `expects` library for readable assertions:

```python
expect(response.status_code).to(equal(HTTPStatus.OK))
expect(booking).to(have_keys("firstname", "lastname"))
expect(result.json()).to(be_a(list))
```

### Data-Driven Testing
Parameterized tests for comprehensive coverage:

```python
@pytest.mark.parametrize("scenario", INVALID_BOOKING_SCENARIOS)
def test_should_handle_invalid_data(api_client, scenario):
    result = api_client.create_booking(scenario["data"])
    expect(result.status_code).not_to(equal(HTTPStatus.INTERNAL_SERVER_ERROR))
```

### Fixture-Based Setup
Reusable fixtures for test isolation:

```python
@pytest.fixture
def created_booking(authenticated_client, valid_booking_data):
    """Create a booking for tests that need existing data."""
    response = authenticated_client.create_booking(valid_booking_data)
    yield response.json()
    # Cleanup handled automatically
```

## Environment Configuration

Create a `.env` file for custom configuration:

```env
BASE_URL=https://restful-booker.herokuapp.com
API_USERNAME=admin
API_PASSWORD=password123
```

## CI/CD

GitHub Actions workflow runs:
- On push to main/master
- On pull requests
- Tests against Python 3.11 and 3.12
- Publishes JUnit test reports

## Key Testing Concepts Demonstrated

- **API Client Pattern**: Centralized HTTP request handling
- **Schema Validation**: JSON schema compliance testing
- **Authentication Testing**: Token and Basic auth flows
- **Error Handling**: Graceful handling of invalid inputs
- **Content Negotiation**: JSON and XML response handling
- **Idempotency Testing**: Verify safe retries
- **Boundary Testing**: Edge cases and limits
- **Security Testing**: SQL injection, XSS prevention

## License

MIT License - See LICENSE file for details
