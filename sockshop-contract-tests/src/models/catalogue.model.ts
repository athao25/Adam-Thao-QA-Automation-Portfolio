/**
 * Catalogue Service Domain Models
 *
 * Represents the product catalogue data structures used in the Sock Shop.
 */

/**
 * Product representation in the catalogue
 */
export interface Product {
  /** Unique product identifier (UUID) */
  id: string;
  /** Product display name */
  name: string;
  /** Product description */
  description: string;
  /** Array of image URLs for the product */
  imageUrl: string[];
  /** Product price in currency units */
  price: number;
  /** Available stock count */
  count: number;
  /** Product tags/categories */
  tag: string[];
}

/**
 * Catalogue size response
 */
export interface CatalogueSize {
  /** Total number of products in the catalogue */
  size: number;
}

/**
 * Tags response
 */
export interface TagsResponse {
  /** List of all available product tags */
  tags: string[];
}

/**
 * Catalogue query parameters
 */
export interface CatalogueQuery {
  /** Filter by tags (comma-separated) */
  tags?: string;
  /** Order field */
  order?: 'name' | 'price' | 'count';
  /** Page number for pagination */
  page?: number;
  /** Items per page */
  size?: number;
}

/**
 * Type guard to check if an object is a Product
 */
export function isProduct(obj: unknown): obj is Product {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const product = obj as Record<string, unknown>;

  return (
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.description === 'string' &&
    Array.isArray(product.imageUrl) &&
    typeof product.price === 'number' &&
    typeof product.count === 'number' &&
    Array.isArray(product.tag)
  );
}

/**
 * Type guard to check if an object is a CatalogueSize
 */
export function isCatalogueSize(obj: unknown): obj is CatalogueSize {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const size = obj as Record<string, unknown>;
  return typeof size.size === 'number';
}

/**
 * Type guard to check if an object is a TagsResponse
 */
export function isTagsResponse(obj: unknown): obj is TagsResponse {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const tags = obj as Record<string, unknown>;
  return Array.isArray(tags.tags) && tags.tags.every((t) => typeof t === 'string');
}
