import { Course } from './course';

export interface Schedule {
  id: string;
  name: string;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}

export interface ScheduleExportData {
  version: number;
  exportDate: string;
  appVersion: string;
  courseCount: number;
  courses: Course[];
}
