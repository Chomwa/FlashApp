import React from 'react';
import { Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import QRScannerScreen from '../screens/main/QRScannerScreen';
import MyQRScreen from '../screens/main/MyQRScreen';
import ActivityScreen from '../screens/main/ActivityScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SendMoneyScreen from '../screens/main/SendMoneyScreen';
import RequestMoneyScreen from '../screens/main/RequestMoneyScreen';
import ApprovalScreen from '../screens/main/ApprovalScreen';
import ReceiptScreen from '../screens/main/ReceiptScreen';
import TransactionDetailsScreen from '../screens/main/TransactionDetailsScreen';
import RequestTrackingScreen from '../screens/main/RequestTrackingScreen';
import RequestReviewScreen from '../screens/main/RequestReviewScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import SecuritySettingsScreen from '../screens/main/SecuritySettingsScreen';
import InviteProgramScreen from '../screens/main/InviteProgramScreen';

// Auth screens
import OnboardingPhoneScreen from '../screens/auth/OnboardingPhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Clean professional icons
const HomeIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 20,
      height: 18,
      borderWidth: 2,
      borderColor: color,
      borderBottomWidth: 0,
      backgroundColor: focused ? color : 'transparent',
    }} />
    <View style={{
      width: 16,
      height: 2,
      backgroundColor: color,
      marginTop: -2,
    }} />
    <View style={{
      width: 4,
      height: 8,
      backgroundColor: focused ? '#02121B' : color,
      marginTop: -10,
    }} />
  </View>
);

const ScanIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: color,
      backgroundColor: focused ? `${color}20` : 'transparent',
    }}>
      <View style={{
        width: 12,
        height: 12,
        borderWidth: 2,
        borderColor: color,
        margin: 2,
        backgroundColor: focused ? color : 'transparent',
      }} />
    </View>
  </View>
);

const QRIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: color,
      backgroundColor: focused ? `${color}20` : 'transparent',
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 2,
    }}>
      {[...Array(9)].map((_, i) => (
        <View
          key={i}
          style={{
            width: 4,
            height: 4,
            backgroundColor: color,
            margin: 0.5,
          }}
        />
      ))}
    </View>
  </View>
);

const ActivityIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 18 }}>
      <View style={{ width: 3, height: 8, backgroundColor: color, marginRight: 2 }} />
      <View style={{ width: 3, height: 12, backgroundColor: color, marginRight: 2 }} />
      <View style={{ width: 3, height: 16, backgroundColor: color, marginRight: 2 }} />
      <View style={{ width: 3, height: 10, backgroundColor: color }} />
    </View>
  </View>
);

const ProfileIcon = ({ focused, color }: { focused: boolean; color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: color,
      backgroundColor: focused ? color : 'transparent',
      marginBottom: 2,
    }} />
    <View style={{
      width: 16,
      height: 10,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderWidth: 2,
      borderColor: color,
      backgroundColor: focused ? color : 'transparent',
    }} />
  </View>
);

// Custom theme for dark mode
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#02121B',
    card: '#02121B', 
    text: '#FFFFFF',
    border: '#1A2B36',
    primary: '#00B15C'
  }
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#02121B',
          borderTopColor: '#1A2B36',
          borderTopWidth: 1,
          height: 85,
          paddingTop: 10,
          paddingBottom: 25,
        },
        tabBarActiveTintColor: '#00B15C',
        tabBarInactiveTintColor: '#6F8A9A',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => <HomeIcon focused={focused} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Scan" 
        component={QRScannerScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ focused, color }) => <ScanIcon focused={focused} color={color} />,
        }}
      />
      <Tab.Screen 
        name="MyQR" 
        component={MyQRScreen}
        options={{
          tabBarLabel: 'My QR',
          tabBarIcon: ({ focused, color }) => <QRIcon focused={focused} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Activity" 
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Activity',
          tabBarIcon: ({ focused, color }) => <ActivityIcon focused={focused} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => <ProfileIcon focused={focused} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  
  if (loading) {
    console.log('🧭 AppNavigator - Loading auth state...');
    return null; // Or a loading screen
  }
  
  console.log('🧭 AppNavigator - User auth status:', user ? `Authenticated (${user.phone_number})` : 'Not authenticated');
  
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#02121B',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {user ? (
          // Authenticated User Screens
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            
            {/* Modal Screens */}
            <Stack.Screen 
              name="SendMoney" 
              component={SendMoneyScreen}
              options={{ 
                title: 'Send Money',
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="RequestMoney" 
              component={RequestMoneyScreen}
              options={{ 
                title: 'Request Money',
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="Approval" 
              component={ApprovalScreen}
              options={{ 
                title: 'Approve in MTN',
                presentation: 'modal',
                gestureEnabled: false
              }}
            />
            <Stack.Screen 
              name="Receipt" 
              component={ReceiptScreen}
              options={{ 
                title: 'Receipt',
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="TransactionDetails" 
              component={TransactionDetailsScreen}
              options={{ 
                title: 'Transaction Details',
                presentation: 'card'
              }}
            />
            <Stack.Screen 
              name="RequestReview" 
              component={RequestReviewScreen}
              options={{ 
                title: 'Review Request',
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="RequestTracking" 
              component={RequestTrackingScreen}
              options={{ 
                title: 'Request Tracking',
                presentation: 'modal'
              }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen}
              options={{ 
                title: 'Edit Profile',
                presentation: 'card'
              }}
            />
            <Stack.Screen 
              name="SecuritySettings" 
              component={SecuritySettingsScreen}
              options={{ 
                title: 'Security Settings',
                presentation: 'card'
              }}
            />
            <Stack.Screen 
              name="InviteProgram" 
              component={InviteProgramScreen}
              options={{ 
                title: 'Exclusive Invites',
                presentation: 'card'
              }}
            />
          </>
        ) : (
          // Authentication Flow Screens
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={require('../screens/auth/RegisterScreen').default}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="OTP" 
              component={OTPScreen}
              options={{ title: 'Verify Phone' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}