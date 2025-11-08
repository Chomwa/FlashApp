import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/environment';
import mockApiService from './mockApi';

// Zambia-specific phone number validation
export const validateZambianPhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Zambian number
  // Zambian numbers: 260 + 9 digits (total 12 digits)
  // Local formats: 09xx xxxxxx (10 digits) or 7xx xxx xxx (9 digits)
  return (
    (cleaned.startsWith('260') && cleaned.length === 12) ||
    (cleaned.startsWith('09') && cleaned.length === 10) ||
    (cleaned.startsWith('97') && cleaned.length === 9) || // MTN: 977, 976, 966
    (cleaned.startsWith('76') && cleaned.length === 9) || // MTN old format
    (cleaned.startsWith('96') && cleaned.length === 9)    // Airtel
  );
};

export const formatZambianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('260') && cleaned.length === 12) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('09') && cleaned.length === 10) {
    return `+260${cleaned.substring(1)}`;
  } else if (cleaned.length === 9 && (
    cleaned.startsWith('97') || 
    cleaned.startsWith('76') || 
    cleaned.startsWith('96')
  )) {
    return `+260${cleaned}`;
  }
  
  return phone;
};

// Create axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async config => {
    try {
      // Skip auth token for public endpoints
      const publicEndpoints = [
        '/auth/register/',
        '/auth/login/',
        '/auth/send-otp/',
        '/auth/verify-otp/'
      ];
      
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );
      
      if (!isPublicEndpoint) {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Token ${token}`;
          console.log(`🔑 Adding auth token to ${config.method?.toUpperCase()} ${config.url}`);
        } else {
          console.log(`⚠️ No auth token found for ${config.method?.toUpperCase()} ${config.url}`);
        }
      } else {
        console.log(`🔓 Public endpoint - no auth needed: ${config.method?.toUpperCase()} ${config.url}`);
      }
    } catch (error) {
      console.log('🔥 Error getting auth token:', error);
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async error => {
    const url = error.config?.url || 'unknown';
    const method = error.config?.method?.toUpperCase() || 'unknown';
    
    if (error.response?.status === 401) {
      console.log(`🔒 401 Unauthorized: ${method} ${url} - checking token validity`);
      
      const token = await AsyncStorage.getItem('auth_token');
      if (token && token.startsWith('dev-token-')) {
        console.log('🛠️ Development mode: Simulating successful response for', url);
        
        // In development mode, simulate successful responses for key endpoints
        if (url.includes('/transactions/send/')) {
          return {
            data: {
              transaction_id: 'dev-tx-' + Date.now(),
              reference_id: 'dev-ref-' + Date.now(),
              status: 'pending',
              amount: error.config?.data ? JSON.parse(error.config.data).amount : 100,
              recipient_phone: error.config?.data ? JSON.parse(error.config.data).recipient_phone : '+260971111111'
            },
            status: 201,
            statusText: 'Created',
            config: error.config,
            headers: {}
          };
        } else if (url.includes('/transactions/wallet/')) {
          return {
            data: {
              balance: '1000.00',
              currency: 'ZMW',
              daily_limit: '5000.00',
              daily_spent: '0.00'
            },
            status: 200,
            statusText: 'OK',
            config: error.config,
            headers: {}
          };
        } else if (url.includes('/transactions/transactions/')) {
          return {
            data: [],
            status: 200,
            statusText: 'OK',
            config: error.config,
            headers: {}
          };
        }
      } else {
        console.log(`🔒 Removing invalid token: ${token?.substring(0, 10)}...`);
        await AsyncStorage.removeItem('auth_token');
      }
    } else {
      console.log(`❌ API Error: ${method} ${url} - ${error.response?.status || error.message}`);
    }
    return Promise.reject(error);
  },
);

// Mock mode disabled - using real backend
const ENABLE_MOCK_MODE = false;

// Auth API
export const authAPI = {
  login: async (phone_number: string, password: string) => {
    // Try mock API first if enabled
    if (ENABLE_MOCK_MODE) {
      try {
        mockApiService.setOfflineMode(true);
        return await mockApiService.login(phone_number, password);
      } catch (mockError) {
        console.log('🔄 Mock API failed, trying real API:', mockError.message);
      }
    }

    // Use real API
    try {
      const response = await api.post('/auth/login/', {phone_number, password});
      return response.data;
    } catch (error) {
      // If real API fails and mock is enabled, use mock as fallback
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock fallback');
        mockApiService.setOfflineMode(true);
        return await mockApiService.login(phone_number, password);
      }
      throw error;
    }
  },

  register: async (phone_number: string, password: string, full_name: string, otp_code?: string) => {
    // Try mock API first if enabled
    if (ENABLE_MOCK_MODE) {
      try {
        mockApiService.setOfflineMode(true);
        return await mockApiService.register(phone_number, password, full_name);
      } catch (mockError) {
        console.log('🔄 Mock registration failed, trying real API:', mockError.message);
      }
    }

    // Use real API
    try {
      const requestData: any = {
        phone_number,
        password,
        password_confirm: password,
        full_name,
      };
      
      if (otp_code) {
        requestData.otp_code = otp_code;
      }
      
      const response = await api.post('/auth/register/', requestData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock fallback for registration');
        mockApiService.setOfflineMode(true);
        return await mockApiService.register(phone_number, password, full_name);
      }
      throw error;
    }
  },

  sendOTP: async (phone_number: string) => {
    if (ENABLE_MOCK_MODE) {
      try {
        mockApiService.setOfflineMode(true);
        return await mockApiService.sendOTP(phone_number);
      } catch (mockError) {
        console.log('🔄 Mock OTP send failed, trying real API');
      }
    }

    try {
      const response = await api.post('/auth/send-otp/', {phone_number});
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock OTP');
        mockApiService.setOfflineMode(true);
        return await mockApiService.sendOTP(phone_number);
      }
      throw error;
    }
  },

  verifyOTP: async (phone_number: string, otp_code: string, full_name?: string, invite_code?: string) => {
    if (ENABLE_MOCK_MODE) {
      try {
        mockApiService.setOfflineMode(true);
        return await mockApiService.verifyOTP(phone_number, otp_code, full_name);
      } catch (mockError) {
        console.log('🔄 Mock OTP verify failed, trying real API');
      }
    }

    try {
      const requestData: any = {
        phone_number,
        otp_code,
        full_name,
      };
      
      if (invite_code) {
        requestData.invite_code = invite_code;
      }
      
      const response = await api.post('/auth/verify-otp/', requestData);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock OTP verification');
        mockApiService.setOfflineMode(true);
        return await mockApiService.verifyOTP(phone_number, otp_code, full_name);
      }
      throw error;
    }
  },

  logout: async () => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.logout();
      } catch (mockError) {
        console.log('🔄 Mock logout failed, trying real API');
      }
    }

    try {
      const response = await api.post('/auth/logout/');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Using mock logout');
        return await mockApiService.logout();
      }
      throw error;
    }
  },

  getCurrentUser: async () => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.getCurrentUser();
      } catch (mockError) {
        console.log('🔄 Mock getCurrentUser failed, trying real API');
      }
    }

    try {
      const response = await api.get('/auth/me/');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock user data');
        return await mockApiService.getCurrentUser();
      }
      throw error;
    }
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async () => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.getTransactions();
      } catch (mockError) {
        console.log('🔄 Mock getTransactions failed, trying real API');
      }
    }

    try {
      const response = await api.get('/transactions/transactions/');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock transactions');
        return await mockApiService.getTransactions();
      }
      throw error;
    }
  },

  getWallet: async () => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.getWallet();
      } catch (mockError) {
        console.log('🔄 Mock getWallet failed, trying real API');
      }
    }

    try {
      const response = await api.get('/transactions/wallet/');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock wallet');
        return await mockApiService.getWallet();
      }
      throw error;
    }
  },

  sendMoney: async (data: {
    recipient_phone: string;
    amount: number;
    description?: string;
  }) => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.sendMoney(data);
      } catch (mockError) {
        console.log('🔄 Mock sendMoney failed, trying real API');
      }
    }

    try {
      const response = await api.post('/transactions/send/', data);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock send money');
        return await mockApiService.sendMoney(data);
      }
      throw error;
    }
  },

  requestMoney: async (data: {
    payer_phone: string;
    amount: number;
    description?: string;
  }) => {
    try {
      const response = await api.post('/transactions/request/', data);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock (request money not implemented in mock)');
        throw new Error('Request money not available in mock mode');
      }
      throw error;
    }
  },

  getTransaction: async (id: string) => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.getTransaction(id);
      } catch (mockError) {
        console.log('🔄 Mock getTransaction failed, trying real API');
      }
    }

    try {
      const response = await api.get(`/transactions/transactions/${id}/`);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock transaction');
        return await mockApiService.getTransaction(id);
      }
      throw error;
    }
  },

  generateQRCode: async (amount?: string, message?: string) => {
    try {
      const data: any = {};
      if (amount) data.amount = amount;
      if (message) data.message = message;

      const response = await api.post('/transactions/generate-qr/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Payment Requests API
  getPaymentRequests: async () => {
    try {
      const response = await api.get('/transactions/p2p/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  approvePaymentRequest: async (requestId: string) => {
    try {
      const response = await api.post(`/transactions/p2p/${requestId}/approve/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  declinePaymentRequest: async (requestId: string, reason?: string) => {
    try {
      const response = await api.post(`/transactions/p2p/${requestId}/decline/`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};


// Payments API
export const paymentsAPI = {
  getMTNBalance: async () => {
    const response = await api.get('/payments/mtn/balance/');
    return response.data;
  },

  sendMTN: async (data: {
    amount: number;
    recipient_phone: string;
    external_id: string;
    message?: string;
    note?: string;
  }) => {
    const response = await api.post('/payments/mtn/send/', data);
    return response.data;
  },

  getMTNStatus: async (reference_id: string, type: 'disbursement' | 'collection' = 'disbursement') => {
    const response = await api.get(`/payments/mtn/status/${reference_id}/?type=${type}`);
    return response.data;
  },
};

// Contacts API
export const contactsAPI = {
  getContacts: async () => {
    if (ENABLE_MOCK_MODE) {
      try {
        return await mockApiService.getContacts();
      } catch (mockError) {
        console.log('🔄 Mock getContacts failed, trying real API');
      }
    }

    try {
      const response = await api.get('/auth/contacts/');
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock contacts');
        return await mockApiService.getContacts();
      }
      throw error;
    }
  },

  addContact: async (data: {contact_name: string; contact_phone: string}) => {
    try {
      const response = await api.post('/auth/contacts/', data);
      return response.data;
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock (add contact not implemented)');
        throw new Error('Add contact not available in mock mode');
      }
      throw error;
    }
  },

  deleteContact: async (id: string) => {
    try {
      await api.delete(`/auth/contacts/${id}/`);
    } catch (error) {
      if (ENABLE_MOCK_MODE) {
        console.log('🎭 Real API failed, using mock (delete contact not implemented)');
        throw new Error('Delete contact not available in mock mode');
      }
      throw error;
    }
  },
};

// Invite/Referral API
export const inviteAPI = {
  validateInviteCode: async (invite_code: string) => {
    try {
      const response = await api.post('/auth/validate-invite/', { invite_code });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getInviteData: async () => {
    try {
      const response = await api.get('/auth/invite-data/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  generateInviteCode: async () => {
    try {
      const response = await api.post('/auth/generate-invite/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendInvite: async (data: { phone_number: string; message?: string }) => {
    try {
      const response = await api.post('/auth/send-invite/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getInviteHistory: async () => {
    try {
      const response = await api.get('/auth/invite-history/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  validateInviteCode: async (invite_code: string) => {
    try {
      const response = await api.post('/auth/validate-invite/', { invite_code });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Profile API
export const profileAPI = {
  updateProfile: async (data: {
    full_name?: string;
    email?: string;
    date_of_birth?: string;
    address?: string;
    id_number?: string;
  }) => {
    try {
      const response = await api.patch('/auth/profile/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  changePin: async (data: { current_pin: string; new_pin: string }) => {
    try {
      const response = await api.post('/auth/change-pin/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSecuritySettings: async (data: {
    biometrics_enabled?: boolean;
    auto_lock_enabled?: boolean;
    auto_lock_time?: number;
  }) => {
    try {
      const response = await api.patch('/auth/security-settings/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;