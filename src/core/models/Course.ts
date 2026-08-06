import { randomUUID } from '../utils/idUtils';
import { Course, CourseFormData } from '../../types/course';
import { WeekDay } from '../../types/enums';
import { COLORS, CATEGORIES, DEFAULT_SETTINGS } from '../constants/defaults';

export function createCourse(data: Partial<CourseFormData> & { name: string; weekday: WeekDay; startTime: string; endTime: string }): Course {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    courseCode: data.courseCode ?? '',
    name: data.name,
    instructor: data.instructor ?? '',
    location: data.location ?? '',
    color: data.color ?? COLORS.defaultCourseColor,
    category: data.category ?? CATEGORIES.defaultCategory,
    courseType: data.courseType ?? '',
    credits: data.credits ?? 0,
    examType: data.examType ?? '',
    weekday: data.weekday,
    startTime: data.startTime,
    endTime: data.endTime,
    notes: data.notes ?? '',
    weeks: data.weeks ?? [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCourseTimestamp(course: Course): Course {
  return {
    ...course,
    updatedAt: new Date().toISOString(),
  };
}
