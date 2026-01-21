/**
 * Payment Provider Verification Tests
 *
 * Contract: CDC-003 - Orders → Payment Service
 * Provider: Payment
 */

import { PROVIDERS } from '../../src/config/pact.config';
import {
  createPaymentMockServer,
  paymentStateHandlers,
  resetPaymentState,
} from '../../src/providers';
import { setupProviderTest, getPactPath, ProviderTestContext } from '../../src/utils/pact.setup';

describe('Payment Provider Verification', () => {
  let testContext: ProviderTestContext;

  beforeAll(async () => {
    const app = createPaymentMockServer();
    testContext = await setupProviderTest(app, {
      provider: PROVIDERS.PAYMENT,
      pactFile: getPactPath('Orders', 'Payment'),
      stateHandlers: paymentStateHandlers,
    });
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(() => {
    resetPaymentState();
  });

  it('validates the expectations of the Orders consumer', async () => {
    await testContext.verifyProvider();
  });
});
