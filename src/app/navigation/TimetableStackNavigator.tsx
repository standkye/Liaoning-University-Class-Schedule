import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TimetableStackParamList } from './types';
import WeekViewScreen from '../../features/timetable/screens/WeekViewScreen';
import CourseFormScreen from '../../features/courses/screens/CourseFormScreen';

const Stack = createNativeStackNavigator<TimetableStackParamList>();

export default function TimetableStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen name="WeekView" component={WeekViewScreen} />
      <Stack.Screen
        name="CourseForm"
        component={CourseFormScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
