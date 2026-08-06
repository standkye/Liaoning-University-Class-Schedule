/**
 * Parse "HH:mm" string to minutes since midnight.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to "HH:mm" string.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculate how many rows (in half-hour units) a course spans.
 */
export function calculateDurationInSlots(startTime: string, endTime: string, slotMinutes: number = 30): number {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return (end - start) / slotMinutes;
}

/**
 * Get the y-position offset relative to the grid start hour.
 */
export function getTimeOffset(startTime: string, gridStartHour: number, hourHeight: number): number {
  const minutes = timeToMinutes(startTime);
  const gridStartMinutes = gridStartHour * 60;
  return ((minutes - gridStartMinutes) / 60) * hourHeight;
}

/**
 * Calculate block height from course duration.
 */
export function getBlockHeight(startTime: string, endTime: string, hourHeight: number): number {
  const durationMinutes = timeToMinutes(endTime) - timeToMinutes(startTime);
  return (durationMinutes / 60) * hourHeight;
}

/**
 * Check if two time ranges overlap.
 */
export function timesOverlap(
  start1: string, end1: string,
  start2: string, end2: string,
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

/**
 * Generate time slot labels for the visible grid range.
 */
export function generateTimeSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

/**
 * Format time for display (e.g., "14:00" → "2:00 PM").
 */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Format weeks array to display label.
 */
export function formatWeeksLabel(weeks: number[]): string {
  if (!weeks || weeks.length === 0) return '每周';
  if (weeks.length === 1) return `第${weeks[0]}周`;
  const allEven = weeks.every(w => w % 2 === 0);
  const allOdd = weeks.every(w => w % 2 === 1);
  if (allEven) return `${weeks[0]}-${weeks[weeks.length - 1]}周(双)`;
  if (allOdd) return `${weeks[0]}-${weeks[weeks.length - 1]}周(单)`;
  return `${weeks[0]}-${weeks[weeks.length - 1]}周`;
}
