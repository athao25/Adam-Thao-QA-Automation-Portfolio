/**
 * Payment Service State Handler
 *
 * Handles provider state setup and teardown for Payment service verification.
 * These handlers configure the mock/real provider to match expected states
 * defined in the consumer contracts.
 */

import express, { Express, Request, Response } from 'express';
import { AuthResult, PaymentRequest, DeclineReasons } from '../models';
import { TEST_CARDS } from '../../tests/fixtures';

/**
 * Payment service state configuration
 */
interface PaymentState {
  isAvailable: boolean;
  declineCard: boolean;
  declineReason?: string;
}

/**
 * Current payment service state
 */
let paymentState: PaymentState = {
  isAvailable: true,
  declineCard: false,
};

/**
 * Reset the payment state
 */
export function resetPaymentState(): void {
  paymentState = {
    isAvailable: true,
    declineCard: false,
  };
}

/**
 * State handlers for the Payment provider
 */
export const paymentStateHandlers: Record<string, () => Promise<void>> = {
  /**
   * State: payment service is available
   * Sets up the payment service in a ready state
   */
  'payment service is available': (): Promise<void> => {
    paymentState = {
      isAvailable: true,
      declineCard: false,
    };
    return Promise.resolve();
  },

  /**
   * State: card will be declined
   * Configures the payment service to decline payments
   */
  'card will be declined': (): Promise<void> => {
    paymentState = {
      isAvailable: true,
      declineCard: true,
      declineReason: DeclineReasons.CARD_DECLINED,
    };
    return Promise.resolve();
  },

  /**
   * State: payment service is unavailable
   * Simulates service unavailability
   */
  'payment service is unavailable': (): Promise<void> => {
    paymentState = {
      isAvailable: false,
      declineCard: false,
    };
    return Promise.resolve();
  },
};

/**
 * Determine if a card should be declined
 */
function shouldDeclineCard(cardNumber: string): boolean {
  return cardNumber === TEST_CARDS.DECLINED.longNum || paymentState.declineCard;
}

/**
 * Process a payment request
 */
function processPayment(request: PaymentRequest): AuthResult {
  // Check if the card should be declined
  if (shouldDeclineCard(request.card.longNum)) {
    return {
      authorised: false,
      message: paymentState.declineReason ?? DeclineReasons.CARD_DECLINED,
    };
  }

  // Successful payment
  return {
    authorised: true,
    message: 'Payment authorized',
  };
}

/**
 * Create a mock Payment service Express app
 */
export function createPaymentMockServer(): Express {
  const app = express();
  app.use(express.json());

  // POST /paymentAuth - Authorize payment
  app.post('/paymentAuth', (req: Request<unknown, unknown, PaymentRequest>, res: Response) => {
    // Check service availability
    if (!paymentState.isAvailable) {
      res.status(503).json({ error: 'Payment service unavailable' });
      return;
    }

    const paymentRequest = req.body;
    const result = processPayment(paymentRequest);

    res.json(result);
  });

  // GET /health - Health check
  app.get('/health', (_req: Request, res: Response) => {
    if (paymentState.isAvailable) {
      res.json({ status: 'healthy' });
    } else {
      res.status(503).json({ status: 'unhealthy' });
    }
  });

  return app;
}

/**
 * Get current payment state (for testing)
 */
export function getPaymentState(): PaymentState {
  return { ...paymentState };
}

/**
 * Set payment state directly (for testing)
 */
export function setPaymentState(state: Partial<PaymentState>): void {
  paymentState = { ...paymentState, ...state };
}
