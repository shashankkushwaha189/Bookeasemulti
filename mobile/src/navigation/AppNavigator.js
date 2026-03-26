import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

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
        let iconName;
        if (route.name === 'Browse') {
          iconName = focused ? 'search' : 'search-outline';
        } else if (route.name === 'MyAppointments') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
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
        let iconName;
        if (route.name === 'Dashboard') {
          iconName = focused ? 'grid' : 'grid-outline';
        } else if (route.name === 'Services') {
          iconName = focused ? 'cut' : 'cut-outline';
        } else if (route.name === 'Staff') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Appointments') {
          iconName = focused ? 'calendar' : 'calendar-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
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
        let iconName;
        if (route.name === 'Dashboard') {
          iconName = focused ? 'list' : 'list-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
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
        let iconName;
        if (route.name === 'Dashboard') {
          iconName = focused ? 'stats-chart' : 'stats-chart-outline';
        } else if (route.name === 'Businesses') {
          iconName = focused ? 'business' : 'business-outline';
        } else if (route.name === 'Users') {
          iconName = focused ? 'people' : 'people-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
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
