import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ToastProps {
  message: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, description, type, visible }) => {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#10B981', iconColor: '#FFFFFF' };
      case 'error':
        return { backgroundColor: '#EF4444', iconColor: '#FFFFFF' };
      case 'warning':
        return { backgroundColor: '#F59E0B', iconColor: '#FFFFFF' };
      case 'info':
        return { backgroundColor: '#3B82F6', iconColor: '#FFFFFF' };
      default:
        return { backgroundColor: '#6B7280', iconColor: '#FFFFFF' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ⓘ';
      default:
        return 'ⓘ';
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: typeStyles.backgroundColor, opacity }
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color: typeStyles.iconColor }]}>
          {getIcon()}
        </Text>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#F3F4F6',
    opacity: 0.9,
  },
});