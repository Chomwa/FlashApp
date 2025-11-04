import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authAPI} from '../services/api';

interface User {
  id: string;
  phone_number: string;
  full_name: string;
  avatar?: string;
  is_phone_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);
  
  // Log user state changes for debugging
  useEffect(() => {
    console.log('🔐 AuthContext - User state changed:', user ? `${user.full_name} (${user.phone_number})` : 'null');
  }, [user]);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔍 AuthContext loadUser - Token found:', token ? 'Yes' : 'No');
      
      if (token) {
        // In development, create a mock user if we have a token
        if (__DEV__) {
          const mockUser: User = {
            id: 'dev-user',
            phone_number: '+260977999888',
            full_name: 'OTP Test User',
            is_phone_verified: true
          };
          setUser(mockUser);
          console.log('✅ Loaded mock user for development:', mockUser);
        } else {
          // In production, try to get real user data
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          console.log('✅ Loaded user from API:', userData);
        }
      } else {
        console.log('ℹ️ No auth token found - user remains null');
      }
    } catch (error) {
      console.log('❌ Error loading user:', error);
      // Don't remove token in development, might be a network issue
      if (!__DEV__) {
        await AsyncStorage.removeItem('auth_token');
      }
    } finally {
      setLoading(false);
      console.log('✅ AuthContext loading complete');
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await authAPI.login(phone, password);
      await AsyncStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (phone: string, password: string, fullName: string, otpCode?: string) => {
    try {
      const response = await authAPI.register(phone, password, fullName, otpCode);
      await AsyncStorage.setItem('auth_token', response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First clear the user state to prevent further API calls
      console.log('🔐 Starting logout process...');
      setUser(null);
      console.log('🔐 User state cleared - should trigger navigation change');
      
      // Try to call logout API, but don't fail if it doesn't work
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        try {
          await authAPI.logout();
          console.log('✅ Logout API call successful');
        } catch (apiError) {
          console.log('⚠️ Logout API error (token may be invalid):', apiError.message);
          // Continue with cleanup even if API call fails
        }
      }
    } catch (error) {
      console.log('⚠️ General logout error (but continuing):', error.message);
      // Don't throw error, just log it
    } finally {
      // Always remove the token regardless of API call success
      await AsyncStorage.removeItem('auth_token');
      console.log('✅ Auth token removed from storage - logout complete');
      
      // Ensure user state is null after logout
      setUser(null);
      console.log('🔐 Final user state clear - navigation should show auth screens');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      // Update existing user data
      setUser({...user, ...userData});
      console.log('✅ Updated existing user in context:', userData);
    } else {
      // Set new user (for OTP verification)
      setUser(userData as User);
      console.log('✅ Set new user in context:', userData);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};