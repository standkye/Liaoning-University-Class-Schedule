import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course, CourseFormData, CourseWithPosition } from '../types/course';
import { WeekDay } from '../types/enums';
import { createCourse, updateCourseTimestamp } from '../core/models/Course';
import { timesOverlap } from '../core/utils/timeUtils';
import { STORAGE_KEYS } from '../core/constants/defaults';
import { getDemoCourses } from '../core/services/demoData';

interface CourseState {
  courses: Course[];

  // Actions
  addCourse: (data: CourseFormData) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCourseById: (id: string) => Course | undefined;
  getCoursesByWeekday: (day: WeekDay) => Course[];
  findConflicts: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>, excludeId?: string) => string[];
  importCourses: (courses: Course[]) => void;
  exportCourses: () => Course[];
  clearAllCourses: () => void;
  getConflictsForCourse: (course: Course) => string[];
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: getDemoCourses(),

      addCourse: (data: CourseFormData) => {
        const course = createCourse(data);
        set(state => ({ courses: [...state.courses, course] }));
        return course;
      },

      updateCourse: (id: string, updates: Partial<Course>) => {
        set(state => ({
          courses: state.courses.map(c =>
            c.id === id
              ? updateCourseTimestamp({ ...c, ...updates })
              : c,
          ),
        }));
      },

      deleteCourse: (id: string) => {
        set(state => ({
          courses: state.courses.filter(c => c.id !== id),
        }));
      },

      getCourseById: (id: string) => {
        return get().courses.find(c => c.id === id);
      },

      getCoursesByWeekday: (day: WeekDay) => {
        return get().courses.filter(c => c.weekday === day);
      },

      findConflicts: (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>, excludeId?: string) => {
        const { courses } = get();
        return courses
          .filter(c => {
            if (excludeId && c.id === excludeId) return false;
            if (c.weekday !== course.weekday) return false;
            // Check week overlap
            const courseWeeks = course.weeks ?? [];
            const existingWeeks = c.weeks;
            if (courseWeeks.length > 0 && existingWeeks.length > 0) {
              const hasWeekOverlap = courseWeeks.some(w => existingWeeks.includes(w));
              if (!hasWeekOverlap) return false;
            }
            return timesOverlap(course.startTime, course.endTime, c.startTime, c.endTime);
          })
          .map(c => c.id);
      },

      importCourses: (courses: Course[]) => {
        const imported = courses.map(c => ({
          ...c,
          createdAt: c.createdAt || new Date().toISOString(),
          updatedAt: c.updatedAt || new Date().toISOString(),
        }));
        set({ courses: imported });
      },

      exportCourses: () => {
        return get().courses;
      },

      clearAllCourses: () => {
        set({ courses: [] });
      },

      getConflictsForCourse: (course: Course) => {
        return get().findConflicts(course, course.id);
      },
    }),
    {
      name: STORAGE_KEYS.COURSES,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ courses: state.courses }),
      version: 1,
    },
  ),
);
