/**
 * Catalogue Consumer Contract Tests
 *
 * Contract: CDC-001 - Frontend → Catalogue Service
 */

import { Matchers } from '@pact-foundation/pact';
import { CatalogueClient } from '../../src/clients/catalogue.client';
import { CONSUMERS, PROVIDERS } from '../../src/config/pact.config';
import {
  createConsumerPact,
  JSON_HEADERS,
  HTTP_STATUS,
} from '../../src/utils/pact.setup';
import {
  productIdMatcher,
  stringMatcher,
  priceMatcher,
  quantityMatcher,
  arrayLike,
} from '../../src/utils/pact.matchers';
import { PRODUCT_IDS } from '../fixtures';

const { like } = Matchers;

describe('CDC-001: Frontend → Catalogue Contract', () => {
  const provider = createConsumerPact({
    consumer: CONSUMERS.FRONTEND,
    provider: PROVIDERS.CATALOGUE,
  });

  let client: CatalogueClient;

  beforeAll(async () => {
    await provider.setup();
    client = new CatalogueClient({ baseUrl: provider.mockService.baseUrl });
  });

  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('CDC-001-01: List all products', () => {
    beforeEach(() =>
      provider.addInteraction({
        state: 'products exist in catalogue',
        uponReceiving: 'a request to list all products',
        withRequest: {
          method: 'GET',
          path: '/catalogue',
          headers: { Accept: JSON_HEADERS.request.Accept },
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: arrayLike({
            id: productIdMatcher(PRODUCT_IDS.HOLY_SOCKS),
            name: stringMatcher('Holy Socks'),
            description: stringMatcher('High quality, hand-made socks'),
            imageUrl: arrayLike('/catalogue/images/holy_1.jpg'),
            price: priceMatcher(19.99),
            count: quantityMatcher(100),
            tag: arrayLike('formal'),
          }),
        },
      })
    );

    it('returns a list of products', async () => {
      const response = await client.getCatalogue();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);

      const [product] = response.data;
      expect(product).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        count: expect.any(Number),
      });
    });
  });

  describe('CDC-001-02: Get product details', () => {
    const testProductId = PRODUCT_IDS.HOLY_SOCKS;

    beforeEach(() =>
      provider.addInteraction({
        state: `product ${testProductId} exists`,
        uponReceiving: 'a request to get product details',
        withRequest: {
          method: 'GET',
          path: `/catalogue/${testProductId}`,
          headers: { Accept: JSON_HEADERS.request.Accept },
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: like({
            id: testProductId,
            name: stringMatcher('Holy Socks'),
            description: stringMatcher('High quality, hand-made socks'),
            imageUrl: arrayLike('/catalogue/images/holy_1.jpg'),
            price: priceMatcher(19.99),
            count: quantityMatcher(100),
            tag: arrayLike('formal'),
          }),
        },
      })
    );

    it('returns product details for a valid ID', async () => {
      const response = await client.getProduct(testProductId);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data.id).toBe(testProductId);
      expect(response.data).toMatchObject({
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
      });
    });
  });

  describe('CDC-001-03: Get catalogue count', () => {
    beforeEach(() =>
      provider.addInteraction({
        state: 'catalogue is available',
        uponReceiving: 'a request to get catalogue size',
        withRequest: {
          method: 'GET',
          path: '/catalogue/size',
          headers: { Accept: JSON_HEADERS.request.Accept },
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: like({ size: 10 }),
        },
      })
    );

    it('returns the total number of products', async () => {
      const response = await client.getCatalogueSize();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data.size).toBeGreaterThan(0);
    });
  });

  describe('CDC-001-04: List product tags', () => {
    beforeEach(() =>
      provider.addInteraction({
        state: 'tags exist',
        uponReceiving: 'a request to list product tags',
        withRequest: {
          method: 'GET',
          path: '/tags',
          headers: { Accept: JSON_HEADERS.request.Accept },
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: like({ tags: arrayLike('sport') }),
        },
      })
    );

    it('returns a list of available tags', async () => {
      const response = await client.getTags();

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data.tags).toBeInstanceOf(Array);
      expect(response.data.tags.length).toBeGreaterThan(0);
    });
  });
});
