import { CourseFormData } from '../../types/course';
import { timeToMinutes } from './timeUtils';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateCourse(data: Partial<CourseFormData>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: '课程名称不能为空' });
  }

  if (!data.startTime) {
    errors.push({ field: 'startTime', message: '请选择开始时间' });
  }

  if (!data.endTime) {
    errors.push({ field: 'endTime', message: '请选择结束时间' });
  }

  if (data.startTime && data.endTime) {
    const start = timeToMinutes(data.startTime);
    const end = timeToMinutes(data.endTime);
    if (end <= start) {
      errors.push({ field: 'endTime', message: '结束时间必须晚于开始时间' });
    }
  }

  if (!data.weekday) {
    errors.push({ field: 'weekday', message: '请选择星期' });
  }

  return errors;
}

export function isValid(data: Partial<CourseFormData>): boolean {
  return validateCourse(data).length === 0;
}
