import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/main/HomeScreen';
import TransactionsScreen from '../screens/main/TransactionsScreen';
import ContactsScreen from '../screens/main/ContactsScreen';
import RequestsScreen from '../screens/main/RequestsScreen';
import RequestTrackingScreen from '../screens/main/RequestTrackingScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SendMoneyScreen from '../screens/main/SendMoneyScreen';
import ReceiveMoneyScreen from '../screens/main/ReceiveMoneyScreen';
import QRScannerScreen from '../screens/main/QRScannerScreen';
import TransactionDetailsScreen from '../screens/main/TransactionDetailsScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import AddContactScreen from '../screens/main/AddContactScreen';

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Requests: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  SendMoney: {
    contact?: {name: string; phone: string};
    recipient?: {name: string; phone: string};
    prefilledAmount?: string;
    prefilledMessage?: string;
  };
  ReceiveMoney: undefined;
  QRScanner: undefined;
  TransactionDetails: {transactionId: string};
  RequestTracking: {
    requestId: string;
    transactionId: string;
    amount: string;
    recipientName: string;
    recipientPhone: string;
    qrCode?: string;
  };
  EditProfile: undefined;
  AddContact: undefined;
  Contacts: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Transactions':
              iconName = 'receipt';
              break;
            case 'Requests':
              iconName = 'request-page';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SendMoney"
        component={SendMoneyScreen}
        options={{title: 'Send Money'}}
      />
      <Stack.Screen
        name="ReceiveMoney"
        component={ReceiveMoneyScreen}
        options={{title: 'Receive Money'}}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{title: 'Scan QR Code'}}
      />
      <Stack.Screen
        name="TransactionDetails"
        component={TransactionDetailsScreen}
        options={{title: 'Transaction Details'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{title: 'Contacts'}}
      />
      <Stack.Screen
        name="RequestTracking"
        component={RequestTrackingScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default MainStack;