declare module 'react-native-config' {
  export interface NativeConfig {
    API_URL?: string;
    MTN_SANDBOX_MODE?: string;
    DEBUG_MODE?: string;
    ENVIRONMENT?: string;
    SENTRY_DSN?: string;
    ANALYTICS_ENABLED?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}