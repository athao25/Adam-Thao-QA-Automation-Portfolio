/**
 * Carts Service Client
 *
 * HTTP client for interacting with the Carts microservice.
 * Used by the Orders consumer to manage shopping cart operations.
 */

import { BaseClient, BaseClientConfig, ApiResponse } from './base.client';
import { Cart, CartItem } from '../models';

/**
 * Carts client configuration
 */
export interface CartsClientConfig extends Omit<BaseClientConfig, 'baseUrl'> {
  baseUrl?: string;
}

/**
 * Delete cart response (202 Accepted returns empty body)
 */
export interface DeleteCartResponse {
  status: 'accepted';
}

/**
 * Client for the Carts microservice
 */
export class CartsClient extends BaseClient {
  constructor(config: CartsClientConfig = {}) {
    super({
      baseUrl: config.baseUrl ?? 'http://localhost:8082',
      ...config,
    });
  }

  /**
   * Get a customer's cart
   * CDC-002-01: Retrieve customer cart
   */
  async getCart(customerId: string): Promise<ApiResponse<Cart>> {
    return this.get<Cart>(`/carts/${customerId}`);
  }

  /**
   * Get items in a customer's cart
   * CDC-002-02: Get cart line items
   */
  async getCartItems(customerId: string): Promise<ApiResponse<CartItem[]>> {
    return this.get<CartItem[]>(`/carts/${customerId}/items`);
  }

  /**
   * Delete/clear a customer's cart
   * CDC-002-03: Clear cart post-order
   */
  async deleteCart(customerId: string): Promise<ApiResponse<DeleteCartResponse>> {
    return this.delete<DeleteCartResponse>(`/carts/${customerId}`);
  }

  /**
   * Add an item to a customer's cart
   * (Additional operation for completeness)
   */
  async addItem(
    customerId: string,
    item: { itemId: string; quantity: number; unitPrice: number }
  ): Promise<ApiResponse<CartItem>> {
    return this.post<CartItem>(`/carts/${customerId}/items`, item);
  }

  /**
   * Update item quantity in a customer's cart
   * (Additional operation for completeness)
   */
  async updateItem(
    customerId: string,
    itemId: string,
    quantity: number
  ): Promise<ApiResponse<CartItem>> {
    return this.put<CartItem>(`/carts/${customerId}/items/${itemId}`, { quantity });
  }

  /**
   * Remove an item from a customer's cart
   * (Additional operation for completeness)
   */
  async removeItem(customerId: string, itemId: string): Promise<ApiResponse<undefined>> {
    return this.delete<undefined>(`/carts/${customerId}/items/${itemId}`);
  }
}

/**
 * Factory function to create a CartsClient instance
 */
export function createCartsClient(baseUrl?: string): CartsClient {
  return new CartsClient({ baseUrl });
}
