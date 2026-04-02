import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import * as OutlineIcons from 'react-native-heroicons/outline';
import * as SolidIcons from 'react-native-heroicons/solid';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import BusinessListScreen from '../screens/customer/BusinessListScreen';
import BusinessDetailScreen from '../screens/customer/BusinessDetailScreen';
import MyAppointmentsScreen from '../screens/customer/MyAppointmentsScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminServicesScreen from '../screens/admin/AdminServicesScreen';
import AdminStaffScreen from '../screens/admin/AdminStaffScreen';
import AdminAppointmentsScreen from '../screens/admin/AdminAppointmentsScreen';

// Staff Screens
import StaffDashboardScreen from '../screens/staff/StaffDashboardScreen';

// Super Admin Screens
import SuperAdminDashboardScreen from '../screens/super-admin/SuperAdminDashboardScreen';
import SuperAdminBusinessesScreen from '../screens/super-admin/SuperAdminBusinessesScreen';
import SuperAdminUsersScreen from '../screens/super-admin/SuperAdminUsersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let IconComponent;
        if (route.name === 'Browse') {
          IconComponent = focused ? SolidIcons.MagnifyingGlassIcon : OutlineIcons.MagnifyingGlassIcon;
        } else if (route.name === 'MyAppointments') {
          IconComponent = focused ? SolidIcons.CalendarIcon : OutlineIcons.CalendarIcon;
        }
        return IconComponent ? <IconComponent size={size} color={color} /> : null;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Browse" component={BusinessListScreen} options={{ title: 'Browse' }} />
    <Tab.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ title: 'My Appointments' }} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let IconComponent;
        if (route.name === 'Dashboard') {
          IconComponent = focused ? SolidIcons.Squares2X2Icon : OutlineIcons.Squares2X2Icon;
        } else if (route.name === 'Services') {
          IconComponent = focused ? SolidIcons.ScissorsIcon : OutlineIcons.ScissorsIcon;
        } else if (route.name === 'Staff') {
          IconComponent = focused ? SolidIcons.UsersIcon : OutlineIcons.UsersIcon;
        } else if (route.name === 'Appointments') {
          IconComponent = focused ? SolidIcons.CalendarIcon : OutlineIcons.CalendarIcon;
        }
        return IconComponent ? <IconComponent size={size} color={color} /> : null;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="Services" component={AdminServicesScreen} />
    <Tab.Screen name="Staff" component={AdminStaffScreen} />
    <Tab.Screen name="Appointments" component={AdminAppointmentsScreen} />
  </Tab.Navigator>
);

const StaffTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let IconComponent;
        if (route.name === 'Dashboard') {
          IconComponent = focused ? SolidIcons.ListBulletIcon : OutlineIcons.ListBulletIcon;
        }
        return IconComponent ? <IconComponent size={size} color={color} /> : null;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={StaffDashboardScreen} options={{ title: 'My Schedule' }} />
  </Tab.Navigator>
);

const SuperAdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let IconComponent;
        if (route.name === 'Dashboard') {
          IconComponent = focused ? SolidIcons.ChartBarSquareIcon : OutlineIcons.ChartBarSquareIcon;
        } else if (route.name === 'Businesses') {
          IconComponent = focused ? SolidIcons.BuildingOfficeIcon : OutlineIcons.BuildingOfficeIcon;
        } else if (route.name === 'Users') {
          IconComponent = focused ? SolidIcons.UsersIcon : OutlineIcons.UsersIcon;
        }
        return IconComponent ? <IconComponent size={size} color={color} /> : null;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={SuperAdminDashboardScreen} />
    <Tab.Screen name="Businesses" component={SuperAdminBusinessesScreen} />
    <Tab.Screen name="Users" component={SuperAdminUsersScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main">
              {() => {
                switch (user.role) {
                  case 'CUSTOMER':
                    return <CustomerTabs />;
                  case 'ADMIN':
                    return <AdminTabs />;
                  case 'STAFF':
                    return <StaffTabs />;
                  case 'SUPER_ADMIN':
                    return <SuperAdminTabs />;
                  default:
                    return <CustomerTabs />;
                }
              }}
            </Stack.Screen>
            <Stack.Screen name="BusinessDetail" component={BusinessDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
