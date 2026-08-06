import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

// Module-level ref for timetable capture (not serializable, so not in store)
let _timetableGridView: any = null;
export function setTimetableGridRef(ref: any) { _timetableGridView = ref; }
export function getTimetableGridRef() { return _timetableGridView; }

interface UIState {
  activeWeekOffset: number;
  isCourseFormVisible: boolean;
  editingCourseId: string | null;
  toastMessage: string | null;
  toastType: ToastType;

  setWeekOffset: (offset: number) => void;
  showCourseForm: (courseId?: string) => void;
  hideCourseForm: () => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  activeWeekOffset: 0,
  isCourseFormVisible: false,
  editingCourseId: null,
  toastMessage: null,
  toastType: 'info',

  setWeekOffset: (offset) => set({ activeWeekOffset: offset }),
  showCourseForm: (courseId) => set({
    isCourseFormVisible: true,
    editingCourseId: courseId ?? null,
  }),
  hideCourseForm: () => set({
    isCourseFormVisible: false,
    editingCourseId: null,
  }),
  showToast: (message, type = 'info') => set({
    toastMessage: message,
    toastType: type,
  }),
  hideToast: () => set({ toastMessage: null }),
}));
