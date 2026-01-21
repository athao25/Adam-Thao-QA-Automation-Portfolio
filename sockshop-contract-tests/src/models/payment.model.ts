/**
 * Payment Service Domain Models
 *
 * Represents the payment processing data structures used in the Sock Shop.
 */

/**
 * Customer address for payment
 */
export interface Address {
  /** Street address line */
  street: string;
  /** City name */
  city: string;
  /** Postal/ZIP code */
  postcode: string;
  /** Country name */
  country: string;
}

/**
 * Payment card details
 */
export interface Card {
  /** Card number (last 4 digits for display) */
  longNum: string;
  /** Card expiration date */
  expires: string;
  /** Card verification value */
  ccv: string;
}

/**
 * Customer information for payment
 */
export interface Customer {
  /** Customer identifier */
  id: string;
  /** Customer first name */
  firstName: string;
  /** Customer last name */
  lastName: string;
}

/**
 * Payment authorization request
 */
export interface PaymentRequest {
  /** Customer details */
  customer: Customer;
  /** Billing address */
  address: Address;
  /** Payment card information */
  card: Card;
  /** Total amount to authorize */
  amount: number;
}

/**
 * Payment authorization result
 */
export interface AuthResult {
  /** Whether the payment was authorized */
  authorised: boolean;
  /** Human-readable message about the result */
  message: string;
}

/**
 * Payment decline reasons
 */
export const DeclineReasons = {
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  CARD_EXPIRED: 'Card expired',
  CARD_DECLINED: 'Card declined by issuer',
  INVALID_CVV: 'Invalid security code',
  FRAUD_SUSPECTED: 'Transaction declined due to suspected fraud',
} as const;

export type DeclineReason = (typeof DeclineReasons)[keyof typeof DeclineReasons];

/**
 * Type guard to check if an object is an Address
 */
export function isAddress(obj: unknown): obj is Address {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const addr = obj as Record<string, unknown>;

  return (
    typeof addr.street === 'string' &&
    typeof addr.city === 'string' &&
    typeof addr.postcode === 'string' &&
    typeof addr.country === 'string'
  );
}

/**
 * Type guard to check if an object is a Card
 */
export function isCard(obj: unknown): obj is Card {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const card = obj as Record<string, unknown>;

  return (
    typeof card.longNum === 'string' &&
    typeof card.expires === 'string' &&
    typeof card.ccv === 'string'
  );
}

/**
 * Type guard to check if an object is a Customer
 */
export function isCustomer(obj: unknown): obj is Customer {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const cust = obj as Record<string, unknown>;

  return (
    typeof cust.id === 'string' &&
    typeof cust.firstName === 'string' &&
    typeof cust.lastName === 'string'
  );
}

/**
 * Type guard to check if an object is a PaymentRequest
 */
export function isPaymentRequest(obj: unknown): obj is PaymentRequest {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const req = obj as Record<string, unknown>;

  return (
    isCustomer(req.customer) &&
    isAddress(req.address) &&
    isCard(req.card) &&
    typeof req.amount === 'number'
  );
}

/**
 * Type guard to check if an object is an AuthResult
 */
export function isAuthResult(obj: unknown): obj is AuthResult {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const result = obj as Record<string, unknown>;

  return typeof result.authorised === 'boolean' && typeof result.message === 'string';
}
