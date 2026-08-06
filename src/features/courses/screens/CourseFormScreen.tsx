import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import CourseForm from '../components/CourseForm';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore } from '../../../stores/useUIStore';
import { TimetableStackParamList } from '../../../app/navigation/types';
import { useThemeColors } from '../../../theme/useThemeColors';

type FormRoute = RouteProp<TimetableStackParamList, 'CourseForm'>;

export default function CourseFormScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const navigation = useNavigation();
  const route = useRoute<FormRoute>();
  const { courseId, prefill } = route.params ?? {};

  const { getCourseById, deleteCourse } = useCourseStore();
  const { showToast } = useUIStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const existingCourse = courseId ? getCourseById(courseId) : undefined;

  const handleSave = useCallback(() => {
    showToast(courseId ? '课程已更新！' : '课程已添加！', 'success');
    navigation.goBack();
  }, [courseId, navigation, showToast]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDelete = useCallback(() => {
    if (courseId) {
      deleteCourse(courseId);
      showToast('课程已删除', 'info');
      setShowDeleteConfirm(false);
      navigation.goBack();
    }
  }, [courseId, deleteCourse, navigation, showToast]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <AnimatedPressable onPress={handleCancel} style={[styles.headerButton, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
          <Ionicons name="close" size={24} color={theme.textSecondary} />
        </AnimatedPressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {courseId ? '编辑课程' : '新增课程'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <CourseForm
        existingCourse={existingCourse}
        prefillDay={prefill?.weekday}
        prefillStartTime={prefill?.startTime}
        startEditing={!!courseId}
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={courseId ? () => setShowDeleteConfirm(true) : undefined}
      />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="删除课程"
        message="确定要删除这门课程吗？此操作不可撤销。"
        confirmLabel="删除"
        confirmDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  headerButton: { width: 40, height: 40, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
});
