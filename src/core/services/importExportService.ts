import { Course } from '../../types/course';
import { ScheduleExportData } from '../../types/schedule';
import { randomUUID } from '../utils/idUtils';

/**
 * Serialize courses into the export envelope format.
 */
export function exportToJSON(courses: Course[]): string {
  const data: ScheduleExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    appVersion: '1.0.0',
    courseCount: courses.length,
    courses,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Parse and validate imported JSON data.
 * Returns the validated courses array, or throws with error details.
 */
export function importFromJSON(jsonString: string): Course[] {
  let data: any;

  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('JSON 格式无效，请检查文件后重试。');
  }

  // Check version compatibility
  if (!data.version || typeof data.version !== 'number') {
    throw new Error('缺少或无效的版本字段。');
  }

  if (data.version > 1) {
    throw new Error(`不支持的导出版本: ${data.version}，请更新应用。`);
  }

  // Check courses array
  if (!data.courses || !Array.isArray(data.courses)) {
    throw new Error('导入文件中未找到课程数据。');
  }

  if (data.courses.length === 0) {
    throw new Error('导入文件中没有课程数据。');
  }

  // Validate each course
  const validated: Course[] = [];
  const errors: string[] = [];

  data.courses.forEach((course: any, index: number) => {
    const courseErrors: string[] = [];

    if (!course.name || typeof course.name !== 'string') {
      courseErrors.push('缺少课程名称');
    }
    if (!course.weekday || typeof course.weekday !== 'number' || course.weekday < 1 || course.weekday > 7) {
      courseErrors.push('无效的星期');
    }
    if (!course.startTime || typeof course.startTime !== 'string') {
      courseErrors.push('缺少开始时间');
    }
    if (!course.endTime || typeof course.endTime !== 'string') {
      courseErrors.push('缺少结束时间');
    }

    if (courseErrors.length > 0) {
      errors.push(`第${index + 1}门课程 (${course.name || '未命名'}): ${courseErrors.join('、')}`);
      return;
    }

    // Normalize and add
    validated.push({
      id: course.id || randomUUID(),
      courseCode: course.courseCode || '',
      name: course.name,
      instructor: course.instructor || '',
      location: course.location || '',
      color: course.color || '#4A90D9',
      category: course.category || 'Lecture',
      courseType: course.courseType || '',
      credits: course.credits || 0,
      examType: course.examType || '',
      weekday: course.weekday,
      startTime: course.startTime,
      endTime: course.endTime,
      notes: course.notes || '',
      weeks: Array.isArray(course.weeks) ? course.weeks : [],
      createdAt: course.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  if (errors.length > 0) {
    throw new Error(`数据验证错误:\n${errors.join('\n')}`);
  }

  return validated;
}

/**
 * Validate import data without returning courses.
 * Useful for pre-checking before committing.
 */
export function validateImportData(jsonString: string): { valid: boolean; courseCount: number; error?: string } {
  try {
    const courses = importFromJSON(jsonString);
    return { valid: true, courseCount: courses.length };
  } catch (error: any) {
    return { valid: false, courseCount: 0, error: error.message };
  }
}
