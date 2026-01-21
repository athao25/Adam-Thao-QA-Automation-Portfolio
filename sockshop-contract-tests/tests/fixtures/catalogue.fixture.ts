/**
 * Catalogue Service Test Fixtures
 *
 * Factory functions for creating test data for catalogue-related tests.
 */

import { Product, CatalogueSize, TagsResponse } from '../../src/models';

/**
 * Default product IDs for consistent testing
 */
export const PRODUCT_IDS = {
  HOLY_SOCKS: '03fef6ac-1896-4ce8-bd69-b798f85c6e0b',
  COLOURFUL_SOCKS: 'd3588630-ad8e-49df-bbd7-3167f7efb246',
  CLASSIC_SOCKS: '510a0d7e-8e83-4193-b483-e27e09ddc34d',
  SPORT_SOCKS: '808a2de1-1aaa-4c25-a9b9-6612e8f29a38',
  NERD_SOCKS: 'a0a4f044-b040-410d-8ead-4de0446aec7e',
} as const;

/**
 * Default tags for testing
 */
export const DEFAULT_TAGS = ['sport', 'formal', 'blue', 'green', 'brown', 'magic'] as const;

/**
 * Create a product fixture with optional overrides
 */
export function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: PRODUCT_IDS.HOLY_SOCKS,
    name: 'Holy Socks',
    description: 'High quality, hand-made socks. Perfect for any occasion.',
    imageUrl: ['/catalogue/images/holy_1.jpg', '/catalogue/images/holy_2.jpg'],
    price: 19.99,
    count: 100,
    tag: ['formal', 'brown'],
    ...overrides,
  };
}

/**
 * Create a list of product fixtures
 */
export function createProductList(count: number = 3): Product[] {
  const products: Product[] = [
    createProduct(),
    createProduct({
      id: PRODUCT_IDS.COLOURFUL_SOCKS,
      name: 'Colourful Socks',
      description: 'Bright and colourful socks to brighten your day.',
      imageUrl: ['/catalogue/images/colourful_1.jpg'],
      price: 14.99,
      count: 75,
      tag: ['sport', 'blue'],
    }),
    createProduct({
      id: PRODUCT_IDS.CLASSIC_SOCKS,
      name: 'Classic Socks',
      description: 'Timeless classic design that never goes out of style.',
      imageUrl: ['/catalogue/images/classic_1.jpg'],
      price: 12.99,
      count: 200,
      tag: ['formal', 'green'],
    }),
    createProduct({
      id: PRODUCT_IDS.SPORT_SOCKS,
      name: 'Sport Socks',
      description: 'Athletic socks for maximum performance.',
      imageUrl: ['/catalogue/images/sport_1.jpg'],
      price: 9.99,
      count: 150,
      tag: ['sport', 'blue'],
    }),
    createProduct({
      id: PRODUCT_IDS.NERD_SOCKS,
      name: 'Nerd Socks',
      description: 'For the tech-savvy sock enthusiast.',
      imageUrl: ['/catalogue/images/nerd_1.jpg'],
      price: 24.99,
      count: 50,
      tag: ['formal', 'magic'],
    }),
  ];

  return products.slice(0, count);
}

/**
 * Create a catalogue size response fixture
 */
export function createCatalogueSize(size: number = 10): CatalogueSize {
  return { size };
}

/**
 * Create a tags response fixture
 */
export function createTagsResponse(tags: string[] = [...DEFAULT_TAGS]): TagsResponse {
  return { tags };
}

/**
 * Create a product with specific price
 */
export function createProductWithPrice(price: number): Product {
  return createProduct({ price });
}

/**
 * Create a product with specific tags
 */
export function createProductWithTags(tags: string[]): Product {
  return createProduct({ tag: tags });
}

/**
 * Create a product with specific stock count
 */
export function createProductWithStock(count: number): Product {
  return createProduct({ count });
}

/**
 * Create an out-of-stock product
 */
export function createOutOfStockProduct(): Product {
  return createProduct({
    id: 'out-of-stock-product',
    name: 'Out of Stock Socks',
    count: 0,
  });
}
