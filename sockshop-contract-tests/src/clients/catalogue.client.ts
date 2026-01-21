/**
 * Catalogue Service Client
 *
 * HTTP client for interacting with the Catalogue microservice.
 * Used by the Frontend consumer to retrieve product information.
 */

import { BaseClient, BaseClientConfig, ApiResponse } from './base.client';
import { Product, CatalogueSize, TagsResponse, CatalogueQuery } from '../models';

/**
 * Catalogue client configuration
 */
export interface CatalogueClientConfig extends Omit<BaseClientConfig, 'baseUrl'> {
  baseUrl?: string;
}

/**
 * Client for the Catalogue microservice
 */
export class CatalogueClient extends BaseClient {
  constructor(config: CatalogueClientConfig = {}) {
    super({
      baseUrl: config.baseUrl ?? 'http://localhost:8081',
      ...config,
    });
  }

  /**
   * Get all products from the catalogue
   * CDC-001-01: List all products
   */
  async getCatalogue(query?: CatalogueQuery): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams();

    if (query?.tags !== undefined) {
      params.append('tags', query.tags);
    }
    if (query?.order !== undefined) {
      params.append('order', query.order);
    }
    if (query?.page !== undefined) {
      params.append('page', query.page.toString());
    }
    if (query?.size !== undefined) {
      params.append('size', query.size.toString());
    }

    const queryString = params.toString();
    const path = queryString !== '' ? `/catalogue?${queryString}` : '/catalogue';

    return this.get<Product[]>(path);
  }

  /**
   * Get a single product by ID
   * CDC-001-02: Get product details
   */
  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.get<Product>(`/catalogue/${productId}`);
  }

  /**
   * Get the total number of products in the catalogue
   * CDC-001-03: Get catalogue count
   */
  async getCatalogueSize(): Promise<ApiResponse<CatalogueSize>> {
    return this.get<CatalogueSize>('/catalogue/size');
  }

  /**
   * Get all available product tags
   * CDC-001-04: List product tags
   */
  async getTags(): Promise<ApiResponse<TagsResponse>> {
    return this.get<TagsResponse>('/tags');
  }
}

/**
 * Factory function to create a CatalogueClient instance
 */
export function createCatalogueClient(baseUrl?: string): CatalogueClient {
  return new CatalogueClient({ baseUrl });
}
