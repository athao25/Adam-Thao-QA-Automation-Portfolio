import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Load environment variables from .env file
 * This must be done before importing the config module
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Import environment configuration after dotenv is loaded
 * This ensures all environment variables are available
 */
import { config } from './src/config/environment';

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 *
 * Environment variables are loaded from:
 * 1. .env file (for local development)
 * 2. System environment variables (for CI/CD)
 *
 * @see ./src/config/environment.ts for configuration details
 */
export default defineConfig({
  testDir: './tests',

  /* Global timeout for each test */
  timeout: config.defaultTimeout,

  /* Timeout for expect() assertions */
  expect: {
    timeout: config.expectTimeout,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: config.isCI,

  /* Retry failed tests - more retries in CI for flakiness */
  retries: config.retries,

  /* Number of parallel workers */
  workers: config.workers,

  /* Reporter configuration */
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results/junit-test-report.xml' }],
    ['html', { open: 'never' }],
  ],

  /* Snapshot path template */
  snapshotPathTemplate: './base-screenshots/{arg}{ext}',

  /* Shared settings for all projects */
  use: {
    /* Screenshot configuration */
    screenshot: config.screenshot,

    /* Base URL for navigation */
    baseURL: config.baseUrl,

    /* Custom test ID attribute for Sauce Demo */
    testIdAttribute: 'data-test',

    /* Trace recording configuration */
    trace: config.trace,

    /* Video recording configuration */
    video: config.video,

    /* Headless mode configuration */
    headless: config.headless,

    /* Slow down execution for debugging (0 = no slowdown) */
    launchOptions: {
      slowMo: config.slowMo,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project - authenticates and saves state
    {
      name: 'setup',
      testDir: './src/pages',
      testMatch: /auth\.setup\.ts/,
    },

    // Logged-in project - uses saved authentication state
    {
      name: 'logged-in',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /authenticated\.spec\.ts/,
    },

    // Default chromium project for tests that don't need auth
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      testIgnore: /authenticated\.spec\.ts/,
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },

    /* Mobile viewport testing
     * To enable mobile testing, uncomment the projects below.
     * Run specific mobile tests with: npx playwright test --project="Mobile Chrome"
     * Or run all projects with: npx playwright test --project=chromium --project="Mobile Chrome" --project="Mobile Safari"
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },
  ],
});
