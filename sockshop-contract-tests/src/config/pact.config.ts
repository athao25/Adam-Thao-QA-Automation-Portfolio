import { LogLevel } from '@pact-foundation/pact';
import path from 'path';

/**
 * Consumer names for contract identification
 */
export const CONSUMERS = {
  FRONTEND: 'Frontend',
  ORDERS: 'Orders',
} as const;

/**
 * Provider names for contract identification
 */
export const PROVIDERS = {
  CATALOGUE: 'Catalogue',
  CARTS: 'Carts',
  PAYMENT: 'Payment',
} as const;

/**
 * Pact specification version
 */
export const PACT_SPEC_VERSION = 2;

/**
 * Base Pact configuration shared across tests
 */
export interface PactConfigOptions {
  consumer: string;
  provider: string;
  port?: number;
}

/**
 * Get log level from environment or default
 */
function getPactLogLevel(): LogLevel {
  const level = process.env.PACT_LOG_LEVEL?.toLowerCase() ?? 'warn';
  const logLevels: Record<string, LogLevel> = {
    trace: 'trace',
    debug: 'debug',
    info: 'info',
    warn: 'warn',
    error: 'error',
  };
  return logLevels[level] ?? 'warn';
}

/**
 * Create Pact configuration for consumer tests
 */
export function createPactConfig(options: PactConfigOptions): {
  consumer: string;
  provider: string;
  port: number;
  log: string;
  dir: string;
  logLevel: LogLevel;
  spec: number;
} {
  const { consumer, provider, port = 0 } = options;
  const pactDir = path.resolve(process.cwd(), 'pacts');
  const logDir = path.resolve(process.cwd(), 'logs');

  return {
    consumer,
    provider,
    port,
    log: path.join(logDir, `${consumer}-${provider}.log`),
    dir: pactDir,
    logLevel: getPactLogLevel(),
    spec: PACT_SPEC_VERSION,
  };
}

/**
 * Pact Broker configuration for CI/CD
 */
export interface PactBrokerConfig {
  pactBrokerUrl: string;
  pactBrokerUsername?: string;
  pactBrokerPassword?: string;
  publishVerificationResult: boolean;
  providerVersion: string;
  providerVersionBranch?: string;
}

/**
 * Get Pact Broker configuration from environment
 */
export function getPactBrokerConfig(): PactBrokerConfig | null {
  const brokerUrl = process.env.PACT_BROKER_URL;

  if (brokerUrl === undefined || brokerUrl === '') {
    return null;
  }

  return {
    pactBrokerUrl: brokerUrl,
    pactBrokerUsername: process.env.PACT_BROKER_USERNAME,
    pactBrokerPassword: process.env.PACT_BROKER_PASSWORD,
    publishVerificationResult: process.env.CI === 'true',
    providerVersion: process.env.GIT_COMMIT ?? process.env.npm_package_version ?? '1.0.0',
    providerVersionBranch: process.env.GIT_BRANCH,
  };
}

/**
 * Contract IDs for documentation and tracking
 */
export const CONTRACT_IDS = {
  FRONTEND_CATALOGUE: 'CDC-001',
  ORDERS_CARTS: 'CDC-002',
  ORDERS_PAYMENT: 'CDC-003',
} as const;
