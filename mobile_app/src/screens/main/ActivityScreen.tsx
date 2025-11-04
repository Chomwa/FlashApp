import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
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

export default function ActivityScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('All');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const filters = ['All', 'Sent', 'Received', 'Pending'];

  useEffect(() => {
    // Only load transactions if user is authenticated
    if (user) {
      loadTransactions();
    } else {
      setLoading(false);
      setTransactions([]);
    }
  }, [user]);

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
      console.error('Error loading transactions:', error);
      
      // If it's a 401 error, user is not authenticated - clear transactions
      if (error.response?.status === 401) {
        console.log('🔐 User not authenticated, clearing transactions');
        setTransactions([]);
        return;
      }
      
      // Use mock data as fallback for other errors
      setTransactions([
        {
          id: '1',
          type: 'sent',
          amount: '150.00',
          currency: 'ZMW',
          recipient: 'John Mwanza',
          phone: '+260971234567',
          created_at: '2024-01-15T14:30:00Z',
          status: 'completed',
          description: 'Lunch money'
        },
        {
          id: '2',
          type: 'received',
          amount: '75.50',
          currency: 'ZMW',
          sender: 'Sarah Banda',
          phone: '+260977654321',
          created_at: '2024-01-14T10:15:00Z',
          status: 'completed',
          description: 'Taxi fare'
        },
        {
          id: '3',
          type: 'sent',
          amount: '300.00',
          currency: 'ZMW',
          recipient: 'Mary Lungu',
          phone: '+260979876543',
          created_at: '2024-01-13T16:45:00Z',
          status: 'pending',
          description: 'Groceries'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    // Don't refresh if user is not authenticated
    if (!user) {
      console.log('🔐 User not authenticated, skipping refresh');
      setRefreshing(false);
      return;
    }
    
    setRefreshing(true);
    await loadTransactions();
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

  return (
    <StyledSafeAreaView className="flex-1 bg-navy">
      <StyledView className="flex-1">
        {/* Header */}
        <StyledView className="px-8 pt-4 pb-6">
          <StyledText className="text-white text-3xl font-thin mb-8">
            Activity
          </StyledText>

          {/* Filter Tabs */}
          <StyledView className="flex-row mb-2">
            {filters.map((filter) => (
              <StyledTouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`flex-1 pb-4 border-b ${
                  activeFilter === filter ? 'border-sky' : 'border-white/10'
                }`}
              >
                <StyledText className={`text-center text-lg font-light ${
                  activeFilter === filter ? 'text-white' : 'text-white/50'
                }`}>
                  {filter}
                </StyledText>
              </StyledTouchableOpacity>
            ))}
          </StyledView>
        </StyledView>

        {/* Transaction List */}
        <StyledView className="flex-1">
          <StyledScrollView 
            className="flex-1 px-8"
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
                <StyledText className="text-white/60 text-lg font-light">
                  Loading transactions...
                </StyledText>
              </StyledView>
            ) : filteredTransactions.length > 0 ? (
              <StyledView className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <StyledTouchableOpacity 
                    key={transaction.id}
                    onPress={() => handleTransactionPress(transaction)}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 active:opacity-70"
                  >
                    <StyledView className="flex-row items-center">
                      <StyledView className="w-10 h-10 bg-emerald rounded-full items-center justify-center mr-3">
                        <StyledText className="text-white font-bold text-sm">
                          {transaction.type === 'sent' 
                            ? transaction.recipient?.charAt(0)?.toUpperCase() || '?' 
                            : transaction.sender?.charAt(0)?.toUpperCase() || '?'
                          }
                        </StyledText>
                      </StyledView>
                      
                      <StyledView className="flex-1 mr-4">
                        <StyledView className="flex-row justify-between items-start mb-1">
                          <StyledView className="flex-1 mr-3">
                            <StyledText className="text-white font-semibold text-lg" numberOfLines={1}>
                              {transaction.type === 'sent' ? transaction.recipient : transaction.sender}
                            </StyledText>
                          </StyledView>
                          <StyledText className={`font-light text-lg ${getAmountColor(transaction.type, transaction.status)}`}>
                            {formatAmount(transaction.type, transaction.amount)}
                          </StyledText>
                        </StyledView>
                        
                        <StyledView className="flex-row justify-between items-center">
                          <StyledView className="flex-1 mr-3">
                            <StyledText className="text-white/60 text-sm font-light" numberOfLines={1}>
                              {transaction.phone}
                            </StyledText>
                          </StyledView>
                          <StyledText className="text-white/50 text-sm font-light">
                            {formatDate(transaction.created_at)}
                          </StyledText>
                        </StyledView>
                      </StyledView>
                    </StyledView>
                  </StyledTouchableOpacity>
                ))}
              </StyledView>
            ) : (
              <StyledView className="bg-white/5 border border-white/10 rounded-3xl p-8 items-center">
                <StyledView className="w-16 h-16 bg-white/10 rounded-2xl items-center justify-center mb-4">
                  <StyledText className="text-white/60 text-2xl">📊</StyledText>
                </StyledView>
                <StyledText className="text-white text-xl font-light mb-2">
                  No {activeFilter.toLowerCase()} transactions
                </StyledText>
                <StyledText className="text-white/50 text-center font-light">
                  Your {activeFilter.toLowerCase()} activity will appear here
                </StyledText>
              </StyledView>
            )}
            
            <StyledView className="h-20" />
          </StyledScrollView>
        </StyledView>
      </StyledView>
    </StyledSafeAreaView>
  );
}