/**
 * Payment Service Client
 *
 * HTTP client for interacting with the Payment microservice.
 * Used by the Orders consumer to authorize payments.
 */

import { BaseClient, BaseClientConfig, ApiResponse } from './base.client';
import { PaymentRequest, AuthResult } from '../models';

/**
 * Payment client configuration
 */
export interface PaymentClientConfig extends Omit<BaseClientConfig, 'baseUrl'> {
  baseUrl?: string;
}

/**
 * Client for the Payment microservice
 */
export class PaymentClient extends BaseClient {
  constructor(config: PaymentClientConfig = {}) {
    super({
      baseUrl: config.baseUrl ?? 'http://localhost:8083',
      ...config,
    });
  }

  /**
   * Authorize a payment
   * CDC-003-01: Authorize payment (successful)
   * CDC-003-02: Declined payment
   */
  async authorizePayment(request: PaymentRequest): Promise<ApiResponse<AuthResult>> {
    return this.post<AuthResult>('/paymentAuth', request);
  }

  /**
   * Health check for the payment service
   * (Additional operation for completeness)
   */
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.get<{ status: string }>('/health');
  }
}

/**
 * Factory function to create a PaymentClient instance
 */
export function createPaymentClient(baseUrl?: string): PaymentClient {
  return new PaymentClient({ baseUrl });
}
