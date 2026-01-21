/**
 * Provider State Handlers - Consolidated Export
 *
 * Central export point for all provider state handlers and mock servers.
 */

// Catalogue provider
export {
  catalogueStateHandlers,
  createCatalogueMockServer,
  resetCatalogueState,
  getProductStore,
  getTagStore,
} from './catalogue.state-handler';

// Carts provider
export {
  cartsStateHandlers,
  createCartsMockServer,
  resetCartsState,
  getCartStore,
} from './carts.state-handler';

// Payment provider
export {
  paymentStateHandlers,
  createPaymentMockServer,
  resetPaymentState,
  getPaymentState,
  setPaymentState,
} from './payment.state-handler';

