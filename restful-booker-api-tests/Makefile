.PHONY: install test smoke regression lint format clean help

# Default target
help:
	@echo "Available targets:"
	@echo "  install     - Install dependencies"
	@echo "  test        - Run all tests"
	@echo "  smoke       - Run smoke tests only"
	@echo "  regression  - Run regression tests"
	@echo "  booking     - Run booking tests"
	@echo "  auth        - Run authentication tests"
	@echo "  validation  - Run validation tests"
	@echo "  schema      - Run schema tests"
	@echo "  coverage    - Run tests with coverage"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code with black"
	@echo "  clean       - Remove generated files"
	@echo "  allure      - Generate and serve Allure report"

# Install dependencies
install:
	pip install -r requirements.txt

# Run all tests
test:
	pytest -v --tb=short

# Run smoke tests
smoke:
	pytest -v -m smoke --tb=short

# Run regression tests
regression:
	pytest -v -m regression --tb=short

# Run booking tests
booking:
	pytest -v -m booking --tb=short

# Run auth tests
auth:
	pytest -v -m auth --tb=short

# Run validation tests
validation:
	pytest -v -m validation --tb=short

# Run schema tests
schema:
	pytest -v -m schema --tb=short

# Run tests with coverage
coverage:
	pytest --cov=src --cov-report=html --cov-report=term-missing

# Run linting
lint:
	pylint src/ tests/

# Format code
format:
	black src/ tests/
	isort src/ tests/

# Clean generated files
clean:
	rm -rf __pycache__ .pytest_cache .coverage htmlcov allure-results allure-report
	rm -rf src/__pycache__ tests/__pycache__ tests/data/__pycache__
	rm -f test-results.xml
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true

# Generate Allure report
allure:
	pytest --alluredir=allure-results
	allure serve allure-results

# Quick test - run tests in parallel
quick:
	pytest -v -n auto --tb=short
