import { useState, useCallback, useMemo } from 'react';
import { useCourseStore } from '../../../stores/useCourseStore';
import { Course, CourseFormData } from '../../../types/course';
import { WeekDay } from '../../../types/enums';
import { validateCourse, ValidationError } from '../../../core/utils/validation';
import { COLORS, CATEGORIES, DEFAULT_SETTINGS } from '../../../core/constants/defaults';
import { timeToMinutes } from '../../../core/utils/timeUtils';
import { periodToTime, periodToEndTime } from '../../../core/services/tsvParserService';

const PERIOD_START_TIMES: [number, number][] = [
  [8, 0], [9, 0], [10, 10], [11, 10],
  [13, 30], [14, 30], [15, 40], [16, 40],
  [18, 0], [19, 0], [20, 10], [21, 10],
];

function timeToPeriodNumber(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const totalMin = h * 60 + m;
  let best = 1;
  for (let i = 0; i < PERIOD_START_TIMES.length; i++) {
    if (totalMin >= PERIOD_START_TIMES[i][0] * 60 + PERIOD_START_TIMES[i][1]) best = i + 1;
    else break;
  }
  return best;
}

interface UseCourseFormOptions {
  existingCourse?: Course;
  prefillDay?: WeekDay;
  prefillStartTime?: string;
}

export function useCourseForm({ existingCourse, prefillDay, prefillStartTime }: UseCourseFormOptions = {}) {
  const { addCourse, updateCourse, findConflicts } = useCourseStore();

  // Default end time: start period + 1 大节 (2小节)
  const defaultEndTime = prefillStartTime
    ? periodToEndTime(timeToPeriodNumber(prefillStartTime) + 1)
    : '09:50';

  const [courseCode, setCourseCode] = useState(existingCourse?.courseCode ?? '');
  const [name, setName] = useState(existingCourse?.name ?? '');
  const [instructor, setInstructor] = useState(existingCourse?.instructor ?? '');
  const [location, setLocation] = useState(existingCourse?.location ?? '');
  const [color, setColor] = useState(existingCourse?.color ?? COLORS.defaultCourseColor);
  const [category, setCategory] = useState(existingCourse?.category ?? CATEGORIES.defaultCategory);
  const [courseType, setCourseType] = useState(existingCourse?.courseType ?? '');
  const [credits, setCredits] = useState(existingCourse?.credits ?? 0);
  const [examType, setExamType] = useState(existingCourse?.examType ?? '');
  const [weekday, setWeekday] = useState<WeekDay>(existingCourse?.weekday ?? prefillDay ?? WeekDay.MONDAY);
  const [startTime, setStartTime] = useState(existingCourse?.startTime ?? prefillStartTime ?? '08:00');
  const [endTime, setEndTime] = useState(existingCourse?.endTime ?? defaultEndTime);
  const [notes, setNotes] = useState(existingCourse?.notes ?? '');
  const [weeks, setWeeks] = useState<number[]>(existingCourse?.weeks ?? []);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [conflictIds, setConflictIds] = useState<string[]>([]);

  const isEdit = !!existingCourse;

  const formData: CourseFormData = useMemo(() => ({
    courseCode,
    name,
    instructor,
    location,
    color,
    category,
    courseType,
    credits,
    examType,
    weekday,
    startTime,
    endTime,
    notes,
    weeks,
  }), [courseCode, name, instructor, location, color, category, courseType, credits, examType, weekday, startTime, endTime, notes, weeks]);

  const checkConflicts = useCallback(() => {
    const conflicts = findConflicts({ ...formData }, existingCourse?.id);
    setConflictIds(conflicts);
    return conflicts;
  }, [formData, findConflicts, existingCourse?.id]);

  const handleStartTimeChange = useCallback((time: string) => {
    setStartTime(time);
    // Calculate end time based on periods: keep same span, minimum 1大节
    const oldSpan = timeToPeriodNumber(endTime) - timeToPeriodNumber(startTime);
    const span = oldSpan > 0 ? oldSpan : 1;
    setEndTime(periodToEndTime(timeToPeriodNumber(time) + span));
  }, [endTime, startTime]);

  const save = useCallback((): Course | null => {
    const validationErrors = validateCourse(formData);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return null;
    }

    if (isEdit && existingCourse) {
      updateCourse(existingCourse.id, formData);
      return { ...existingCourse, ...formData };
    } else {
      return addCourse(formData);
    }
  }, [formData, isEdit, existingCourse, addCourse, updateCourse]);

  return {
    // Fields
    courseCode, setCourseCode,
    name, setName,
    instructor, setInstructor,
    location, setLocation,
    color, setColor,
    category, setCategory,
    courseType, setCourseType,
    credits, setCredits,
    examType, setExamType,
    weekday, setWeekday,
    startTime, setStartTime: handleStartTimeChange,
    endTime, setEndTime,
    notes, setNotes,
    weeks, setWeeks,
    // State
    errors,
    conflictIds,
    isEdit,
    // Actions
    checkConflicts,
    save,
    getFieldError: (field: string) => errors.find(e => e.field === field)?.message,
  };
}
