import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TimetableStackNavigator from './TimetableStackNavigator';
import CoursesStackNavigator from './CoursesStackNavigator';
import TodayScreen from '../../features/schedule/screens/TodayScreen';
import SettingsScreen from '../../features/settings/screens/SettingsScreen';
import AnimatedTabBar from './AnimatedTabBar';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TimetableTab"
        component={TimetableStackNavigator}
        options={{ tabBarLabel: '课表' }}
      />
      <Tab.Screen
        name="ScheduleTab"
        component={TodayScreen}
        options={{ tabBarLabel: '日程' }}
      />
      <Tab.Screen
        name="CoursesTab"
        component={CoursesStackNavigator}
        options={{ tabBarLabel: '课程' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ tabBarLabel: '设置' }}
      />
    </Tab.Navigator>
  );
}
