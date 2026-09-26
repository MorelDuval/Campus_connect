import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/globalStyles';
import DashboardScreen from '../screens/Admin/AdminDashboardScreen';
import UserManagementScreen from '../screens/Admin/UserManagementScreen';
import ReportsScreen from '../screens/Admin/ReportsScreen';
import ManageUsersScreen from '../screens/Admin/ManageUsersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? 'speedometer' : 'speedometer-outline',
          Users: focused ? 'people' : 'people-outline',
          Reports: focused ? 'bar-chart' : 'bar-chart-outline',
        };
        return <Icon name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Users" component={UserManagementScreen} />
    <Tab.Screen name="Reports" component={ReportsScreen} />
  </Tab.Navigator>
);

const AdminNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
  </Stack.Navigator>
);

export default AdminNavigator;