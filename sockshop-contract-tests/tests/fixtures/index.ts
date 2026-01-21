/**
 * Test Fixtures Barrel Export
 *
 * Central export point for all test fixtures used in contract tests.
 */

// Catalogue fixtures
export {
  PRODUCT_IDS,
  DEFAULT_TAGS,
  createProduct,
  createProductList,
  createCatalogueSize,
  createTagsResponse,
  createProductWithPrice,
  createProductWithTags,
  createProductWithStock,
  createOutOfStockProduct,
} from './catalogue.fixture';

// Cart fixtures
export {
  CUSTOMER_IDS,
  createCartItem,
  createCartItems,
  createCart,
  createEmptyCart,
  createAddItemRequest,
  createUpdateItemRequest,
  createCartWithSingleItem,
  createCartWithMultipleItems,
  createCartWithTotal,
  calculateExpectedTotal,
} from './cart.fixture';

// Payment fixtures
export {
  TEST_ADDRESSES,
  TEST_CARDS,
  TEST_CUSTOMERS,
  createAddress,
  createCard,
  createCustomer,
  createPaymentRequest,
  createSuccessfulAuthResult,
  createDeclinedAuthResult,
  createDeclinedPaymentRequest,
  createExpiredCardPaymentRequest,
  createPaymentRequestWithAmount,
  createHighValuePaymentRequest,
  createPaymentRequestForCustomer,
} from './payment.fixture';
