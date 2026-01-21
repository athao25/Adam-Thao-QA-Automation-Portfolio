/**
 * Cart Service Test Fixtures
 *
 * Factory functions for creating test data for cart-related tests.
 */

import { Cart, CartItem, AddItemRequest, UpdateItemRequest } from '../../src/models';
import { PRODUCT_IDS } from './catalogue.fixture';

/**
 * Default customer IDs for testing
 */
export const CUSTOMER_IDS = {
  DEFAULT: 'customer-12345',
  VIP: 'customer-vip-001',
  NEW: 'customer-new-999',
  EMPTY_CART: 'customer-empty-cart',
} as const;

/**
 * Create a cart item fixture with optional overrides
 */
export function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    itemId: PRODUCT_IDS.HOLY_SOCKS,
    quantity: 1,
    unitPrice: 19.99,
    ...overrides,
  };
}

/**
 * Create a list of cart item fixtures
 */
export function createCartItems(count: number = 2): CartItem[] {
  const items: CartItem[] = [
    createCartItem(),
    createCartItem({
      itemId: PRODUCT_IDS.COLOURFUL_SOCKS,
      quantity: 2,
      unitPrice: 14.99,
    }),
    createCartItem({
      itemId: PRODUCT_IDS.SPORT_SOCKS,
      quantity: 3,
      unitPrice: 9.99,
    }),
  ];

  return items.slice(0, count);
}

/**
 * Create a cart fixture with optional overrides
 */
export function createCart(overrides: Partial<Cart> = {}): Cart {
  return {
    customerId: CUSTOMER_IDS.DEFAULT,
    items: createCartItems(2),
    ...overrides,
  };
}

/**
 * Create an empty cart fixture
 */
export function createEmptyCart(customerId: string = CUSTOMER_IDS.EMPTY_CART): Cart {
  return {
    customerId,
    items: [],
  };
}

/**
 * Create an add item request fixture
 */
export function createAddItemRequest(overrides: Partial<AddItemRequest> = {}): AddItemRequest {
  return {
    itemId: PRODUCT_IDS.HOLY_SOCKS,
    quantity: 1,
    unitPrice: 19.99,
    ...overrides,
  };
}

/**
 * Create an update item request fixture
 */
export function createUpdateItemRequest(
  overrides: Partial<UpdateItemRequest> = {}
): UpdateItemRequest {
  return {
    quantity: 2,
    ...overrides,
  };
}

/**
 * Create a cart with a single item
 */
export function createCartWithSingleItem(
  customerId: string = CUSTOMER_IDS.DEFAULT,
  item: CartItem = createCartItem()
): Cart {
  return {
    customerId,
    items: [item],
  };
}

/**
 * Create a cart with multiple items
 */
export function createCartWithMultipleItems(
  customerId: string = CUSTOMER_IDS.DEFAULT,
  itemCount: number = 3
): Cart {
  return {
    customerId,
    items: createCartItems(itemCount),
  };
}

/**
 * Create a cart with a specific total value
 */
export function createCartWithTotal(targetTotal: number): Cart {
  const unitPrice = 10;
  const quantity = Math.ceil(targetTotal / unitPrice);

  return {
    customerId: CUSTOMER_IDS.DEFAULT,
    items: [
      {
        itemId: PRODUCT_IDS.HOLY_SOCKS,
        quantity,
        unitPrice,
      },
    ],
  };
}

/**
 * Calculate expected cart total from items
 */
export function calculateExpectedTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}
