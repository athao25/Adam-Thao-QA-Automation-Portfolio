/**
 * Common Pact matchers for reuse across consumer tests
 */

import { Matchers } from '@pact-foundation/pact';

const { like, eachLike, term, integer, decimal, boolean, string, uuid, iso8601DateTime } = Matchers;

/**
 * Pact matcher type alias
 */
type PactMatcher<T> = ReturnType<typeof like<T>>;

/**
 * Match a UUID string
 */
export const uuidMatcher = (): PactMatcher<string> => uuid();

/**
 * Match an ISO 8601 datetime string
 */
export const dateTimeMatcher = (): PactMatcher<string> => iso8601DateTime();

/**
 * Match a positive integer
 */
export const positiveIntegerMatcher = (example: number = 1): PactMatcher<number> =>
  integer(example);

/**
 * Match a decimal/float number
 */
export const decimalMatcher = (example: number = 10.99): PactMatcher<number> => decimal(example);

/**
 * Match a boolean value
 */
export const booleanMatcher = (example: boolean = true): PactMatcher<boolean> => boolean(example);

/**
 * Match a non-empty string
 */
export const stringMatcher = (example: string = 'string'): PactMatcher<string> => string(example);

/**
 * Match an object with structure like the example
 */
export function objectLike<T extends object>(example: T): PactMatcher<T> {
  return like(example);
}

/**
 * Match an array where each element matches the example
 */
export function arrayLike<T>(example: T, min: number = 1): PactMatcher<T[]> {
  return eachLike(example, { min });
}

/**
 * Match a URL pattern
 */
export const urlMatcher = (example: string = 'http://example.com'): PactMatcher<string> =>
  term({
    generate: example,
    matcher: '^https?://[\\w.-]+(?:/[\\w.-]*)*$',
  });

/**
 * Match a product ID format (alphanumeric with hyphens)
 */
export const productIdMatcher = (
  example: string = '03fef6ac-1896-4ce8-bd69-b798f85c6e0b'
): PactMatcher<string> =>
  term({
    generate: example,
    matcher: '^[a-f0-9-]{36}$',
  });

/**
 * Match a price (positive decimal with 2 decimal places)
 */
export const priceMatcher = (example: number = 19.99): PactMatcher<number> => decimal(example);

/**
 * Match a quantity (positive integer)
 */
export const quantityMatcher = (example: number = 1): PactMatcher<number> => integer(example);

/**
 * Match a customer ID
 */
export const customerIdMatcher = (example: string = 'customer-123'): PactMatcher<string> =>
  term({
    generate: example,
    matcher: '^[a-zA-Z0-9-]+$',
  });

/**
 * Catalogue-specific matchers
 */
export const catalogueMatchers = {
  /**
   * Match a product object
   */
  product: (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    id: productIdMatcher(),
    name: stringMatcher('Holy Socks'),
    description: stringMatcher('A beautiful pair of socks'),
    imageUrl: arrayLike(urlMatcher('/catalogue/images/sock1.jpg')),
    price: priceMatcher(19.99),
    count: quantityMatcher(100),
    tag: arrayLike(stringMatcher('formal')),
    ...overrides,
  }),

  /**
   * Match catalogue size response
   */
  catalogueSize: (): Record<string, unknown> => ({
    size: positiveIntegerMatcher(10),
  }),

  /**
   * Match tags response
   */
  tagsResponse: (): Record<string, unknown> => ({
    tags: arrayLike(stringMatcher('sport')),
  }),
};

/**
 * Cart-specific matchers
 */
export const cartMatchers = {
  /**
   * Match a cart item
   */
  cartItem: (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    itemId: productIdMatcher(),
    quantity: quantityMatcher(1),
    unitPrice: priceMatcher(19.99),
    ...overrides,
  }),

  /**
   * Match a cart object
   */
  cart: (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    customerId: customerIdMatcher(),
    items: arrayLike(cartMatchers.cartItem()),
    ...overrides,
  }),
};

/**
 * Payment-specific matchers
 */
export const paymentMatchers = {
  /**
   * Match an authorization result
   */
  authResult: (authorised: boolean = true): Record<string, unknown> => ({
    authorised: booleanMatcher(authorised),
    message: stringMatcher(authorised ? 'Payment authorized' : 'Payment declined'),
  }),
};
