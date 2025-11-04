/**
 * Mock Data Service for Flash App
 * Provides realistic fake data for offline testing and demos
 */

export interface MockUser {
  id: string;
  phone_number: string;
  full_name: string;
  email?: string;
  avatar?: string;
  is_phone_verified: boolean;
  default_currency: string;
  created_at: string;
}

export interface MockTransaction {
  id: string;
  reference_id: string;
  transaction_type: string;
  amount: string;
  currency: string;
  description?: string;
  sender: MockUser;
  recipient?: MockUser;
  recipient_phone: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  type: 'sent' | 'received';
  phone: string;
}

export interface MockContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastTransaction?: string;
}

export interface MockWallet {
  balance: string;
  currency: string;
  daily_limit: string;
  daily_spent: string;
}

// Mock Users
export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    phone_number: '+260971111111',
    full_name: 'Alice Mwanza',
    email: 'alice@example.com',
    is_phone_verified: true,
    default_currency: 'ZMW',
    created_at: '2024-10-15T08:00:00Z'
  },
  {
    id: 'user-2', 
    phone_number: '+260972222222',
    full_name: 'Bob Phiri',
    email: 'bob@example.com',
    is_phone_verified: true,
    default_currency: 'ZMW',
    created_at: '2024-10-16T09:30:00Z'
  },
  {
    id: 'user-3',
    phone_number: '+260976666666',
    full_name: 'Carol Banda',
    is_phone_verified: true,
    default_currency: 'ZMW',
    created_at: '2024-10-20T14:15:00Z'
  },
  {
    id: 'user-4',
    phone_number: '+260977777777',
    full_name: 'David Tembo',
    is_phone_verified: true,
    default_currency: 'ZMW',
    created_at: '2024-10-22T11:45:00Z'
  }
];

// Mock Contacts
export const mockContacts: MockContact[] = [
  {
    id: 'contact-1',
    name: 'Bob Phiri',
    phone: '+260972222222',
    lastTransaction: '2024-11-01'
  },
  {
    id: 'contact-2', 
    name: 'Carol Banda',
    phone: '+260976666666',
    lastTransaction: '2024-10-28'
  },
  {
    id: 'contact-3',
    name: 'David Tembo', 
    phone: '+260977777777',
    lastTransaction: '2024-10-25'
  },
  {
    id: 'contact-4',
    name: 'Grace Mulenga',
    phone: '+260978888888'
  },
  {
    id: 'contact-5',
    name: 'John Sakala',
    phone: '+260979999999'
  },
  {
    id: 'contact-6',
    name: 'Mary Chanda',
    phone: '+260966666666'
  }
];

// Mock Wallet Data
export const mockWallet: MockWallet = {
  balance: '2,450.75',
  currency: 'ZMW',
  daily_limit: '5,000.00',
  daily_spent: '750.00'
};

// Generate mock transactions
export const generateMockTransactions = (currentUserPhone: string): MockTransaction[] => {
  const today = new Date();
  const transactions: MockTransaction[] = [];

  // Recent transaction scenarios
  const scenarios = [
    {
      type: 'sent' as const,
      recipient_phone: '+260972222222',
      recipient_name: 'Bob Phiri',
      amount: '150.00',
      description: 'Lunch money',
      daysAgo: 0,
      status: 'completed' as const
    },
    {
      type: 'received' as const,
      sender_phone: '+260976666666',
      sender_name: 'Carol Banda',
      amount: '500.00',
      description: 'Rent contribution',
      daysAgo: 1,
      status: 'completed' as const
    },
    {
      type: 'sent' as const,
      recipient_phone: '+260977777777',
      recipient_name: 'David Tembo',
      amount: '75.50',
      description: 'Transport fare',
      daysAgo: 2,
      status: 'completed' as const
    },
    {
      type: 'received' as const,
      sender_phone: '+260978888888',
      sender_name: 'Grace Mulenga',
      amount: '1,200.00',
      description: 'Salary advance',
      daysAgo: 3,
      status: 'completed' as const
    },
    {
      type: 'sent' as const,
      recipient_phone: '+260979999999',
      recipient_name: 'John Sakala',
      amount: '300.00',
      description: 'Birthday gift',
      daysAgo: 5,
      status: 'completed' as const
    },
    {
      type: 'sent' as const,
      recipient_phone: '+260966666666',
      recipient_name: 'Mary Chanda',
      amount: '89.25',
      description: 'Grocery shopping',
      daysAgo: 7,
      status: 'completed' as const
    },
    {
      type: 'received' as const,
      sender_phone: '+260972222222',
      sender_name: 'Bob Phiri',
      amount: '450.00',
      description: 'Freelance work payment',
      daysAgo: 10,
      status: 'completed' as const
    },
    {
      type: 'sent' as const,
      recipient_phone: '+260976666666',
      recipient_name: 'Carol Banda',
      amount: '200.00',
      description: 'Utilities bill',
      daysAgo: 12,
      status: 'failed' as const
    }
  ];

  scenarios.forEach((scenario, index) => {
    const transactionDate = new Date(today);
    transactionDate.setDate(today.getDate() - scenario.daysAgo);
    transactionDate.setHours(Math.floor(Math.random() * 24));
    transactionDate.setMinutes(Math.floor(Math.random() * 60));

    const currentUser = mockUsers.find(u => u.phone_number === currentUserPhone) || mockUsers[0];
    
    let sender: MockUser, recipient: MockUser | undefined, phone: string;
    
    if (scenario.type === 'sent') {
      sender = currentUser;
      recipient = mockUsers.find(u => u.phone_number === scenario.recipient_phone);
      phone = scenario.recipient_phone;
    } else {
      sender = mockUsers.find(u => u.phone_number === (scenario as any).sender_phone) || mockUsers[1];
      recipient = currentUser;
      phone = sender.phone_number;
    }

    const transaction = {
      id: `mock-tx-${index + 1}`,
      reference_id: `FL${transactionDate.getFullYear()}${String(transactionDate.getMonth() + 1).padStart(2, '0')}${String(transactionDate.getDate()).padStart(2, '0')}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      transaction_type: scenario.type === 'sent' ? 'p2p_send' : 'p2p_receive',
      amount: scenario.amount,
      currency: 'ZMW',
      description: scenario.description,
      sender,
      recipient,
      recipient_phone: scenario.type === 'sent' ? scenario.recipient_phone : currentUserPhone,
      status: scenario.status,
      created_at: transactionDate.toISOString(),
      completed_at: scenario.status === 'completed' ? transactionDate.toISOString() : undefined,
      type: scenario.type,
      phone
    };

    // Add name strings for compatibility with ActivityScreen
    if (scenario.type === 'sent') {
      (transaction as any).recipient = scenario.recipient_name;
    } else {
      (transaction as any).sender = scenario.sender_name;
    }

    transactions.push(transaction);
  });

  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

// Mock API responses with realistic delays
export const mockApiDelay = (min: number = 200, max: number = 800): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Generate transaction ID
export const generateMockTransactionId = (): string => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() + 
                  String(now.getMonth() + 1).padStart(2, '0') + 
                  String(now.getDate()).padStart(2, '0');
  const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
  return `FL${dateStr}${randomStr}`;
};

export const generateMockReferenceId = (): string => {
  return generateMockTransactionId();
};