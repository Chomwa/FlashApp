import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { NetworkService } from '../services/networkService';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ConnectivityBannerProps {
  showQueueCount?: boolean;
}

export const ConnectivityBanner: React.FC<ConnectivityBannerProps> = ({ 
  showQueueCount = true 
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [queuedCount, setQueuedCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initial state check
    setIsOnline(NetworkService.getCurrentState());
    
    // Listen for connectivity changes
    const unsubscribe = NetworkService.addConnectivityListener((online) => {
      setIsOnline(online);
      if (online) {
        // Refresh queue count when coming back online
        updateQueueCount();
      }
    });

    // Start network monitoring
    NetworkService.startNetworkMonitoring();
    
    // Get initial queue count
    updateQueueCount();

    return unsubscribe;
  }, []);

  const updateQueueCount = async () => {
    try {
      const status = await NetworkService.getQueueStatus();
      setQueuedCount(status.queuedCount);
    } catch (error) {
      console.error('Error getting queue status:', error);
    }
  };

  const handleBannerPress = () => {
    if (!isOnline && queuedCount > 0) {
      setShowDetails(!showDetails);
    }
  };

  if (isOnline && queuedCount === 0) {
    // Don't show banner when online and no queued transactions
    return null;
  }

  const getBannerStyle = () => {
    if (!isOnline) {
      return 'bg-orange-500/90 border-orange-400/50';
    } else if (queuedCount > 0) {
      return 'bg-blue-500/90 border-blue-400/50';
    }
    return 'bg-green-500/90 border-green-400/50';
  };

  const getBannerText = () => {
    if (!isOnline) {
      return '📱 Offline - Transactions will be queued';
    } else if (queuedCount > 0) {
      return `🔄 Processing ${queuedCount} queued transaction${queuedCount > 1 ? 's' : ''}`;
    }
    return '📶 Online';
  };

  const getIcon = () => {
    if (!isOnline) return '📱';
    if (queuedCount > 0) return '🔄';
    return '📶';
  };

  return (
    <StyledView className="relative">
      <StyledTouchableOpacity
        onPress={handleBannerPress}
        className={`mx-4 mt-2 mb-1 p-3 rounded-2xl border ${getBannerStyle()}`}
        disabled={isOnline && queuedCount === 0}
      >
        <StyledView className="flex-row items-center justify-center">
          <StyledText className="text-white text-center font-light text-sm">
            {getIcon()} {getBannerText()}
          </StyledText>
          
          {!isOnline && queuedCount > 0 && (
            <StyledView className="ml-3 bg-white/20 px-2 py-1 rounded-full">
              <StyledText className="text-white text-xs font-bold">
                {queuedCount}
              </StyledText>
            </StyledView>
          )}
          
          {(!isOnline && queuedCount > 0) && (
            <StyledText className="text-white/80 ml-2 text-xs">
              {showDetails ? '▲' : '▼'}
            </StyledText>
          )}
        </StyledView>
      </StyledTouchableOpacity>

      {/* Expandable Details */}
      {showDetails && !isOnline && queuedCount > 0 && (
        <StyledView className="mx-4 mb-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
          <StyledText className="text-white/80 text-sm font-light mb-2">
            📋 Queued Transactions:
          </StyledText>
          <StyledText className="text-white/60 text-xs font-light mb-3">
            • {queuedCount} payment{queuedCount > 1 ? 's' : ''} waiting to be processed
          </StyledText>
          <StyledText className="text-white/60 text-xs font-light mb-3">
            • Will automatically send when internet returns
          </StyledText>
          <StyledText className="text-white/60 text-xs font-light">
            • Recipients will receive MTN prompts once processed
          </StyledText>
          
          <StyledView className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <StyledText className="text-amber-400 text-xs font-light text-center">
              💡 Your transactions are safe and will be sent automatically
            </StyledText>
          </StyledView>
        </StyledView>
      )}
    </StyledView>
  );
};

export default ConnectivityBanner;