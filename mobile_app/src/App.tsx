import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from './context/AuthContext';
import ConnectivityBanner from './components/ConnectivityBanner';

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ConnectivityBanner />
        <AppNavigator />
        <FlashMessage position="top" />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;