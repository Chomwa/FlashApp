import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Network Service for Flash Payment App
 * 
 * Handles connectivity detection and offline queue management
 * Critical for developing countries with unreliable internet
 */

interface QueuedTransaction {
  id: string;
  recipient_phone: string;
  amount: number;
  description?: string;
  timestamp: string;
  retryCount: number;
  status: 'queued' | 'processing' | 'failed';
}

export class NetworkService {
  private static isOnlineState = true;
  private static listeners: ((isOnline: boolean) => void)[] = [];

  /**
   * Simple connectivity check (can be enhanced with @react-native-community/netinfo)
   */
  static async isOnline(): Promise<boolean> {
    try {
      // Try to fetch from a reliable endpoint
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD',
        timeout: 5000 
      });
      return response.ok;
    } catch (error) {
      console.log('🔌 Network check failed - assuming offline:', error.message);
      return false;
    }
  }

  /**
   * Monitor network connectivity changes
   */
  static async startNetworkMonitoring() {
    const checkConnectivity = async () => {
      const wasOnline = this.isOnlineState;
      const isCurrentlyOnline = await this.isOnline();
      
      if (wasOnline !== isCurrentlyOnline) {
        this.isOnlineState = isCurrentlyOnline;
        
        if (isCurrentlyOnline) {
          console.log('📶 Network restored - processing offline queue');
          await this.processOfflineQueue();
        } else {
          console.log('📱 Network lost - entering offline mode');
        }
        
        // Notify listeners
        this.listeners.forEach(listener => listener(isCurrentlyOnline));
      }
    };

    // Check every 30 seconds
    setInterval(checkConnectivity, 30000);
    
    // Initial check
    await checkConnectivity();
  }

  /**
   * Add listener for connectivity changes
   */
  static addConnectivityListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Queue transaction for offline processing
   */
  static async queueTransaction(transactionData: {
    recipient_phone: string;
    amount: number;
    description?: string;
  }): Promise<QueuedTransaction> {
    const queuedTx: QueuedTransaction = {
      id: 'offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      ...transactionData,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'queued'
    };

    try {
      const queue = await AsyncStorage.getItem('offline_transaction_queue') || '[]';
      const transactions: QueuedTransaction[] = JSON.parse(queue);
      transactions.push(queuedTx);
      
      await AsyncStorage.setItem('offline_transaction_queue', JSON.stringify(transactions));
      console.log('📝 Queued transaction for offline processing:', queuedTx.id);
      
      return queuedTx;
    } catch (error) {
      console.error('❌ Failed to queue transaction:', error);
      throw new Error('Failed to queue transaction for offline processing');
    }
  }

  /**
   * Process queued transactions when connectivity returns
   */
  static async processOfflineQueue(): Promise<void> {
    try {
      const queue = await AsyncStorage.getItem('offline_transaction_queue') || '[]';
      const transactions: QueuedTransaction[] = JSON.parse(queue);
      
      if (transactions.length === 0) {
        console.log('📭 No queued transactions to process');
        return;
      }

      console.log(`🔄 Processing ${transactions.length} queued transactions`);
      const updatedQueue: QueuedTransaction[] = [];

      for (const tx of transactions) {
        try {
          tx.status = 'processing';
          
          // Import API dynamically to avoid circular dependencies
          const { transactionsAPI } = await import('./api');
          
          console.log(`💰 Processing queued transaction: ${tx.id}`);
          const response = await transactionsAPI.sendMoney({
            recipient_phone: tx.recipient_phone,
            amount: tx.amount,
            description: tx.description
          });

          console.log(`✅ Successfully processed queued transaction: ${tx.id}`);
          
          // Don't add to updated queue (remove from queue)
          // Could store in completed transactions history if needed
          
        } catch (error) {
          console.error(`❌ Failed to process queued transaction ${tx.id}:`, error);
          
          tx.retryCount++;
          tx.status = 'failed';
          
          // Retry up to 3 times
          if (tx.retryCount < 3) {
            tx.status = 'queued';
            updatedQueue.push(tx);
            console.log(`🔄 Will retry transaction ${tx.id} (attempt ${tx.retryCount + 1}/3)`);
          } else {
            console.log(`❌ Giving up on transaction ${tx.id} after 3 attempts`);
            // Could notify user about failed transaction
          }
        }
      }

      // Update queue with remaining transactions
      await AsyncStorage.setItem('offline_transaction_queue', JSON.stringify(updatedQueue));
      
      if (updatedQueue.length === 0) {
        console.log('🎉 All queued transactions processed successfully');
      } else {
        console.log(`⏳ ${updatedQueue.length} transactions remain in queue`);
      }
      
    } catch (error) {
      console.error('❌ Error processing offline queue:', error);
    }
  }

  /**
   * Get current queue status
   */
  static async getQueueStatus(): Promise<{
    queuedCount: number;
    transactions: QueuedTransaction[];
  }> {
    try {
      const queue = await AsyncStorage.getItem('offline_transaction_queue') || '[]';
      const transactions: QueuedTransaction[] = JSON.parse(queue);
      
      return {
        queuedCount: transactions.length,
        transactions
      };
    } catch (error) {
      console.error('❌ Error getting queue status:', error);
      return { queuedCount: 0, transactions: [] };
    }
  }

  /**
   * Clear offline queue (for debugging/admin purposes)
   */
  static async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem('offline_transaction_queue');
      console.log('🗑️ Offline transaction queue cleared');
    } catch (error) {
      console.error('❌ Error clearing queue:', error);
    }
  }

  /**
   * Get current connectivity state
   */
  static getCurrentState(): boolean {
    return this.isOnlineState;
  }
}

export default NetworkService;