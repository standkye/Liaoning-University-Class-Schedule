import { TOTAL_PERIODS } from '../services/tsvParserService';

export const TOTAL_PERIODS_CONST = TOTAL_PERIODS; // 12

export const PERIOD_HEIGHT = {
  compact: 36,
  comfortable: 48,
  spacious: 60,
} as const;

export const MIN_COLUMN_WIDTH = 0; // auto-fill, no minimum
export const TIME_COLUMN_WIDTH = 40;
export const DAY_HEADER_HEIGHT = 40;

export const DEFAULT_TIME_RANGE_START = 1;  // 第1小节
export const DEFAULT_TIME_RANGE_END = 12;    // 第12小节

export const PERIOD_START_TIMES: [number, number][] = [
  [8, 0], [9, 0], [10, 10], [11, 10],
  [13, 30], [14, 30], [15, 40], [16, 40],
  [18, 0], [19, 0], [20, 10], [21, 10],
];

export const SECTION_CONFIG: { period: number; label: string; color: string }[] = [
  { period: 1, label: '上午', color: '#FFB347' },
  { period: 5, label: '下午', color: '#FF7F50' },
  { period: 9, label: '晚上', color: '#7B9EBD' },
];
export const DEFAULT_COURSE_DURATION = 2;     // 默认2小节(1大节)
