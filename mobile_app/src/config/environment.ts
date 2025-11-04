import { Platform } from 'react-native';
import Config from 'react-native-config';

interface Environment {
  API_BASE_URL: string;
  MTN_SANDBOX_MODE: boolean;
  DEBUG_MODE: boolean;
  ENVIRONMENT: string;
  SENTRY_DSN?: string;
  ANALYTICS_ENABLED: boolean;
}

const isDevelopment = __DEV__;

/**
 * Get the appropriate API base URL for different environments and platforms
 */
const getApiBaseUrl = (): string => {
  // First priority: Use environment variable from build config
  if (Config.API_URL) {
    console.log(`🔧 Using config API_URL: ${Config.API_URL}`);
    return Config.API_URL;
  }

  // Second priority: Use build-time environment detection
  if (!isDevelopment) {
    const productionUrl = 'https://api.flashapp.com/api'; // TODO: Replace with actual domain
    console.warn(`⚠️ Using placeholder production URL: ${productionUrl}`);
    console.warn('🚨 PRODUCTION WILL FAIL - Update this URL before deploying!');
    return productionUrl;
  }

  // Development fallback - platform-specific URLs
  if (Platform.OS === 'ios') {
    console.log('📱 iOS Development: Using 127.0.0.1:8002');
    return 'http://127.0.0.1:8002/api';
  } else {
    console.log('🤖 Android Development: Using localhost:8002 (requires adb reverse)');
    console.log('💡 Run: adb reverse tcp:8002 tcp:8002');
    return 'http://localhost:8002/api';
  }
};

/**
 * Get boolean value from string config
 */
const getBooleanConfig = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

// Create environment configuration from react-native-config
const createEnvironmentConfig = (): Environment => {
  return {
    API_BASE_URL: getApiBaseUrl(),
    MTN_SANDBOX_MODE: getBooleanConfig(Config.MTN_SANDBOX_MODE, isDevelopment),
    DEBUG_MODE: getBooleanConfig(Config.DEBUG_MODE, isDevelopment),
    ENVIRONMENT: Config.ENVIRONMENT || (isDevelopment ? 'development' : 'production'),
    SENTRY_DSN: Config.SENTRY_DSN,
    ANALYTICS_ENABLED: getBooleanConfig(Config.ANALYTICS_ENABLED, !isDevelopment),
  };
};

// Export the configuration
export const config: Environment = createEnvironmentConfig();

// Utility functions
export const getApiUrl = (endpoint: string = ''): string => {
  return `${config.API_BASE_URL}${endpoint}`;
};

export const isDebugMode = (): boolean => {
  return config.DEBUG_MODE;
};

export const isSandboxMode = (): boolean => {
  return config.MTN_SANDBOX_MODE;
};

export default config;