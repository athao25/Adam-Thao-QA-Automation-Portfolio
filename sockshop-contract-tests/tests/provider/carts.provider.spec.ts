/**
 * Carts Provider Verification Tests
 *
 * Contract: CDC-002 - Orders → Carts Service
 * Provider: Carts
 */

import { PROVIDERS } from '../../src/config/pact.config';
import {
  createCartsMockServer,
  cartsStateHandlers,
  resetCartsState,
} from '../../src/providers';
import { setupProviderTest, getPactPath, ProviderTestContext } from '../../src/utils/pact.setup';

describe('Carts Provider Verification', () => {
  let testContext: ProviderTestContext;

  beforeAll(async () => {
    const app = createCartsMockServer();
    testContext = await setupProviderTest(app, {
      provider: PROVIDERS.CARTS,
      pactFile: getPactPath('Orders', 'Carts'),
      stateHandlers: cartsStateHandlers,
    });
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(() => {
    resetCartsState();
  });

  it('validates the expectations of the Orders consumer', async () => {
    await testContext.verifyProvider();
  });
});
