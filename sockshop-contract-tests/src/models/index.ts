/**
 * Domain Models Barrel Export
 *
 * Central export point for all domain models used in the Sock Shop contract tests.
 */

// Catalogue models
export {
  Product,
  CatalogueSize,
  TagsResponse,
  CatalogueQuery,
  isProduct,
  isCatalogueSize,
  isTagsResponse,
} from './catalogue.model';

// Cart models
export {
  CartItem,
  Cart,
  AddItemRequest,
  UpdateItemRequest,
  CartOperationResponse,
  calculateItemTotal,
  calculateCartTotal,
  isCartItem,
  isCart,
  isCartItemArray,
} from './cart.model';

// Payment models
export {
  Address,
  Card,
  Customer,
  PaymentRequest,
  AuthResult,
  DeclineReasons,
  DeclineReason,
  isAddress,
  isCard,
  isCustomer,
  isPaymentRequest,
  isAuthResult,
} from './payment.model';
