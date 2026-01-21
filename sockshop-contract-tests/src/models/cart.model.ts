/**
 * Cart Service Domain Models
 *
 * Represents the shopping cart data structures used in the Sock Shop.
 */

/**
 * Individual item in a shopping cart
 */
export interface CartItem {
  /** Product ID reference */
  itemId: string;
  /** Quantity of this item in the cart */
  quantity: number;
  /** Price per unit */
  unitPrice: number;
}

/**
 * Shopping cart representation
 */
export interface Cart {
  /** Customer identifier who owns the cart */
  customerId: string;
  /** Items in the cart */
  items: CartItem[];
}

/**
 * Request to add an item to cart
 */
export interface AddItemRequest {
  /** Product ID to add */
  itemId: string;
  /** Quantity to add */
  quantity: number;
  /** Unit price of the item */
  unitPrice: number;
}

/**
 * Request to update cart item quantity
 */
export interface UpdateItemRequest {
  /** New quantity for the item */
  quantity: number;
}

/**
 * Cart operation response
 */
export interface CartOperationResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** Optional message */
  message?: string;
}

/**
 * Calculate total price of a cart item
 */
export function calculateItemTotal(item: CartItem): number {
  return item.quantity * item.unitPrice;
}

/**
 * Calculate total price of all items in a cart
 */
export function calculateCartTotal(cart: Cart): number {
  return cart.items.reduce((total, item) => total + calculateItemTotal(item), 0);
}

/**
 * Type guard to check if an object is a CartItem
 */
export function isCartItem(obj: unknown): obj is CartItem {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const item = obj as Record<string, unknown>;

  return (
    typeof item.itemId === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.unitPrice === 'number'
  );
}

/**
 * Type guard to check if an object is a Cart
 */
export function isCart(obj: unknown): obj is Cart {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const cart = obj as Record<string, unknown>;

  return (
    typeof cart.customerId === 'string' &&
    Array.isArray(cart.items) &&
    cart.items.every(isCartItem)
  );
}

/**
 * Type guard to check if an object is an array of CartItems
 */
export function isCartItemArray(obj: unknown): obj is CartItem[] {
  return Array.isArray(obj) && obj.every(isCartItem);
}
