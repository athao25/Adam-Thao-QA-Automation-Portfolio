/**
 * Carts Service State Handler
 *
 * Handles provider state setup and teardown for Carts service verification.
 * These handlers configure the mock/real provider to match expected states
 * defined in the consumer contracts.
 */

import express, { Express, Request, Response } from 'express';
import { createCart, createCartItems, CUSTOMER_IDS } from '../../tests/fixtures';
import { Cart } from '../models';

/**
 * In-memory cart store for testing
 */
const cartStore: Map<string, Cart> = new Map();

/**
 * Reset the cart state
 */
export function resetCartsState(): void {
  cartStore.clear();
}

/**
 * State handlers for the Carts provider
 */
export const cartsStateHandlers: Record<string, () => Promise<void>> = {
  /**
   * State: cart exists for {customerId}
   * Sets up a cart for the specified customer
   */
  [`cart exists for ${CUSTOMER_IDS.DEFAULT}`]: (): Promise<void> => {
    resetCartsState();
    const cart = createCart({ customerId: CUSTOMER_IDS.DEFAULT });
    cartStore.set(CUSTOMER_IDS.DEFAULT, cart);
    return Promise.resolve();
  },

  /**
   * State: cart has items for {customerId}
   * Sets up a cart with items for the specified customer
   */
  [`cart has items for ${CUSTOMER_IDS.DEFAULT}`]: (): Promise<void> => {
    resetCartsState();
    const cart = createCart({
      customerId: CUSTOMER_IDS.DEFAULT,
      items: createCartItems(3),
    });
    cartStore.set(CUSTOMER_IDS.DEFAULT, cart);
    return Promise.resolve();
  },

  /**
   * State: empty cart exists for {customerId}
   * Sets up an empty cart for testing
   */
  [`empty cart exists for ${CUSTOMER_IDS.EMPTY_CART}`]: (): Promise<void> => {
    resetCartsState();
    const cart: Cart = {
      customerId: CUSTOMER_IDS.EMPTY_CART,
      items: [],
    };
    cartStore.set(CUSTOMER_IDS.EMPTY_CART, cart);
    return Promise.resolve();
  },
};

/**
 * Request body types for cart operations
 */
interface AddItemBody {
  itemId: string;
  quantity: number;
  unitPrice: number;
}

interface UpdateItemBody {
  quantity: number;
}

/**
 * Create a mock Carts service Express app
 */
export function createCartsMockServer(): Express {
  const app = express();
  app.use(express.json());

  // GET /carts/:customerId - Get customer cart
  app.get('/carts/:customerId', (req: Request, res: Response) => {
    const cart = cartStore.get(req.params.customerId);
    if (cart !== undefined) {
      res.json(cart);
    } else {
      // Return empty cart if not found (common pattern)
      res.json({ customerId: req.params.customerId, items: [] });
    }
  });

  // GET /carts/:customerId/items - Get cart items
  app.get('/carts/:customerId/items', (req: Request, res: Response) => {
    const cart = cartStore.get(req.params.customerId);
    if (cart !== undefined) {
      res.json(cart.items);
    } else {
      res.json([]);
    }
  });

  // DELETE /carts/:customerId - Delete/clear cart
  app.delete('/carts/:customerId', (req: Request, res: Response) => {
    const customerId = req.params.customerId;
    cartStore.delete(customerId);
    res.status(202).json({ status: 'accepted' });
  });

  // POST /carts/:customerId/items - Add item to cart
  app.post('/carts/:customerId/items', (req: Request<{ customerId: string }, unknown, AddItemBody>, res: Response) => {
    const customerId = req.params.customerId;
    let cart = cartStore.get(customerId);

    cart ??= { customerId, items: [] };

    const newItem = {
      itemId: req.body.itemId,
      quantity: req.body.quantity,
      unitPrice: req.body.unitPrice,
    };

    cart.items.push(newItem);
    cartStore.set(customerId, cart);

    res.status(201).json(newItem);
  });

  // PUT /carts/:customerId/items/:itemId - Update item quantity
  app.put('/carts/:customerId/items/:itemId', (req: Request<{ customerId: string; itemId: string }, unknown, UpdateItemBody>, res: Response) => {
    const { customerId, itemId } = req.params;
    const cart = cartStore.get(customerId);

    if (cart === undefined) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    const item = cart.items.find((i) => i.itemId === itemId);
    if (item === undefined) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    item.quantity = req.body.quantity;
    res.json(item);
  });

  // DELETE /carts/:customerId/items/:itemId - Remove item from cart
  app.delete('/carts/:customerId/items/:itemId', (req: Request, res: Response) => {
    const { customerId, itemId } = req.params;
    const cart = cartStore.get(customerId);

    if (cart !== undefined) {
      cart.items = cart.items.filter((i) => i.itemId !== itemId);
      cartStore.set(customerId, cart);
    }

    res.status(204).send();
  });

  return app;
}

/**
 * Get the cart store (for testing)
 */
export function getCartStore(): Map<string, Cart> {
  return cartStore;
}
