import { WeekDay } from '../../types/enums';

// Represents one parsed time slot from the TSV data
export interface ParsedSession {
  weekday: WeekDay;
  startPeriod: number; // e.g., 1 for 第1-2节
  endPeriod: number;   // e.g., 2 for 第1-2节
  weeks: number[];     // parsed week numbers
  location: string;    // e.g., "崇山 / 蕙星楼 / 303"
}

// Represents one parsed course from the TSV data
export interface ParsedCourse {
  courseId: string;
  name: string;
  instructor: string;
  credits: number;
  category: string;     // 课程类别 e.g., "学科核心课"
  courseType: string;   // 必修/选修
  examType: string;     // 考试/考查
  sessions: ParsedSession[];
}

// Map Chinese weekday names to WeekDay enum
const WEEKDAY_MAP: Record<string, WeekDay> = {
  '一': WeekDay.MONDAY,
  '星期一': WeekDay.MONDAY,
  '二': WeekDay.TUESDAY,
  '星期二': WeekDay.TUESDAY,
  '三': WeekDay.WEDNESDAY,
  '星期三': WeekDay.WEDNESDAY,
  '四': WeekDay.THURSDAY,
  '星期四': WeekDay.THURSDAY,
  '五': WeekDay.FRIDAY,
  '星期五': WeekDay.FRIDAY,
  '六': WeekDay.SATURDAY,
  '星期六': WeekDay.SATURDAY,
  '日': WeekDay.SUNDAY,
  '七': WeekDay.SUNDAY,
  '星期日': WeekDay.SUNDAY,
  '星期七': WeekDay.SUNDAY,
};

// Map 小节 numbers to start time.
// 上午 8:00-12:00, 下午 13:30-17:30, 晚上 18:00-22:00
// 每小节50min, 小节间休10min, 大节间休20min, 一大节=2小节
const PERIOD_TIME_MAP: Record<number, string> = {
  1: '08:00',  2: '09:00',   // 第一大节: 08:00-09:50
  3: '10:10',  4: '11:10',   // 第二大节: 10:10-12:00
  5: '13:30',  6: '14:30',   // 第三大节: 13:30-15:20
  7: '15:40',  8: '16:40',   // 第四大节: 15:40-17:30
  9: '18:00',  10: '19:00',  // 第五大节: 18:00-19:50
  11: '20:10', 12: '21:10',  // 第六大节: 20:10-22:00
};

export const TOTAL_PERIODS = 12;
export const BIG_PERIODS = 6;

/**
 * Parse week description text into an array of week numbers.
 * Examples:
 *   "1-16 周"     → [1,2,3,...,16]
 *   "1-16周双周"   → [2,4,6,8,10,12,14,16]
 *   "1-16周单周"   → [1,3,5,7,9,11,13,15]
 *   "第5周"       → [5]
 *   "1-4,6-16 周" → [1,2,3,4,6,7,...,16]
 *   "1,3,5,7,9,11,13,15 周" → [1,3,5,7,9,11,13,15]
 *   "9-16周双周"   → [10,12,14,16]
 */
export function parseWeeks(weekText: string): number[] {
  const cleaned = weekText.replace(/\s+/g, '').replace('周', '');
  const weeks: number[] = [];

  // Check for 单周/双周 mode
  const isOddWeeks = cleaned.includes('单周');
  const isEvenWeeks = cleaned.includes('双周');
  const base = cleaned.replace('单周', '').replace('双周', '');

  // Handle "第X周" pattern
  const singleWeekMatch = base.match(/^第(\d+)$/);
  if (singleWeekMatch) {
    return [parseInt(singleWeekMatch[1], 10)];
  }

  // Split by comma for explicit lists or ranges
  const parts = base.split(',');

  for (const part of parts) {
    if (part.includes('-')) {
      // Range: "1-16" or "1-4"
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      for (let w = start; w <= end; w++) {
        if (isEvenWeeks && w % 2 === 0) weeks.push(w);
        else if (isOddWeeks && w % 2 === 1) weeks.push(w);
        else if (!isEvenWeeks && !isOddWeeks) weeks.push(w);
      }
    } else {
      // Single number
      const num = parseInt(part, 10);
      if (!isNaN(num)) {
        weeks.push(num);
      }
    }
  }

  return [...new Set(weeks)].sort((a, b) => a - b);
}

/**
 * Parse a period string like "3-4节" or "9-10节" to start/end period numbers.
 */
