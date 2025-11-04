// MTN Mobile Money RTP Service for Zambia Flash MVP
// This service handles MTN Request-to-Pay (RTP) flow

import { api } from './api';

export interface MTNRTPRequest {
  phone: string;
  amount: string;
  note?: string;
  externalId: string;
}

export interface MTNRTPStatus {
  status: 'pending' | 'approved' | 'declined' | 'timeout' | 'error';
  transactionId?: string;
  errorMessage?: string;
}

class MTNService {
  private baseUrl = '/mtn';

  /**
   * Initiate Request-to-Pay with MTN MoMo
   */
  async initiateRTP(request: MTNRTPRequest): Promise<{ referenceId: string }> {
    try {
      const response = await api.post(`${this.baseUrl}/rtp/initiate`, {
        payerPhone: request.phone,
        amount: request.amount,
        currency: 'ZMW', // Zambia Kwacha
        externalId: request.externalId,
        payerMessage: request.note || 'Flash payment',
        payeeNote: request.note || 'Payment via Flash'
      });

      return response.data;
    } catch (error) {
      console.error('MTN RTP Initiation failed:', error);
      throw new Error('Failed to initiate payment. Please try again.');
    }
  }

  /**
   * Check status of MTN RTP transaction
   */
  async checkRTPStatus(referenceId: string): Promise<MTNRTPStatus> {
    try {
      const response = await api.get(`${this.baseUrl}/rtp/status/${referenceId}`);
      return response.data;
    } catch (error) {
      console.error('MTN RTP Status check failed:', error);
      return {
        status: 'error',
        errorMessage: 'Failed to check payment status'
      };
    }
  }

  /**
   * Get MTN account balance (for debugging/admin)
   */
  async getAccountBalance(): Promise<{ balance: string; currency: string }> {
    try {
      const response = await api.get(`${this.baseUrl}/balance`);
      return response.data;
    } catch (error) {
      console.error('MTN Balance check failed:', error);
      throw new Error('Failed to get account balance');
    }
  }

  /**
   * Poll MTN RTP status with timeout
   */
  async pollRTPStatus(
    referenceId: string, 
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<MTNRTPStatus> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.checkRTPStatus(referenceId);
      
      if (status.status !== 'pending') {
        return status;
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    return {
      status: 'timeout',
      errorMessage: 'Payment approval timed out'
    };
  }

  /**
   * Validate MTN Zambia phone number
   */
  isValidMTNNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    // MTN Zambia prefixes: 097, 096, 077, 076
    const mtnPrefixes = ['097', '096', '077', '076'];
    
    if (cleaned.startsWith('260')) {
      const localNumber = cleaned.substring(3);
      return mtnPrefixes.some(prefix => localNumber.startsWith(prefix));
    } else if (cleaned.startsWith('0')) {
      return mtnPrefixes.some(prefix => cleaned.startsWith(prefix));
    } else if (cleaned.length === 9) {
      return mtnPrefixes.some(prefix => `0${cleaned}`.startsWith(prefix));
    }
    
    return false;
  }

  /**
   * Generate unique external ID for transactions
   */
  generateExternalId(): string {
    return `FL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
}

export const mtnService = new MTNService();
export default mtnService;