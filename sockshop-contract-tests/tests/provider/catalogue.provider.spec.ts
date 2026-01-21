/**
 * Catalogue Provider Verification Tests
 *
 * Contract: CDC-001 - Frontend → Catalogue Service
 * Provider: Catalogue
 */

import { PROVIDERS } from '../../src/config/pact.config';
import {
  createCatalogueMockServer,
  catalogueStateHandlers,
  resetCatalogueState,
} from '../../src/providers';
import { setupProviderTest, getPactPath, ProviderTestContext } from '../../src/utils/pact.setup';

describe('Catalogue Provider Verification', () => {
  let testContext: ProviderTestContext;

  beforeAll(async () => {
    const app = createCatalogueMockServer();
    testContext = await setupProviderTest(app, {
      provider: PROVIDERS.CATALOGUE,
      pactFile: getPactPath('Frontend', 'Catalogue'),
      stateHandlers: catalogueStateHandlers,
    });
  });

  afterAll(async () => {
    await testContext.cleanup();
  });

  beforeEach(() => {
    resetCatalogueState();
  });

  it('validates the expectations of the Frontend consumer', async () => {
    await testContext.verifyProvider();
  });
});
