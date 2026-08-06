import React, { useCallback, useMemo, useState, useRef } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore } from '../../../stores/useUIStore';
import { CoursesStackParamList } from '../../../app/navigation/types';
import { Course } from '../../../types/course';
import { useThemeColors } from '../../../theme/useThemeColors';
import CourseCard from '../components/CourseCard';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import EmptyState from '../../shared/components/EmptyState';
import Toast from '../../shared/components/Toast';

type NavigationProp = NativeStackNavigationProp<CoursesStackParamList, 'CourseList'>;

type SortKey = 'name' | 'weekday' | 'category';

interface CourseGroup {
  courseCode: string;
  representative: Course;  // First course instance, used for display
  allSlots: Course[];      // All time slots with same courseCode
}

export default function CourseListScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const navigation = useNavigation<NavigationProp>();
  const { courses, getConflictsForCourse } = useCourseStore();
  const { showCourseForm } = useUIStore();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('weekday');

  // Group courses by courseCode so each distinct course appears only once
  const courseGroups = useMemo(() => {
    const map = new Map<string, Course[]>();
    for (const c of courses) {
      const existing = map.get(c.courseCode);
      if (existing) {
        existing.push(c);
      } else {
        map.set(c.courseCode, [c]);
      }
    }
    const groups: CourseGroup[] = [];
    for (const [courseCode, slots] of map) {
      // Sort slots by weekday then startTime
      slots.sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime));
      groups.push({
        courseCode,
        representative: slots[0],
        allSlots: slots,
      });
    }
    return groups;
  }, [courses]);

  const filtered = useMemo(() => {
    let result = [...courseGroups];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.representative.name.toLowerCase().includes(q) ||
        g.representative.instructor.toLowerCase().includes(q) ||
        g.allSlots.some(s => s.location.toLowerCase().includes(q)) ||
        g.representative.category.toLowerCase().includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.representative.name.localeCompare(b.representative.name);
        case 'weekday': {
          const aMin = Math.min(...a.allSlots.map(s => s.weekday));
          const bMin = Math.min(...b.allSlots.map(s => s.weekday));
          return aMin - bMin || a.allSlots[0].startTime.localeCompare(b.allSlots[0].startTime);
        }
        case 'category':
          return a.representative.category.localeCompare(b.representative.category) || a.representative.name.localeCompare(b.representative.name);
        default:
          return 0;
      }
    });

    return result;
  }, [courseGroups, search, sortBy]);

  const handleCoursePress = useCallback(
    (courseId: string) => {
      showCourseForm(courseId);
      navigation.navigate('CourseForm', { courseId });
    },
    [navigation, showCourseForm],
  );

  const handleAddCourse = useCallback(() => {
    navigation.navigate('CourseForm', {});
  }, [navigation]);

  const renderCourseItem = useCallback(
    ({ item, index }: { item: CourseGroup; index: number }) => (
      <CourseCard
        course={item.representative}
        allSlots={item.allSlots}
        onPress={handleCoursePress}
        hasConflict={item.allSlots.some(s => getConflictsForCourse(s).length > 0)}
        index={index}
        theme={theme}
      />
    ),
    [handleCoursePress, getConflictsForCourse],
  );

  const renderHeader = useCallback(() => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.fgRgba04, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            value={search}
            onChangeText={setSearch}
            placeholder="搜索课程..."
            placeholderTextColor={theme.textTertiary}
          />
          {search.length > 0 && (
            <AnimatedPressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={theme.textTertiary} />
            </AnimatedPressable>
          )}
        </View>
      </View>

      {/* Sort Pills */}
      <View style={styles.sortRow}>
        {(['weekday', 'name', 'category'] as SortKey[]).map((key) => (
          <AnimatedPressable
            key={key}
            style={[styles.sortPill, { backgroundColor: theme.fgRgba04, borderColor: theme.border }, sortBy === key && { backgroundColor: theme.accentBg, borderColor: `${theme.accent}40` }]}
            onPress={() => setSortBy(key)}
          >
            <Text style={[{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }, sortBy === key && { color: theme.accent }]}>
              {key === 'weekday' ? '按时间' : key === 'name' ? '按名称' : '按分类'}
            </Text>
          </AnimatedPressable>
        ))}
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <Text style={[styles.countText, { color: theme.textTertiary }]}>
          共 {filtered.length} 门课程
        </Text>
      </View>
    </View>
  ), [search, sortBy, filtered.length, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, paddingTop: insets.top }]}>
      <FlatList
        data={filtered}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.courseCode}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title={search ? '未找到匹配课程' : '还没有课程'}
            subtitle={search ? '试试其他搜索词' : '点击 + 添加你的第一门课程'}
            action={
              !search ? (
                <AnimatedPressable style={styles.addButton} onPress={handleAddCourse}>
                  <Text style={styles.addButtonText}>添加课程</Text>
                </AnimatedPressable>
              ) : undefined
            }
          />
        }
        contentContainerStyle={[filtered.length === 0 && styles.emptyList, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <AnimatedPressable style={[styles.fab, { backgroundColor: theme.accent }]} onPress={handleAddCourse}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </AnimatedPressable>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    paddingHorizontal: 10,
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '500',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 10,
  },
  sortPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },


  countRow: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  countText: {
    color: '#707070',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyList: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 120 : 108,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4A90D9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
});
