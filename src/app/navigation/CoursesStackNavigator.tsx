import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CoursesStackParamList } from './types';
import CourseListScreen from '../../features/courses/screens/CourseListScreen';
import CourseFormScreen from '../../features/courses/screens/CourseFormScreen';

const Stack = createNativeStackNavigator<CoursesStackParamList>();

export default function CoursesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen name="CourseList" component={CourseListScreen} />
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
