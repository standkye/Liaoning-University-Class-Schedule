import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

import WeekNavigator from '../components/WeekNavigator';
import TimetableGrid from '../components/TimetableGrid';
import CourseDetailModal from '../components/CourseDetailModal';

import Toast from '../../shared/components/Toast';
import { useCurrentWeek } from '../hooks/useCurrentWeek';
import { useUIStore, setTimetableGridRef } from '../../../stores/useUIStore';
import { useCourseStore } from '../../../stores/useCourseStore';
import { TimetableStackParamList } from '../../../app/navigation/types';
import { WeekDay } from '../../../types/enums';
import { useThemeColors } from '../../../theme/useThemeColors';
import { scheduleAllCourseReminders } from '../../../core/services/notificationService';

type NavigationProp = NativeStackNavigationProp<TimetableStackParamList, 'WeekView'>;

export default function WeekViewScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const navigation = useNavigation<NavigationProp>();
  const { weekLabel, fullDateLabel, monthLabel, goToNextWeek, goToPrevWeek, goToCurrentWeek, activeWeekOffset } = useCurrentWeek();
  const { showCourseForm } = useUIStore();
  const { deleteCourse, getCourseById, courses } = useCourseStore();

  // Detail modal state
  const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
  const detailCourse = detailCourseId ? getCourseById(detailCourseId) ?? null : null;

  // All slots for the same courseCode
  const detailSlots = useMemo(() => {
    if (!detailCourse) return [];
    return courses.filter(c => c.courseCode === detailCourse.courseCode);
  }, [detailCourse, courses]);

  // Schedule notification reminders when courses change
  useEffect(() => {
    scheduleAllCourseReminders(courses).catch(() => {});
  }, [courses]);

  // Capture grid ref for image export
  const gridRefCallback = useCallback((view: any) => {
    if (view) setTimetableGridRef(view);
  }, []);

  const handleCoursePress = useCallback((courseId: string) => {
    setDetailCourseId(courseId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailCourseId(null);
  }, []);

  const handleEditFromDetail = useCallback((courseId: string) => {
    setDetailCourseId(null);
    showCourseForm(courseId);
    navigation.navigate('CourseForm', { courseId });
  }, [navigation, showCourseForm]);

  const handleDeleteFromDetail = useCallback((courseId: string) => {
    setDetailCourseId(null);
    deleteCourse(courseId);
  }, [deleteCourse]);

  const handleEmptySlotPress = useCallback(
    (day: number, startTime: string) => {
      navigation.navigate('CourseForm', {
        prefill: { weekday: day as WeekDay, startTime },
      });
    },
    [navigation],
  );

  // Swipe gesture for week navigation
  const contentOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);

  const triggerNext = () => {
    contentOpacity.value = withTiming(0.4, { duration: 150 }, () => {
      runOnJS(goToNextWeek)();
      contentScale.value = 0.95;
      contentOpacity.value = withTiming(1, { duration: 200 });
      contentScale.value = withTiming(1, { duration: 200 });
    });
  };

  const triggerPrev = () => {
    contentOpacity.value = withTiming(0.4, { duration: 150 }, () => {
      runOnJS(goToPrevWeek)();
      contentScale.value = 0.95;
      contentOpacity.value = withTiming(1, { duration: 200 });
      contentScale.value = withTiming(1, { duration: 200 });
    });
  };

  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      runOnJS(triggerNext)();
    });

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      runOnJS(triggerPrev)();
    });

  const swipeGesture = Gesture.Race(swipeLeft, swipeRight);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, paddingTop: insets.top }]}>
      <GestureDetector gesture={swipeGesture}>
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          <WeekNavigator
            weekLabel={weekLabel}
            fullDateLabel={fullDateLabel}
            onPrev={goToPrevWeek}
            onNext={goToNextWeek}
            onToday={goToCurrentWeek}
            activeWeekOffset={activeWeekOffset}
          />

          <TimetableGrid
            onCoursePress={handleCoursePress}
            onCourseLongPress={handleCoursePress}
            onEmptySlotPress={handleEmptySlotPress}
          />
        </Animated.View>
      </GestureDetector>


      {/* Detail modal — translucent glass card */}
      <CourseDetailModal
        visible={!!detailCourse}
        course={detailCourse}
        allSlots={detailSlots}
        onClose={handleCloseDetail}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

});
