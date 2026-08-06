export type RootTabParamList = {
  TimetableTab: undefined;
  ScheduleTab: undefined;
  CoursesTab: undefined;
  SettingsTab: undefined;
};

export type TimetableStackParamList = {
  WeekView: undefined;
  CourseForm: { courseId?: string; prefill?: Partial<PrefillData> };
};

export type CoursesStackParamList = {
  CourseList: undefined;
  CourseForm: { courseId?: string };
};

export interface PrefillData {
  weekday: number;
  startTime: string;
}
