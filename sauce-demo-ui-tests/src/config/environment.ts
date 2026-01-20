/**
 * Environment Configuration Module
 *
 * This module provides centralized configuration management for the test suite.
 * It loads environment variables from .env files and exports a typed configuration object.
 *
 * Usage:
 *   import { config, Environment } from '@/config/environment';
 *   console.log(config.baseUrl);
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
// The path is relative to the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Supported environment types
 */
export type EnvironmentType = 'local' | 'ci' | 'staging' | 'production';

/**
 * Screenshot options type
 */
export type ScreenshotOption = 'on' | 'off' | 'only-on-failure';

/**
 * Video/Trace recording options type
 */
export type RecordingOption = 'on' | 'off' | 'retain-on-failure' | 'on-first-retry';

/**
 * Environment configuration interface
 * Provides type safety for all configuration values
 */
export interface EnvironmentConfig {
  // Application settings
  baseUrl: string;

  // Test execution settings
  defaultTimeout: number;
  expectTimeout: number;
  headless: boolean;
  retries: number;
  workers: number | undefined;

  // Browser settings
  slowMo: number;
  screenshot: ScreenshotOption;
  video: RecordingOption;
  trace: RecordingOption;

  // CI/CD settings
  isCI: boolean;
  environment: EnvironmentType;
}

/**
 * Helper function to parse boolean environment variables
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed boolean value
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === '') return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Helper function to parse integer environment variables
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed integer value
 */
function parseInteger(
  value: string | undefined,
  defaultValue: number
): number {
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Helper function to parse optional integer environment variables
 * @param value - The string value to parse
 * @returns Parsed integer value or undefined
 */
function parseOptionalInteger(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * Helper function to validate and parse environment type
 * @param value - The environment string to validate
 * @returns Valid environment type
 */
function parseEnvironmentType(value: string | undefined): EnvironmentType {
  const validEnvironments: EnvironmentType[] = ['local', 'ci', 'staging', 'production'];
  const env = (value || 'local').toLowerCase() as EnvironmentType;
  return validEnvironments.includes(env) ? env : 'local';
}

/**
 * Helper function to validate screenshot option
 * @param value - The screenshot option string
 * @returns Valid screenshot option
 */
function parseScreenshotOption(value: string | undefined): ScreenshotOption {
  const validOptions: ScreenshotOption[] = ['on', 'off', 'only-on-failure'];
  const option = (value || 'only-on-failure').toLowerCase() as ScreenshotOption;
  return validOptions.includes(option) ? option : 'only-on-failure';
}

/**
 * Helper function to validate recording option (video/trace)
 * @param value - The recording option string
 * @param defaultValue - Default value if invalid
 * @returns Valid recording option
 */
function parseRecordingOption(
  value: string | undefined,
  defaultValue: RecordingOption
): RecordingOption {
  const validOptions: RecordingOption[] = ['on', 'off', 'retain-on-failure', 'on-first-retry'];
  const option = (value || defaultValue).toLowerCase() as RecordingOption;
  return validOptions.includes(option) ? option : defaultValue;
}

/**
 * Build the configuration object from environment variables
 * This function is called once at module load time
 */
function buildConfig(): EnvironmentConfig {
  // Check if running in CI environment
  const isCI = parseBoolean(process.env.CI, false);
  const environment = parseEnvironmentType(process.env.NODE_ENV);

  return {
    // Application settings
    baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',

    // Test execution settings
    defaultTimeout: parseInteger(process.env.DEFAULT_TIMEOUT, 30000),
    expectTimeout: parseInteger(process.env.EXPECT_TIMEOUT, 10000),
    headless: parseBoolean(process.env.HEADLESS, true),
    retries: isCI ? parseInteger(process.env.RETRIES, 3) : parseInteger(process.env.RETRIES, 0),
    workers: isCI ? parseOptionalInteger(process.env.WORKERS) || 3 : parseOptionalInteger(process.env.WORKERS),

    // Browser settings
    slowMo: parseInteger(process.env.SLOW_MO, 0),
    screenshot: parseScreenshotOption(process.env.SCREENSHOT),
    video: parseRecordingOption(process.env.VIDEO, 'retain-on-failure'),
    trace: parseRecordingOption(process.env.TRACE, 'on-first-retry'),

    // CI/CD settings
    isCI,
    environment,
  };
}

/**
 * Exported configuration object
 * This is the main export that should be used throughout the application
 */
export const config: EnvironmentConfig = buildConfig();

/**
 * Helper class for environment-specific utilities
 */
export class Environment {
  /**
   * Check if running in CI environment
   */
  static get isCI(): boolean {
    return config.isCI;
  }

  /**
   * Check if running in local environment
   */
  static get isLocal(): boolean {
    return config.environment === 'local';
  }

  /**
   * Check if running in production environment
   */
  static get isProduction(): boolean {
    return config.environment === 'production';
  }

  /**
   * Check if running in staging environment
   */
  static get isStaging(): boolean {
    return config.environment === 'staging';
  }

  /**
   * Get the current environment name
   */
  static get current(): EnvironmentType {
    return config.environment;
  }

  /**
   * Check if headless mode is enabled
   */
  static get isHeadless(): boolean {
    return config.headless;
  }

  /**
   * Log configuration (useful for debugging)
   * Excludes sensitive information
   */
  static logConfig(): void {
    console.log('='.repeat(50));
    console.log('Environment Configuration');
    console.log('='.repeat(50));
    console.log(`Environment: ${config.environment}`);
    console.log(`Base URL: ${config.baseUrl}`);
    console.log(`Headless: ${config.headless}`);
    console.log(`Default Timeout: ${config.defaultTimeout}ms`);
    console.log(`Expect Timeout: ${config.expectTimeout}ms`);
    console.log(`Retries: ${config.retries}`);
    console.log(`Workers: ${config.workers || 'auto'}`);
    console.log(`CI Mode: ${config.isCI}`);
    console.log('='.repeat(50));
  }
}

// Default export for convenience
export default config;
