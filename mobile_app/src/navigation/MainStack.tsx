import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/main/HomeScreen';
import TransactionsScreen from '../screens/main/TransactionsScreen';
import ContactsScreen from '../screens/main/ContactsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SendMoneyScreen from '../screens/main/SendMoneyScreen';
import ReceiveMoneyScreen from '../screens/main/ReceiveMoneyScreen';
import QRScannerScreen from '../screens/main/QRScannerScreen';
import TransactionDetailsScreen from '../screens/main/TransactionDetailsScreen';

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Contacts: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  SendMoney: {contact?: {name: string; phone: string}};
  ReceiveMoney: undefined;
  QRScanner: undefined;
  TransactionDetails: {transactionId: string};
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
            case 'Contacts':
              iconName = 'contacts';
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
      <Tab.Screen name="Contacts" component={ContactsScreen} />
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
    </Stack.Navigator>
  );
};

export default MainStack;