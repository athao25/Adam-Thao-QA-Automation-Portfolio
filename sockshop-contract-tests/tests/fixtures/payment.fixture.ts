/**
 * Payment Service Test Fixtures
 *
 * Factory functions for creating test data for payment-related tests.
 */

import {
  PaymentRequest,
  AuthResult,
  Customer,
  Address,
  Card,
  DeclineReasons,
} from '../../src/models';

/**
 * Default test addresses
 */
export const TEST_ADDRESSES = {
  VALID: {
    street: '123 Main Street',
    city: 'Manchester',
    postcode: 'M1 1AA',
    country: 'United Kingdom',
  },
  US: {
    street: '456 Broadway',
    city: 'New York',
    postcode: '10001',
    country: 'United States',
  },
} as const;

/**
 * Default test cards
 */
export const TEST_CARDS = {
  VALID: {
    longNum: '4111111111111111',
    expires: '12/2025',
    ccv: '123',
  },
  DECLINED: {
    longNum: '4000000000000002',
    expires: '12/2025',
    ccv: '123',
  },
  EXPIRED: {
    longNum: '4111111111111111',
    expires: '01/2020',
    ccv: '123',
  },
  INVALID_CVV: {
    longNum: '4111111111111111',
    expires: '12/2025',
    ccv: '999',
  },
} as const;

/**
 * Default test customers
 */
export const TEST_CUSTOMERS = {
  DEFAULT: {
    id: 'customer-12345',
    firstName: 'John',
    lastName: 'Doe',
  },
  VIP: {
    id: 'customer-vip-001',
    firstName: 'Jane',
    lastName: 'Smith',
  },
} as const;

/**
 * Create an address fixture with optional overrides
 */
export function createAddress(overrides: Partial<Address> = {}): Address {
  return {
    ...TEST_ADDRESSES.VALID,
    ...overrides,
  };
}

/**
 * Create a card fixture with optional overrides
 */
export function createCard(overrides: Partial<Card> = {}): Card {
  return {
    ...TEST_CARDS.VALID,
    ...overrides,
  };
}

/**
 * Create a customer fixture with optional overrides
 */
export function createCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    ...TEST_CUSTOMERS.DEFAULT,
    ...overrides,
  };
}

/**
 * Create a payment request fixture with optional overrides
 */
export function createPaymentRequest(overrides: Partial<PaymentRequest> = {}): PaymentRequest {
  return {
    customer: createCustomer(),
    address: createAddress(),
    card: createCard(),
    amount: 99.99,
    ...overrides,
  };
}

/**
 * Create a successful authorization result
 */
export function createSuccessfulAuthResult(message: string = 'Payment authorized'): AuthResult {
  return {
    authorised: true,
    message,
  };
}

/**
 * Create a declined authorization result
 */
export function createDeclinedAuthResult(
  reason: string = DeclineReasons.CARD_DECLINED
): AuthResult {
  return {
    authorised: false,
    message: reason,
  };
}

/**
 * Create a payment request with a declined card
 */
export function createDeclinedPaymentRequest(): PaymentRequest {
  return createPaymentRequest({
    card: createCard(TEST_CARDS.DECLINED),
  });
}

/**
 * Create a payment request with an expired card
 */
export function createExpiredCardPaymentRequest(): PaymentRequest {
  return createPaymentRequest({
    card: createCard(TEST_CARDS.EXPIRED),
  });
}

/**
 * Create a payment request with a specific amount
 */
export function createPaymentRequestWithAmount(amount: number): PaymentRequest {
  return createPaymentRequest({ amount });
}

/**
 * Create a high-value payment request (for fraud detection testing)
 */
export function createHighValuePaymentRequest(amount: number = 10000): PaymentRequest {
  return createPaymentRequest({ amount });
}

/**
 * Create a payment request for a specific customer
 */
export function createPaymentRequestForCustomer(customerId: string): PaymentRequest {
  return createPaymentRequest({
    customer: createCustomer({ id: customerId }),
  });
}
