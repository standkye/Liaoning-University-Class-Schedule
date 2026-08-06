import { randomUUID } from '../utils/idUtils';
import { Course } from '../../types/course';
import {
  parseCourseTsv,
  periodToTime,
  periodToEndTime,
  ParsedCourse,
} from './tsvParserService';
import { COLORS, CATEGORIES } from '../constants/defaults';

const COURSE_COLORS = COLORS.presets;

/**
 * Import courses from TSV text (from the school's course selection system).
 * Each time slot becomes its own Course entry.
 */
export function importCoursesFromTsv(tsvText: string): Course[] {
  const parsed = parseCourseTsv(tsvText);
  const courses: Course[] = [];
  const now = new Date().toISOString();

  // Assign colors cyclically by course code
  const colorMap = new Map<string, string>();
  let colorIndex = 0;

  for (const pc of parsed) {
    // Assign a unique color per course code
    if (!colorMap.has(pc.courseId)) {
      colorMap.set(pc.courseId, COURSE_COLORS[colorIndex % COURSE_COLORS.length]);
      colorIndex++;
    }
    const color = colorMap.get(pc.courseId)!;

    for (const session of pc.sessions) {
      const startTime = periodToTime(session.startPeriod);
      const endTime = periodToEndTime(session.endPeriod);

      courses.push({
        id: randomUUID(),
        courseCode: pc.courseId,
        name: pc.name,
        instructor: pc.instructor,
        location: session.location,
        color,
        category: pc.category,
        courseType: pc.courseType,
        credits: pc.credits,
        examType: pc.examType,
        weekday: session.weekday,
        startTime,
        endTime,
        notes: '',
        weeks: session.weeks,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return courses;
}
