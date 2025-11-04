/**
 * Mock API Service for Flash App
 * Provides offline functionality with realistic fake data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  mockUsers, 
  mockContacts, 
  mockWallet, 
  generateMockTransactions,
  mockApiDelay,
  generateMockTransactionId,
  generateMockReferenceId,
  MockUser,
  MockTransaction
} from './mockData';

interface MockAuthResponse {
  token: string;
  user: MockUser;
}

interface MockTransactionResponse {
  transaction_id: string;
  reference_id: string;
  status: string;
  amount: number;
  recipient_phone: string;
  message?: string;
}

class MockApiService {
  private currentUser: MockUser | null = null;
  private isOfflineMode = false;

  /**
   * Enable/disable offline mode
   */
  setOfflineMode(enabled: boolean) {
    this.isOfflineMode = enabled;
    console.log(`🎭 Mock API: ${enabled ? 'Enabled' : 'Disabled'} offline mode`);
  }

  /**
   * Check if should use mock data
   */
  private shouldUseMock(): boolean {
    return this.isOfflineMode || __DEV__;
  }

  /**
   * Mock Authentication
   */
  async login(phone_number: string, password: string): Promise<MockAuthResponse> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(500, 1200);

    // Find user by phone number
    const user = mockUsers.find(u => u.phone_number === phone_number);
    
    if (!user) {
      throw new Error('User not found');
    }

    // In mock mode, any password works
    const mockToken = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store mock token
    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('mock_current_user', JSON.stringify(user));
    
    this.currentUser = user;
    
    console.log(`🎭 Mock Login: ${user.full_name} (${phone_number})`);
    
    return {
      token: mockToken,
      user
    };
  }

  /**
   * Mock Registration
   */
  async register(phone_number: string, password: string, full_name: string): Promise<MockAuthResponse> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(800, 1500);

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.phone_number === phone_number);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new mock user
    const newUser: MockUser = {
      id: `mock-user-${Date.now()}`,
      phone_number,
      full_name,
      is_phone_verified: true,
      default_currency: 'ZMW',
      created_at: new Date().toISOString()
    };

    const mockToken = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store mock token and user
    await AsyncStorage.setItem('auth_token', mockToken);
    await AsyncStorage.setItem('mock_current_user', JSON.stringify(newUser));
    
    this.currentUser = newUser;
    
    console.log(`🎭 Mock Registration: ${full_name} (${phone_number})`);
    
    return {
      token: mockToken,
      user: newUser
    };
  }

  /**
   * Mock OTP operations
   */
  async sendOTP(phone_number: string): Promise<{ debug_code: string }> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(300, 800);
    
    console.log(`🎭 Mock OTP sent to: ${phone_number}`);
    
    return {
      debug_code: '123456'
    };
  }

  async verifyOTP(phone_number: string, otp_code: string, full_name?: string): Promise<{ success: boolean }> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(400, 900);
    
    // In mock mode, any OTP works
    console.log(`🎭 Mock OTP verified for: ${phone_number}`);
    
    return {
      success: true
    };
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<MockUser> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(200, 500);

    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to load from storage
    const savedUser = await AsyncStorage.getItem('mock_current_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      return this.currentUser!;
    }

    throw new Error('No user logged in');
  }

  /**
   * Mock Wallet operations
   */
  async getWallet(): Promise<any> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(300, 700);
    
    return mockWallet;
  }

  /**
   * Mock Transactions
   */
  async getTransactions(): Promise<MockTransaction[]> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(400, 900);

    const currentUser = await this.getCurrentUser();
    return generateMockTransactions(currentUser.phone_number);
  }

  async getTransaction(id: string): Promise<MockTransaction> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(200, 500);

    // First check pending transactions that might have been completed
    try {
      const pendingTxs = await AsyncStorage.getItem('mock_pending_transactions');
      if (pendingTxs) {
        const transactions = JSON.parse(pendingTxs);
        const pendingTx = transactions.find((tx: any) => tx.id === id || tx.reference_id === id);
        if (pendingTx) {
          console.log(`🔍 Found pending transaction: ${id} -> ${pendingTx.status}`);
          return {
            id: pendingTx.id,
            reference_id: pendingTx.reference_id,
            transaction_type: 'p2p_send',
            amount: pendingTx.amount.toString(),
            currency: 'ZMW',
            description: 'Mock payment',
            sender: await this.getCurrentUser(),
            recipient_phone: pendingTx.recipient_phone,
            status: pendingTx.status as any,
            created_at: pendingTx.created_at,
            completed_at: pendingTx.completed_at,
            type: 'sent' as const,
            phone: pendingTx.recipient_phone,
            failure_reason: pendingTx.failure_reason
          } as MockTransaction;
        }
      }
    } catch (error) {
      console.log('🔥 Error checking pending transactions:', error);
    }

    // Fall back to regular transaction history
    const transactions = await this.getTransactions();
    const transaction = transactions.find(t => t.id === id || t.reference_id === id);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  /**
   * Mock Send Money
   */
  async sendMoney(data: {
    recipient_phone: string;
    amount: number;
    description?: string;
  }): Promise<MockTransactionResponse> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(600, 1200);

    const transactionId = generateMockTransactionId();
    const referenceId = generateMockReferenceId();

    console.log(`🎭 Mock Payment: ${data.amount} ZMW to ${data.recipient_phone}`);

    // Store transaction in mock storage for status tracking
    const transaction = {
      id: transactionId,
      reference_id: referenceId,
      status: 'processing',
      amount: data.amount,
      recipient_phone: data.recipient_phone,
      created_at: new Date().toISOString()
    };
    
    // Store in AsyncStorage for status tracking
    try {
      const existingTxs = await AsyncStorage.getItem('mock_pending_transactions');
      const pendingTxs = existingTxs ? JSON.parse(existingTxs) : [];
      pendingTxs.push(transaction);
      await AsyncStorage.setItem('mock_pending_transactions', JSON.stringify(pendingTxs));
      
      // Auto-complete after 5 seconds (simulate management command)
      setTimeout(async () => {
        await this.completeTransaction(transactionId);
      }, 5000);
    } catch (error) {
      console.log('🔥 Error storing mock transaction:', error);
    }

    // Simulate payment processing
    return {
      transaction_id: transactionId,
      reference_id: referenceId,
      status: 'processing',
      amount: data.amount,
      recipient_phone: data.recipient_phone,
      message: 'Mock payment initiated successfully'
    };
  }

  /**
   * Auto-complete transaction (simulates management command)
   */
  private async completeTransaction(transactionId: string) {
    try {
      const existingTxs = await AsyncStorage.getItem('mock_pending_transactions');
      if (!existingTxs) return;
      
      const pendingTxs = JSON.parse(existingTxs);
      const txIndex = pendingTxs.findIndex((tx: any) => tx.id === transactionId);
      
      if (txIndex !== -1) {
        // 90% success rate (like backend command)
        const success = Math.random() > 0.1;
        pendingTxs[txIndex].status = success ? 'completed' : 'failed';
        pendingTxs[txIndex].completed_at = new Date().toISOString();
        if (!success) {
          pendingTxs[txIndex].failure_reason = 'Mock payment simulation: Random failure';
        }
        
        await AsyncStorage.setItem('mock_pending_transactions', JSON.stringify(pendingTxs));
        console.log(`🎭 Mock transaction auto-completed: ${transactionId} -> ${pendingTxs[txIndex].status}`);
      }
    } catch (error) {
      console.log('🔥 Error completing mock transaction:', error);
    }
  }

  /**
   * Mock Contacts
   */
  async getContacts(): Promise<typeof mockContacts> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(300, 600);
    
    return mockContacts;
  }

  /**
   * Mock Logout
   */
  async logout(): Promise<{ success: boolean }> {
    if (!this.shouldUseMock()) {
      throw new Error('Mock API not enabled');
    }

    await mockApiDelay(200, 400);

    // Clear mock data
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('mock_current_user');
    
    this.currentUser = null;
    
    console.log('🎭 Mock Logout successful');
    
    return {
      success: true
    };
  }

  /**
   * Check if token is valid (mock)
   */
  async validateToken(): Promise<boolean> {
    if (!this.shouldUseMock()) {
      return false;
    }

    const token = await AsyncStorage.getItem('auth_token');
    return token !== null && token.startsWith('mock-token-');
  }
}

export const mockApiService = new MockApiService();
export default mockApiService;