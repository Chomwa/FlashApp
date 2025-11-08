import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Alert, FlatList, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { transactionsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledSafeAreaView = styled(SafeAreaView);
const StyledFlatList = styled(FlatList);

interface PaymentRequest {
  id: string;
  transaction: {
    id: string;
    amount: string;
    currency: string;
    description: string;
    created_at: string;
    status: string;
    sender_name?: string;
    recipient_name?: string;
    type: 'sent' | 'received';
    phone: string;
  };
  is_payment_request: boolean;
  request_expires_at: string;
  sender_name: string;
  recipient_name: string;
}

export default function ActivityScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [activeSection, setActiveSection] = useState<'transactions' | 'requests'>('transactions');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeRequestTab, setActiveRequestTab] = useState<'sent' | 'received'>('received');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const filters = ['All', 'Sent', 'Received', 'Pending'];

  useEffect(() => {
    // Only load data if user is authenticated
    if (user) {
      loadData();
    } else {
      setLoading(false);
      setTransactions([]);
      setRequests([]);
    }
  }, [user, activeSection]);

  const loadData = async () => {
    if (activeSection === 'transactions') {
      await loadTransactions();
    } else {
      await loadRequests();
    }
  };

  // Safety check to ensure transactions is always an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const loadTransactions = async () => {
    // Don't make API calls if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Loading transactions for user:', user?.phone_number);
      
      // Check what token we're using
      const token = await require('@react-native-async-storage/async-storage').default.getItem('auth_token');
      console.log('🔑 Current token:', token?.substring(0, 10) + '...');
      console.log('🔑 Full token for debugging:', token);
      
      const response = await transactionsAPI.getTransactions();
      console.log('📦 Raw API response:', response);
      
      // Handle different response formats
      let transactionsList = [];
      
      if (Array.isArray(response)) {
        // Direct array response
        transactionsList = response;
        console.log('📋 Processing direct array response');
      } else if (response?.results && Array.isArray(response.results)) {
        // Paginated response with results
        transactionsList = response.results;
        console.log('📋 Processing paginated response with results');
      } else if (response?.data && Array.isArray(response.data)) {
        // Response wrapped in data property
        transactionsList = response.data;
        console.log('📋 Processing data-wrapped response');
      } else if (response?.transactions && Array.isArray(response.transactions)) {
        // Response with transactions property
        transactionsList = response.transactions;
        console.log('📋 Processing transactions-wrapped response');
      } else {
        // Fallback to empty array
        console.log('⚠️ Unexpected response format:', typeof response, response);
        transactionsList = [];
      }
      
      console.log('📊 Loaded transactions:', transactionsList.length, 'items');
      console.log('📊 First transaction:', transactionsList[0] || 'None');
      setTransactions(transactionsList);
    } catch (error) {
      console.error('❌ Error loading transactions:', error);

      // If it's a 401 error, user is not authenticated - clear transactions
      if (error.response?.status === 401) {
        console.log('🔐 User not authenticated, clearing transactions');
        setTransactions([]);
        return;
      }

      // Clear transactions on error - show empty state instead of mock data
      console.log('⚠️ Failed to load transactions, showing empty state');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = useCallback(async () => {
    // Don't make API calls if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('📝 Loading payment requests...');
      const response = await transactionsAPI.getPaymentRequests();
      
      console.log('📝 Raw payment requests response:', response);
      
      // Handle different response formats and ensure we have an array
      let requestsList = [];
      if (Array.isArray(response)) {
        requestsList = response;
      } else if (response?.results && Array.isArray(response.results)) {
        requestsList = response.results;
      } else if (response?.data && Array.isArray(response.data)) {
        requestsList = response.data;
      } else {
        console.log('⚠️ Unexpected response format for requests:', typeof response, response);
        requestsList = [];
      }
      
      // Filter for payment requests only
      const paymentRequests = requestsList.filter((req: PaymentRequest) => req?.is_payment_request);
      
      console.log('📝 Loaded payment requests:', paymentRequests.length, 'items');
      setRequests(paymentRequests);
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      
      // If it's a 401 error, user is not authenticated - clear requests
      if (error.response?.status === 401) {
        console.log('🔐 User not authenticated, clearing requests');
        setRequests([]);
        return;
      }
      
      // Clear requests on error
      console.log('⚠️ Failed to load requests, showing empty state');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = async () => {
    // Don't refresh if user is not authenticated
    if (!user) {
      console.log('🔐 User not authenticated, skipping refresh');
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredTransactions = safeTransactions.filter(transaction => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Sent') return transaction.type === 'sent';
    if (activeFilter === 'Received') return transaction.type === 'received';
    if (activeFilter === 'Pending') return transaction.status === 'pending';
    return false;
  });

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed') return '❌';
    if (status === 'pending') return '⏳';
    if (type === 'sent') return '↗️';
    if (type === 'received') return '↙️';
    return '💳';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-white/70';
    }
  };

  const getAmountColor = (type: string, status: string) => {
    if (status === 'failed') return 'text-red-400';
    if (status === 'pending') return 'text-yellow-400';
    return type === 'received' ? 'text-green-400' : 'text-white';
  };

  const formatAmount = (type: string, amount: string) => {
    const prefix = type === 'received' ? '+' : type === 'sent' ? '-' : '';
    return `${prefix}ZMW ${amount}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleTransactionPress = (transaction: any) => {
    try {
      console.log('🔍 Navigating to transaction details:', transaction.id);
      navigation.navigate('Receipt', {
        phone: transaction.phone,
        amount: transaction.amount,
        note: transaction.description || '',
        recipient: { name: transaction.recipient || transaction.sender },
        status: 'completed',
        transactionId: transaction.id,
        referenceId: transaction.reference_id
      });
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  };

  // Request handling functions - Show all payment requests for this user
  const filteredRequests = requests;

  const handleApproveRequest = async (requestId: string, amount: string, fromName: string) => {
    Alert.alert(
      'Approve Request',
      `Send ${amount} ZMW to ${fromName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              console.log('✅ Approving request:', requestId);
              const response = await transactionsAPI.approvePaymentRequest(requestId);
              console.log('✅ Approval response:', response);
              Alert.alert('Success', 'Payment request approved and payment initiated');
              await loadRequests(); // Refresh the list
            } catch (error) {
              console.error('❌ Error approving request:', error);
              
              let errorMessage = 'Failed to approve request';
              
              if (error.response?.status === 403) {
                errorMessage = 'You are not authorized to approve this request';
              } else if (error.response?.status === 404) {
                errorMessage = 'Request not found or has already been processed';
              } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.error || 'Invalid request';
              } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
              }
              
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleDeclineRequest = async (requestId: string, fromName: string) => {
    Alert.alert(
      'Decline Request',
      `Decline payment request from ${fromName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('❌ Declining request:', requestId);
              const response = await transactionsAPI.declinePaymentRequest(requestId, 'Declined by user');
              console.log('✅ Decline response:', response);
              Alert.alert('Success', 'Payment request declined');
              await loadRequests(); // Refresh the list
            } catch (error) {
              console.error('❌ Error declining request:', error);
              
              let errorMessage = 'Failed to decline request';
              
              if (error.response?.status === 403) {
                errorMessage = 'You are not authorized to decline this request';
              } else if (error.response?.status === 404) {
                errorMessage = 'Request not found or has already been processed';
              } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.error || 'Invalid request';
              } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
              }
              
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatRequestDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'fulfilled':
      case 'completed': return '#4CAF50';
      case 'declined':
      case 'failed': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#757575';
    }
  };

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1">
        {/* Clean Header */}
        <StyledView className="px-8 pt-8 pb-6">
          <StyledView className="flex-row items-center justify-between mb-12">
            <StyledText className="text-white text-3xl font-thin tracking-wide">
              Activity
            </StyledText>
            
            {/* Flash Favorites Icon - Future Feature */}
            {activeSection === 'requests' && (
              <StyledTouchableOpacity 
                className="w-10 h-10 items-center justify-center"
                onPress={() => {
                  // TODO: Navigate to Flash Favorites when implemented
                  console.log('Flash Favorites - Coming Soon');
                }}
              >
                <StyledText className="text-white/60 text-xl">⭐</StyledText>
              </StyledTouchableOpacity>
            )}
          </StyledView>

          {/* Minimal Section Tabs - Like iPhone Messages style */}
          <StyledView className="flex-row bg-white/5 rounded-2xl p-1 mb-6">
            <StyledTouchableOpacity
              onPress={() => setActiveSection('transactions')}
              className={`flex-1 py-3 rounded-xl ${
                activeSection === 'transactions' ? 'bg-white/10' : ''
              }`}
            >
              <StyledText className={`text-center font-light ${
                activeSection === 'transactions' ? 'text-white' : 'text-white/50'
              }`}>
                Transactions
              </StyledText>
            </StyledTouchableOpacity>
            <StyledTouchableOpacity
              onPress={() => setActiveSection('requests')}
              className={`flex-1 py-3 rounded-xl ${
                activeSection === 'requests' ? 'bg-white/10' : ''
              }`}
            >
              <StyledText className={`text-center font-light ${
                activeSection === 'requests' ? 'text-white' : 'text-white/50'
              }`}>
                Requests
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>

          {/* Transaction Filter Tabs */}
          {activeSection === 'transactions' && (
            <StyledView className="flex-row px-2 mb-4">
              {filters.map((filter) => (
                <StyledTouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-4 py-2 mr-3 rounded-xl ${
                    activeFilter === filter ? 'bg-sky/20' : 'bg-white/5'
                  }`}
                >
                  <StyledText className={`text-sm font-light ${
                    activeFilter === filter ? 'text-sky' : 'text-white/60'
                  }`}>
                    {filter}
                  </StyledText>
                </StyledTouchableOpacity>
              ))}
            </StyledView>
          )}
        </StyledView>

        {/* Content - Cleaner List Design */}
        <StyledView className="flex-1">
          <StyledScrollView 
            className="flex-1 px-6"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0EA5E9"
                colors={["#0EA5E9"]}
              />
            }
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <StyledView className="flex-1 items-center justify-center py-20">
                <StyledText className="text-white/60 text-lg font-thin">
                  Loading...
                </StyledText>
              </StyledView>
            ) : activeSection === 'transactions' ? (
              /* Transaction List - Clean Design */
              filteredTransactions.length > 0 ? (
                <StyledView className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <StyledTouchableOpacity 
                      key={transaction.id}
                      onPress={() => handleTransactionPress(transaction)}
                      className="bg-white/5 rounded-2xl p-5 active:opacity-70"
                    >
                      <StyledView className="flex-row items-center justify-between">
                        <StyledView className="flex-row items-center flex-1 mr-4">
                          <StyledView className="w-10 h-10 bg-sky/20 rounded-full items-center justify-center mr-4">
                            <StyledText className="text-sky font-medium text-sm">
                              {transaction.type === 'sent' 
                                ? transaction.recipient?.charAt(0)?.toUpperCase() || '?' 
                                : transaction.sender?.charAt(0)?.toUpperCase() || '?'
                              }
                            </StyledText>
                          </StyledView>
                          
                          <StyledView className="flex-1">
                            <StyledText className="text-white text-lg font-thin mb-1" numberOfLines={1}>
                              {transaction.type === 'sent' ? transaction.recipient : transaction.sender}
                            </StyledText>
                            <StyledText className="text-white/40 text-sm font-light" numberOfLines={1}>
                              {formatDate(transaction.created_at)} • {formatTime(transaction.created_at)}
                            </StyledText>
                          </StyledView>
                        </StyledView>
                        
                        <StyledView className="items-end">
                          <StyledText className={`text-lg font-thin ${getAmountColor(transaction.type, transaction.status)}`}>
                            {formatAmount(transaction.type, transaction.amount)}
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledTouchableOpacity>
                  ))}
                </StyledView>
              ) : (
                <StyledView className="items-center py-20">
                  <StyledView className="w-16 h-16 bg-white/5 rounded-2xl items-center justify-center mb-6">
                    <StyledText className="text-white/40 text-2xl">⚡</StyledText>
                  </StyledView>
                  <StyledText className="text-white text-xl font-thin mb-3">
                    No transactions yet
                  </StyledText>
                  <StyledText className="text-white/40 text-center font-light leading-6">
                    Your Flash activity will appear here{'\n'}when you send or receive money
                  </StyledText>
                </StyledView>
              )
            ) : (
              /* Requests List - Clean Design */
              filteredRequests.length > 0 ? (
                <StyledView className="space-y-2">
                  {filteredRequests.map((request) => {
                    const { transaction } = request;
                    const isSent = transaction.type === 'sent';
                    const isRequestExpired = isExpired(request.request_expires_at);
                    const isPending = transaction.status.toLowerCase() === 'pending';
                    
                    return (
                      <StyledView 
                        key={request.id}
                        className="bg-white/5 rounded-2xl p-5"
                      >
                        <StyledView className="flex-row items-center justify-between mb-4">
                          <StyledView className="flex-row items-center flex-1 mr-4">
                            <StyledView className="w-10 h-10 bg-emerald/20 rounded-full items-center justify-center mr-4">
                              <StyledText className="text-emerald font-medium text-sm">
                                {isSent ? request.recipient_name?.charAt(0)?.toUpperCase() || '?' : request.sender_name?.charAt(0)?.toUpperCase() || '?'}
                              </StyledText>
                            </StyledView>
                            
                            <StyledView className="flex-1">
                              <StyledText className="text-white text-lg font-thin mb-1" numberOfLines={1}>
                                {isSent ? request.recipient_name : request.sender_name}
                              </StyledText>
                              <StyledText className="text-white/40 text-sm font-light" numberOfLines={1}>
                                {formatRequestDate(transaction.created_at)}
                              </StyledText>
                            </StyledView>
                          </StyledView>
                          
                          <StyledView className="items-end">
                            <StyledText className="text-white text-lg font-thin">
                              {isSent ? '-' : '+'}ZMW {transaction.amount}
                            </StyledText>
                            <StyledView 
                              className="px-2 py-1 rounded-lg mt-1"
                              style={{ backgroundColor: getRequestStatusColor(transaction.status) + '40' }}
                            >
                              <StyledText 
                                className="text-xs font-medium"
                                style={{ color: getRequestStatusColor(transaction.status) }}
                              >
                                {transaction.status.toUpperCase()}
                              </StyledText>
                            </StyledView>
                          </StyledView>
                        </StyledView>

                        {transaction.description && (
                          <StyledText className="text-white/50 text-sm mb-4 font-light italic">
                            "{transaction.description}"
                          </StyledText>
                        )}

                        {/* No action buttons needed for sent requests - user is waiting for recipient to respond */}
                        {isPending && !isRequestExpired && (
                          <StyledView className="pt-2">
                            <StyledText className="text-white/50 text-center text-sm font-light">
                              {isSent ? 'Waiting for response...' : 'Request expired'}
                            </StyledText>
                          </StyledView>
                        )}
                        
                        {isRequestExpired && (
                          <StyledView className="pt-2">
                            <StyledText className="text-red-400 text-center text-sm font-medium">
                              Expired
                            </StyledText>
                          </StyledView>
                        )}
                      </StyledView>
                    );
                  })}
                </StyledView>
              ) : (
                <StyledView className="items-center py-20">
                  <StyledView className="w-16 h-16 bg-white/5 rounded-2xl items-center justify-center mb-6">
                    <StyledText className="text-white/40 text-2xl">📬</StyledText>
                  </StyledView>
                  <StyledText className="text-white text-xl font-thin mb-3">
                    No requests yet
                  </StyledText>
                  <StyledText className="text-white/40 text-center font-light leading-6">
                    Payment requests will appear here{'\n'}when you send or receive them
                  </StyledText>
                </StyledView>
              )
            )}
            
            <StyledView className="h-20" />
          </StyledScrollView>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}