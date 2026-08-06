import { WeekDay } from './enums';

export interface Course {
  id: string;
  courseCode: string;    // 课程编号 e.g., "1020446"
  name: string;          // 课程名称
  instructor: string;    // 教师
  location: string;      // 上课地点
  color: string;         // 颜色
  category: string;      // 课程类别 e.g., "学科核心课"
  courseType: string;    // 必修/选修
  credits: number;       // 学分
  examType: string;      // 考试/考查
  weekday: WeekDay;      // 星期
  startTime: string;     // "HH:mm" 24h
  endTime: string;       // "HH:mm" 24h
  notes: string;         // 备注
  weeks: number[];       // 周次列表，空=每周
  createdAt: string;
  updatedAt: string;
}

export type CourseFormData = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;

export interface CourseWithPosition extends Course {
  gridPosition: GridPosition;
  conflicts: string[];
}

export interface GridPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}
