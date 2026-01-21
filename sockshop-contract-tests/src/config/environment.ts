/**
 * Environment configuration with type safety and validation
 */

export interface ServiceUrls {
  catalogue: string;
  carts: string;
  payment: string;
}

export interface Environment {
  services: ServiceUrls;
  pactBroker: {
    url: string | null;
    username: string | null;
    password: string | null;
  };
  logLevel: string;
  isCI: boolean;
}

/**
 * Validation error for missing required configuration
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Get string from environment with optional default
 */
function getEnvString(key: string, defaultValue?: string): string | null {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    return value;
  }
  return defaultValue ?? null;
}

/**
 * Get required string from environment, throw if missing
 */
function getRequiredEnvString(key: string, defaultValue: string): string {
  const value = getEnvString(key, defaultValue);
  if (value === null) {
    throw new ConfigurationError(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Get boolean from environment
 */
function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase();
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

/**
 * Default service URLs for local development
 */
const DEFAULT_SERVICE_URLS: ServiceUrls = {
  catalogue: 'http://localhost:8081',
  carts: 'http://localhost:8082',
  payment: 'http://localhost:8083',
};

/**
 * Load and validate environment configuration
 */
export function loadEnvironment(): Environment {
  return {
    services: {
      catalogue: getRequiredEnvString('CATALOGUE_SERVICE_URL', DEFAULT_SERVICE_URLS.catalogue),
      carts: getRequiredEnvString('CARTS_SERVICE_URL', DEFAULT_SERVICE_URLS.carts),
      payment: getRequiredEnvString('PAYMENT_SERVICE_URL', DEFAULT_SERVICE_URLS.payment),
    },
    pactBroker: {
      url: getEnvString('PACT_BROKER_URL'),
      username: getEnvString('PACT_BROKER_USERNAME'),
      password: getEnvString('PACT_BROKER_PASSWORD'),
    },
    logLevel: getRequiredEnvString('LOG_LEVEL', 'info'),
    isCI: getEnvBoolean('CI', false),
  };
}

/**
 * Singleton environment instance
 */
let environmentInstance: Environment | null = null;

/**
 * Get environment configuration (singleton)
 */
export function getEnvironment(): Environment {
  environmentInstance ??= loadEnvironment();
  return environmentInstance;
}

/**
 * Reset environment (for testing)
 */
export function resetEnvironment(): void {
  environmentInstance = null;
}
