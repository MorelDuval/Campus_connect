import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../styles/globalStyles';

import DashboardScreen from '../screens/Student/DashboardScreen';
import CoursesScreen from '../screens/Student/CoursesScreen';
import RegistrationScreen from '../screens/Student/RegistrationScreen';
import TimetableScreen from '../screens/Student/TimetableScreen';
import AssignmentsScreen from '../screens/Student/AssignmentsScreen';
import GradesScreen from '../screens/Student/GradesScreen';
import FeesScreen from '../screens/Student/FeesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Courses: focused ? 'book' : 'book-outline',
          Timetable: focused ? 'calendar' : 'calendar-outline',
          Assignments: focused ? 'document-text' : 'document-text-outline',
          Grades: focused ? 'stats-chart' : 'stats-chart-outline',
        };
        return <Icon name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={DashboardScreen} />
    <Tab.Screen name="Courses" component={CoursesScreen} />
    <Tab.Screen name="Timetable" component={TimetableScreen} />
    <Tab.Screen name="Assignments" component={AssignmentsScreen} />
    <Tab.Screen name="Grades" component={GradesScreen} />
  </Tab.Navigator>
);

const StudentNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="StudentTabs" component={StudentTabs} />
    <Stack.Screen name="Registration" component={RegistrationScreen} />
    <Stack.Screen name="Fees" component={FeesScreen} />
  </Stack.Navigator>
);

export default StudentNavigator;