export function parsePeriod(periodText: string): { start: number; end: number } {
  const match = periodText.match(/(\d+)-(\d+)节/);
  if (match) {
    return {
      start: parseInt(match[1], 10),
      end: parseInt(match[2], 10),
    };
  }
  return { start: 1, end: 2 };
}

/**
 * Convert 小节 number to start time string (HH:mm).
 */
export function periodToTime(period: number): string {
  return PERIOD_TIME_MAP[period] || '08:00';
}

/**
 * Convert 小节 number to end time (start + 50min).
 */
export function periodToEndTime(period: number): string {
  const start = PERIOD_TIME_MAP[period];
  if (!start) return '08:50';
  const [h, m] = start.split(':').map(Number);
  const totalMin = h * 60 + m + 50;
  const endH = Math.floor(totalMin / 60);
  const endM = totalMin % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Get display label for a 小节.
 */
export function getPeriodLabel(period: number): string {
  return `第${period}节`;
}

/**
 * Get 大节 label.
 */
export function getBigPeriodLabel(bigPeriod: number): string {
  const labels = ['', '一', '二', '三', '四', '五', '六'];
  return `第${labels[bigPeriod]}大节`;
}

/**
 * Extract weekday from time description.
 * The time field looks like "1-16 周 / 星期五 / 9-10节".
 */
export function parseWeekday(timeText: string): WeekDay {
  for (const [key, val] of Object.entries(WEEKDAY_MAP)) {
    if (timeText.includes(key)) return val;
  }
  return WeekDay.MONDAY;
}

/**
 * Parse a time field like "1-16 周 / 星期五 / 9-10节" into structured data.
 */
export function parseTimeField(timeText: string): { weeks: number[]; weekday: WeekDay; startPeriod: number; endPeriod: number } | null {
  if (!timeText || timeText.trim() === '') return null;

  // Split by " / "
  const parts = timeText.split('/').map(s => s.trim());
  if (parts.length < 3) return null;

  const weeks = parseWeeks(parts[0]);
  const weekday = parseWeekday(parts[1]);
  const period = parsePeriod(parts[2]);

  return {
    weeks,
    weekday,
    startPeriod: period.start,
    endPeriod: period.end,
  };
}

/**
 * Parse location field like "崇山 / 蕙星楼 / 303" or "崇山 / 崇山操场 / 崇山篮球场地2".
 * Returns array [campus, building, room, ...].
 */
export function parseLocation(locationText: string): string[] {
  return locationText.split('/').map(s => s.trim()).filter(Boolean);
}

/**
 * Main parser: parse the entire TSV text into an array of ParsedCourse.
 */
export function parseCourseTsv(tsvText: string): ParsedCourse[] {
  const lines = tsvText.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // Skip header
  const dataLines = lines.slice(1);
  const courses: ParsedCourse[] = [];

  for (const line of dataLines) {
    const columns = line.split('\t');
    const tabCount = columns.length - 1;

    // Continuation line: only has ~2 columns (时间\t地点), no full course metadata
    const isContinuation = tabCount <= 3;

    let courseId: string;
    let timeText: string;
    let locationText: string;

    if (isContinuation) {
      // Continuation: columns[0] = time, columns[1] = location
      courseId = '';
      timeText = (columns[0] || '').trim();
      locationText = (columns[1] || '').trim();
    } else {
      // Full course line: 16 columns
      courseId = (columns[0] || '').trim();
      timeText = (columns[14] || '').trim();
      locationText = (columns[15] || '').trim();
    }

    const parsedTime = parseTimeField(timeText);
    if (!parsedTime) continue;

    const session: ParsedSession = {
      weekday: parsedTime.weekday,
      startPeriod: parsedTime.startPeriod,
      endPeriod: parsedTime.endPeriod,
      weeks: parsedTime.weeks,
      location: locationText,
    };

    if (courseId) {
      const name = (columns[1] || '').trim();
      const instructor = (columns[9] || '').trim().replace(/\*/g, '');
      const credits = parseFloat(columns[5] || '0') || 0;
      const category = (columns[7] || '').trim();
      const courseType = (columns[6] || '').trim();
      const examType = (columns[8] || '').trim();

      courses.push({
        courseId,
        name,
        instructor,
        credits,
        category,
        courseType,
        examType,
        sessions: [session],
      });
    } else {
      const lastCourse = courses[courses.length - 1];
      if (lastCourse) {
        lastCourse.sessions.push(session);
      }
    }
  }

  return courses;
}
