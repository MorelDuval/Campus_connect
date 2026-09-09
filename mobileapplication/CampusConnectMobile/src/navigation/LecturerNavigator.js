import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/globalStyles';
import DashboardScreen from '../screens/Lecturer/DashboardScreen';
import MyCoursesScreen from '../screens/Lecturer/MyCoursesScreen';
import GradeEntryScreen from '../screens/Lecturer/GradeEntryScreen';
import AttendanceScreen from '../screens/Lecturer/AttendanceScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const LecturerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Courses: focused ? 'book' : 'book-outline',
          Attendance: focused ? 'checkbox' : 'checkbox-outline',
        };
        return <Icon name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
    })}
  >
    <Tab.Screen name="Home" component={DashboardScreen} />
    <Tab.Screen name="Courses" component={MyCoursesScreen} />
    <Tab.Screen name="Attendance" component={AttendanceScreen} />
  </Tab.Navigator>
);

const LecturerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LecturerTabs" component={LecturerTabs} />
    <Stack.Screen name="Grades" component={GradeEntryScreen} />
  </Stack.Navigator>
);

export default LecturerNavigator;