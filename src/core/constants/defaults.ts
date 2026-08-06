import { courseColorPresets, courseCategoryDefaults } from '../../theme/palette';
import { DEFAULT_TIME_RANGE_START, DEFAULT_TIME_RANGE_END, DEFAULT_COURSE_DURATION } from './layout';
import { WeekDay, ColorScheme, GridDensity } from '../../types/enums';
import { TOTAL_PERIODS } from '../services/tsvParserService';

export const DEFAULT_SETTINGS = {
  colorScheme: ColorScheme.DARK,
  firstDayOfWeek: WeekDay.MONDAY,
  timeRangeStart: DEFAULT_TIME_RANGE_START,
  timeRangeEnd: DEFAULT_TIME_RANGE_END,
  showWeekends: true,  // 7天课表
  gridDensity: GridDensity.COMFORTABLE,
  defaultCourseDuration: DEFAULT_COURSE_DURATION,
  semesterStartDate: '2026-02-23', // 默认学期起始日
} as const;

export const COLORS = {
  presets: courseColorPresets,
  defaultCourseColor: courseColorPresets[0],
} as const;

export const CATEGORIES = {
  defaults: courseCategoryDefaults,
  defaultCategory: courseCategoryDefaults[0],
} as const;

export const DAY_LABELS: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: '一',
  [WeekDay.TUESDAY]: '二',
  [WeekDay.WEDNESDAY]: '三',
  [WeekDay.THURSDAY]: '四',
  [WeekDay.FRIDAY]: '五',
  [WeekDay.SATURDAY]: '六',
  [WeekDay.SUNDAY]: '日',
};

export const DAY_LABELS_FULL: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: '周一',
  [WeekDay.TUESDAY]: '周二',
  [WeekDay.WEDNESDAY]: '周三',
  [WeekDay.THURSDAY]: '周四',
  [WeekDay.FRIDAY]: '周五',
  [WeekDay.SATURDAY]: '周六',
  [WeekDay.SUNDAY]: '周日',
};

export const CATEGORY_LABELS: Record<string, string> = {
  'Lecture': '讲座',
  'Lab': '实验',
  'Tutorial': '辅导',
  'Seminar': '研讨',
  'Workshop': '工作坊',
  'Exam': '考试',
};

export const STORAGE_KEYS = {
  COURSES: 'course-schedule-courses',
  SETTINGS: 'course-schedule-settings',
} as const;
