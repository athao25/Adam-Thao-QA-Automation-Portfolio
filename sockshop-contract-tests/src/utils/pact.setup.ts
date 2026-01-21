/**
 * Shared Pact Setup Utilities
 *
 * DRY utilities for consumer and provider test setup.
 */

import { Pact, PactOptions, Verifier, VerifierOptions } from '@pact-foundation/pact';
import { Server } from 'http';
import { Express } from 'express';
import path from 'path';
import { CONSUMERS, PROVIDERS, getPactBrokerConfig } from '../config/pact.config';

/**
 * Consumer test configuration
 */
export interface ConsumerTestConfig {
  consumer: (typeof CONSUMERS)[keyof typeof CONSUMERS];
  provider: (typeof PROVIDERS)[keyof typeof PROVIDERS];
}

/**
 * Create a standardized Pact instance for consumer tests
 */
export function createConsumerPact(config: ConsumerTestConfig): Pact {
  const { consumer, provider } = config;

  const pactOptions: PactOptions = {
    consumer,
    provider,
    port: 0,
    log: path.resolve(process.cwd(), 'logs', `${consumer}-${provider}.log`),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
    spec: 2,
  };

  return new Pact(pactOptions);
}

/**
 * Provider test configuration
 */
export interface ProviderTestConfig {
  provider: (typeof PROVIDERS)[keyof typeof PROVIDERS];
  pactFile: string;
  stateHandlers: Record<string, () => Promise<void>>;
}

/**
 * Provider test context returned from setup
 */
export interface ProviderTestContext {
  server: Server;
  port: number;
  verifyProvider: () => Promise<void>;
  cleanup: () => Promise<void>;
}

/**
 * Setup a provider test with standardized configuration
 */
export async function setupProviderTest(
  app: Express,
  config: ProviderTestConfig
): Promise<ProviderTestContext> {
  const { provider, pactFile, stateHandlers } = config;

  // Start the mock server
  const server = await new Promise<Server>((resolve) => {
    const srv = app.listen(0, () => {
      resolve(srv);
    });
  });

  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;

  // Create verifier function
  const verifyProvider = async (): Promise<void> => {
    const brokerConfig = getPactBrokerConfig();

    const verifierOptions: VerifierOptions = {
      provider,
      providerBaseUrl: `http://localhost:${String(port)}`,
      pactUrls: [pactFile],
      logLevel: 'warn',
      stateHandlers,
    };

    if (brokerConfig !== null) {
      Object.assign(verifierOptions, {
        publishVerificationResult: brokerConfig.publishVerificationResult,
        providerVersion: brokerConfig.providerVersion,
        providerVersionBranch: brokerConfig.providerVersionBranch,
      });
    }

    const verifier = new Verifier(verifierOptions);
    await verifier.verifyProvider();
  };

  // Create cleanup function
  const cleanup = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => {
        if (err !== undefined) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  return { server, port, verifyProvider, cleanup };
}

/**
 * Get pact file path for a consumer-provider pair
 */
export function getPactPath(consumer: string, provider: string): string {
  return path.resolve(process.cwd(), 'pacts', `${consumer}-${provider}.json`);
}

/**
 * Standard request headers for JSON APIs
 */
export const JSON_HEADERS = {
  request: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  response: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
