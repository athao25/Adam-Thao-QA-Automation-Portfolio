/**
 * Jest Setup - Global Test Configuration
 *
 * Handles flaky test retries and global test setup.
 */

// Retry flaky tests up to 2 times (total 3 attempts)
// This helps with Pact mock server timing issues
jest.retryTimes(2, { logErrorsBeforeRetry: true });
