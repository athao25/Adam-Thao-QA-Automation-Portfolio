import { Pact, PactOptions } from '@pact-foundation/pact';
import path from 'path';
import { createPactConfig, PactConfigOptions } from '../config/pact.config';

/**
 * Create a Pact instance with standardized configuration
 */
export function createPactInstance(options: PactConfigOptions): Pact {
  const config = createPactConfig(options);

  const pactOptions: PactOptions = {
    consumer: config.consumer,
    provider: config.provider,
    port: config.port,
    log: config.log,
    dir: config.dir,
    logLevel: config.logLevel,
    spec: config.spec,
  };

  return new Pact(pactOptions);
}

/**
 * Get the base URL for a Pact mock server
 */
export function getMockServerUrl(port: number): string {
  return `http://127.0.0.1:${String(port)}`;
}

/**
 * Wait for a specified number of milliseconds
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function until it succeeds or max retries reached
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < maxRetries - 1) {
        await wait(delayMs);
      }
    }
  }

  throw lastError ?? new Error('Retry failed');
}

/**
 * Assertion helper to check HTTP status codes
 */
export function expectStatus(actual: number, expected: number): void {
  if (actual !== expected) {
    throw new Error(`Expected status ${String(expected)}, got ${String(actual)}`);
  }
}

/**
 * Assertion helper to check if a value exists
 */
export function expectDefined<T>(value: T | undefined | null, name: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(`Expected ${name} to be defined`);
  }
}

/**
 * Assertion helper for array length
 */
export function expectArrayLength(arr: unknown[], minLength: number, name: string): void {
  if (arr.length < minLength) {
    throw new Error(`Expected ${name} to have at least ${String(minLength)} items, got ${String(arr.length)}`);
  }
}

/**
 * Get path to generated pact file
 */
export function getPactFilePath(consumer: string, provider: string): string {
  return path.resolve(process.cwd(), 'pacts', `${consumer}-${provider}.json`);
}

/**
 * Provider state description builder
 */
export class ProviderStateBuilder {
  private states: string[] = [];

  /**
   * Add a state to the builder
   */
  withState(state: string): this {
    this.states.push(state);
    return this;
  }

  /**
   * Build the provider state string
   */
  build(): string {
    return this.states.join(' and ');
  }
}

/**
 * Create a provider state description
 */
export function providerState(description: string): string {
  return description;
}

/**
 * Create a parameterized provider state
 */
export function parameterizedState(template: string, params: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

/**
 * HTTP methods enum for type safety
 */
export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

export type HttpMethodType = (typeof HttpMethod)[keyof typeof HttpMethod];

/**
 * Content types enum
 */
export const ContentType = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
} as const;

export type ContentTypeType = (typeof ContentType)[keyof typeof ContentType];
