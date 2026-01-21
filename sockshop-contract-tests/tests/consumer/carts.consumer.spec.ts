/**
 * Carts Consumer Contract Tests
 *
 * Contract: CDC-002 - Orders → Carts Service
 */

import { Matchers } from '@pact-foundation/pact';
import { CartsClient } from '../../src/clients/carts.client';
import { CONSUMERS, PROVIDERS } from '../../src/config/pact.config';
import {
  createConsumerPact,
  JSON_HEADERS,
  HTTP_STATUS,
} from '../../src/utils/pact.setup';
import {
  customerIdMatcher,
  productIdMatcher,
  quantityMatcher,
  priceMatcher,
  arrayLike,
} from '../../src/utils/pact.matchers';
import { CUSTOMER_IDS, PRODUCT_IDS } from '../fixtures';

const { like } = Matchers;

describe('CDC-002: Orders → Carts Contract', () => {
  const provider = createConsumerPact({
    consumer: CONSUMERS.ORDERS,
    provider: PROVIDERS.CARTS,
  });

  let client: CartsClient;
  const testCustomerId = CUSTOMER_IDS.DEFAULT;

  beforeAll(async () => {
    await provider.setup();
    client = new CartsClient({ baseUrl: provider.mockService.baseUrl });
  });

  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('CDC-002-01: Retrieve customer cart', () => {
    beforeEach(() =>
      provider.addInteraction({
        state: `cart exists for ${testCustomerId}`,
        uponReceiving: 'a request to retrieve customer cart',
        withRequest: {
          method: 'GET',
          path: `/carts/${testCustomerId}`,
          headers: { Accept: JSON_HEADERS.request.Accept },
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: like({
            customerId: customerIdMatcher(testCustomerId),
            items: arrayLike({
              itemId: productIdMatcher(PRODUCT_IDS.HOLY_SOCKS),
              quantity: quantityMatcher(1),
              unitPrice: priceMatcher(19.99),
            }),
          }),
        },
      })
    );

    it('returns the cart for a customer', async () => {
      const response = await client.getCart(testCustomerId);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data.customerId).toBeDefined();
      expect(response.data.items).toBeInstanceOf(Array);

      if (response.data.items.length > 0) {
        expect(response.data.items[0]).toMatchObject({
          itemId: expect.any(String),
          quantity: expect.any(Number),
          unitPrice: expect.any(Number),
        });
      }
    });
  });

  describe('CDC-002-02: Get cart line items', () => {
    beforeEach(() =>
      provider.addInteraction({
        state: `cart has items for ${testCustomerId}`,
        uponReceiving: 'a request to get cart line items',
        withRequest: {
          method: 'GET',
          path: `/carts/${testCustomerId}/items`,
          headers: { Accept: JSON_HEADERS.request.Accept },
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: arrayLike({
            itemId: productIdMatcher(PRODUCT_IDS.HOLY_SOCKS),
            quantity: quantityMatcher(2),
            unitPrice: priceMatcher(19.99),
          }),
        },
      })
    );

    it('returns cart items for a customer', async () => {
      const response = await client.getCartItems(testCustomerId);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data).toBeInstanceOf(Array);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toMatchObject({
        itemId: expect.any(String),
        quantity: expect.any(Number),
        unitPrice: expect.any(Number),
      });
    });
  });

  describe('CDC-002-03: Clear cart post-order', () => {
    beforeEach(() =>
      provider.addInteraction({
        state: `cart exists for ${testCustomerId}`,
        uponReceiving: 'a request to clear cart after order',
        withRequest: {
          method: 'DELETE',
          path: `/carts/${testCustomerId}`,
        },
        willRespondWith: {
          status: HTTP_STATUS.ACCEPTED,
          headers: JSON_HEADERS.response,
          body: like({ status: 'accepted' }),
        },
      })
    );

    it('clears the cart and returns 202 Accepted', async () => {
      const response = await client.deleteCart(testCustomerId);

      expect(response.status).toBe(HTTP_STATUS.ACCEPTED);
      expect(response.data.status).toBe('accepted');
    });
  });
});
