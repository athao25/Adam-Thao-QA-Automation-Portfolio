/**
 * Payment Consumer Contract Tests
 *
 * Contract: CDC-003 - Orders → Payment Service
 */

import { Matchers } from '@pact-foundation/pact';
import { PaymentClient } from '../../src/clients/payment.client';
import { CONSUMERS, PROVIDERS } from '../../src/config/pact.config';
import {
  createConsumerPact,
  JSON_HEADERS,
  HTTP_STATUS,
} from '../../src/utils/pact.setup';
import { booleanMatcher, stringMatcher } from '../../src/utils/pact.matchers';
import { createPaymentRequest, createDeclinedPaymentRequest, TEST_CARDS } from '../fixtures';

const { like } = Matchers;

describe('CDC-003: Orders → Payment Contract', () => {
  const provider = createConsumerPact({
    consumer: CONSUMERS.ORDERS,
    provider: PROVIDERS.PAYMENT,
  });

  let client: PaymentClient;

  beforeAll(async () => {
    await provider.setup();
    client = new PaymentClient({ baseUrl: provider.mockService.baseUrl });
  });

  afterEach(() => provider.verify());
  afterAll(() => provider.finalize());

  describe('CDC-003-01: Authorize payment (successful)', () => {
    const paymentRequest = createPaymentRequest();

    beforeEach(() =>
      provider.addInteraction({
        state: 'payment service is available',
        uponReceiving: 'a valid payment authorization request',
        withRequest: {
          method: 'POST',
          path: '/paymentAuth',
          headers: JSON_HEADERS.request,
          body: like({
            customer: like({
              id: paymentRequest.customer.id,
              firstName: paymentRequest.customer.firstName,
              lastName: paymentRequest.customer.lastName,
            }),
            address: like({
              street: paymentRequest.address.street,
              city: paymentRequest.address.city,
              postcode: paymentRequest.address.postcode,
              country: paymentRequest.address.country,
            }),
            card: like({
              longNum: paymentRequest.card.longNum,
              expires: paymentRequest.card.expires,
              ccv: paymentRequest.card.ccv,
            }),
            amount: paymentRequest.amount,
          }),
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: like({
            authorised: booleanMatcher(true),
            message: stringMatcher('Payment authorized'),
          }),
        },
      })
    );

    it('authorizes a valid payment request', async () => {
      const response = await client.authorizePayment(paymentRequest);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data.authorised).toBe(true);
      expect(response.data.message).toBeDefined();
    });
  });

  describe('CDC-003-02: Declined payment', () => {
    const declinedPaymentRequest = createDeclinedPaymentRequest();

    beforeEach(() =>
      provider.addInteraction({
        state: 'card will be declined',
        uponReceiving: 'a payment request with a declined card',
        withRequest: {
          method: 'POST',
          path: '/paymentAuth',
          headers: JSON_HEADERS.request,
          body: like({
            customer: like({
              id: declinedPaymentRequest.customer.id,
              firstName: declinedPaymentRequest.customer.firstName,
              lastName: declinedPaymentRequest.customer.lastName,
            }),
            address: like({
              street: declinedPaymentRequest.address.street,
              city: declinedPaymentRequest.address.city,
              postcode: declinedPaymentRequest.address.postcode,
              country: declinedPaymentRequest.address.country,
            }),
            card: like({
              longNum: TEST_CARDS.DECLINED.longNum,
              expires: TEST_CARDS.DECLINED.expires,
              ccv: TEST_CARDS.DECLINED.ccv,
            }),
            amount: declinedPaymentRequest.amount,
          }),
        },
        willRespondWith: {
          status: HTTP_STATUS.OK,
          headers: JSON_HEADERS.response,
          body: like({
            authorised: booleanMatcher(false),
            message: stringMatcher('Payment declined'),
          }),
        },
      })
    );

    it('returns declined status for invalid card', async () => {
      const response = await client.authorizePayment(declinedPaymentRequest);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.data.authorised).toBe(false);
      expect(response.data.message).toBeDefined();
    });
  });
});
