import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WeekDay } from '../types/enums';
import { DEFAULT_SETTINGS } from '../core/constants/defaults';
import { STORAGE_KEYS } from '../core/constants/defaults';
import { ThemeName, DEFAULT_THEME } from '../theme/themes';

interface SettingsState {
  themeName: ThemeName;
  firstDayOfWeek: WeekDay;
  timeRangeStart: number;
  timeRangeEnd: number;
  showWeekends: boolean;
  defaultCourseDuration: number;
  semesterStartDate: string;

  // Actions
  setThemeName: (name: ThemeName) => void;
  setFirstDayOfWeek: (day: WeekDay) => void;
  setTimeRangeStart: (hour: number) => void;
  setTimeRangeEnd: (hour: number) => void;
  setDefaultCourseDuration: (minutes: number) => void;
  setSemesterStartDate: (date: string) => void;
  resetDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      themeName: DEFAULT_THEME,

      setThemeName: (name) => set({ themeName: name }),
      setFirstDayOfWeek: (day) => set({ firstDayOfWeek: day }),
      setTimeRangeStart: (hour) => set({ timeRangeStart: hour }),
      setTimeRangeEnd: (hour) => set({ timeRangeEnd: hour }),
      setDefaultCourseDuration: (minutes) => set({ defaultCourseDuration: minutes }),
      setSemesterStartDate: (date) => set({ semesterStartDate: date }),
      resetDefaults: () => set({ ...DEFAULT_SETTINGS, themeName: DEFAULT_THEME }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
    },
  ),
);
