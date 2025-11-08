import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { transactionsAPI } from '../../services/api';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

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

const RequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');

  const loadRequests = useCallback(async () => {
    try {
      console.log('📝 Loading payment requests...');
      const response = await transactionsAPI.getPaymentRequests();
      
      // Filter for payment requests only
      const paymentRequests = response.filter((req: PaymentRequest) => req.is_payment_request);
      
      console.log('📝 Loaded payment requests:', paymentRequests);
      setRequests(paymentRequests);
    } catch (error) {
      console.error('❌ Error loading requests:', error);
      Alert.alert('Error', 'Failed to load payment requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [loadRequests]);

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
              await transactionsAPI.approvePaymentRequest(requestId);
              Alert.alert('Success', 'Payment request approved successfully');
              loadRequests(); // Refresh the list
            } catch (error) {
              console.error('❌ Error approving request:', error);
              Alert.alert('Error', 'Failed to approve request');
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
              await transactionsAPI.declinePaymentRequest(requestId, 'Declined by user');
              Alert.alert('Success', 'Payment request declined');
              loadRequests(); // Refresh the list
            } catch (error) {
              console.error('❌ Error declining request:', error);
              Alert.alert('Error', 'Failed to decline request');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'fulfilled':
      case 'completed':
        return '#4CAF50';
      case 'declined':
      case 'failed':
        return '#F44336';
      case 'expired':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'clock';
      case 'fulfilled':
      case 'completed':
        return 'check-circle';
      case 'declined':
      case 'failed':
        return 'x-circle';
      case 'expired':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (dateString: string) => {
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

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'sent') {
      return request.transaction.type === 'sent';
    } else {
      return request.transaction.type === 'received';
    }
  });

  const renderRequestItem = ({ item }: { item: PaymentRequest }) => {
    const { transaction } = item;
    const isSent = transaction.type === 'sent';
    const isRequestExpired = isExpired(item.request_expires_at);
    const isPending = transaction.status.toLowerCase() === 'pending';
    
    return (
      <View style={styles.requestItem}>
        <View style={styles.requestHeader}>
          <View style={styles.contactInfo}>
            <View style={styles.avatar}>
              <Icon name="user" size={20} color="#666" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactName}>
                {isSent ? item.recipient_name : item.sender_name}
              </Text>
              <Text style={styles.contactPhone}>
                {transaction.phone}
              </Text>
            </View>
          </View>
          <View style={styles.requestMeta}>
            <Text style={styles.amount}>
              {isSent ? '-' : '+'}K{transaction.amount}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
              <Icon 
                name={getStatusIcon(transaction.status)} 
                size={12} 
                color="white" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {transaction.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {transaction.description ? (
          <Text style={styles.description}>{transaction.description}</Text>
        ) : null}

        <View style={styles.requestFooter}>
          <Text style={styles.timestamp}>
            {formatDate(transaction.created_at)}
          </Text>
          
          {isRequestExpired && (
            <Text style={styles.expiredText}>Expired</Text>
          )}
          
          {!isSent && isPending && !isRequestExpired && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDeclineRequest(item.id, item.sender_name)}
              >
                <Icon name="x" size={16} color="#F44336" />
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApproveRequest(item.id, transaction.amount, item.sender_name)}
              >
                <Icon name="check" size={16} color="#4CAF50" />
                <Text style={styles.approveText}>Approve</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="inbox" size={48} color="#ccc" />
      <Text style={styles.emptyTitle}>
        No {activeTab} requests
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'sent' 
          ? 'Requests you send will appear here'
          : 'Requests from others will appear here'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Requests</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Requests</Text>
        <TouchableOpacity 
          style={styles.manageButton}
          onPress={() => navigation.navigate('Contacts')}
        >
          <Icon name="settings" size={20} color="#007AFF" />
          <Text style={styles.manageText}>Manage</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            Received
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={filteredRequests.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  list: {
    flex: 1,
    paddingTop: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    marginTop: 5,
  },
  requestItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactPhone: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  requestMeta: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  expiredText: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  approveButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  declineButton: {
    borderColor: '#F44336',
    backgroundColor: '#fff8f8',
  },
  approveText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  declineText: {
    color: '#F44336',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  manageText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default RequestsScreen;