/**
 * Catalogue Service State Handler
 *
 * Handles provider state setup and teardown for Catalogue service verification.
 * These handlers configure the mock/real provider to match expected states
 * defined in the consumer contracts.
 */

import express, { Express, Request, Response } from 'express';
import { createProductList, createCatalogueSize, createTagsResponse, PRODUCT_IDS } from '../../tests/fixtures';
import { Product } from '../models';

/**
 * In-memory product store for testing
 */
const productStore: Map<string, Product> = new Map();
let tagStore: string[] = [];

/**
 * Reset the catalogue state
 */
export function resetCatalogueState(): void {
  productStore.clear();
  tagStore = [];
}

/**
 * State handlers for the Catalogue provider
 */
export const catalogueStateHandlers: Record<string, () => Promise<void>> = {
  /**
   * State: products exist in catalogue
   * Sets up the catalogue with a list of products
   */
  'products exist in catalogue': (): Promise<void> => {
    resetCatalogueState();
    const products = createProductList(5);
    products.forEach((product) => {
      productStore.set(product.id, product);
    });
    tagStore = ['sport', 'formal', 'blue', 'green', 'brown', 'magic'];
    return Promise.resolve();
  },

  /**
   * State: product {id} exists
   * Sets up a specific product in the catalogue
   */
  [`product ${PRODUCT_IDS.HOLY_SOCKS} exists`]: (): Promise<void> => {
    resetCatalogueState();
    const products = createProductList(1);
    products.forEach((product) => {
      productStore.set(product.id, product);
    });
    return Promise.resolve();
  },

  /**
   * State: catalogue is available
   * Sets up the catalogue with products for size checking
   */
  'catalogue is available': (): Promise<void> => {
    resetCatalogueState();
    const products = createProductList(5);
    products.forEach((product) => {
      productStore.set(product.id, product);
    });
    return Promise.resolve();
  },

  /**
   * State: tags exist
   * Sets up the catalogue with available tags
   */
  'tags exist': (): Promise<void> => {
    tagStore = ['sport', 'formal', 'blue', 'green', 'brown', 'magic'];
    return Promise.resolve();
  },
};

/**
 * Create a mock Catalogue service Express app
 */
export function createCatalogueMockServer(): Express {
  const app = express();
  app.use(express.json());

  // GET /catalogue - List all products
  app.get('/catalogue', (_req: Request, res: Response) => {
    const products = Array.from(productStore.values());
    res.json(products);
  });

  // GET /catalogue/size - Get catalogue size (must be before :id route)
  app.get('/catalogue/size', (_req: Request, res: Response) => {
    res.json(createCatalogueSize(productStore.size));
  });

  // GET /catalogue/:id - Get product by ID (must be after /catalogue/size)
  app.get('/catalogue/:id', (req: Request, res: Response) => {
    const product = productStore.get(req.params.id);
    if (product !== undefined) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });

  // GET /tags - Get all tags
  app.get('/tags', (_req: Request, res: Response) => {
    res.json(createTagsResponse(tagStore));
  });

  return app;
}

/**
 * Get the product store (for testing)
 */
export function getProductStore(): Map<string, Product> {
  return productStore;
}

/**
 * Get the tag store (for testing)
 */
export function getTagStore(): string[] {
  return tagStore;
}
