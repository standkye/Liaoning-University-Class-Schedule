import { useSettingsStore } from '../stores/useSettingsStore';
import { THEMES, ThemeColors, ThemeName } from './themes';

export function useThemeColors(): ThemeColors {
  const themeName = useSettingsStore(s => s.themeName);
  return THEMES[themeName] ?? THEMES['dark-blue'];
}

export function getThemeColors(name: ThemeName): ThemeColors {
  return THEMES[name] ?? THEMES['dark-blue'];
}
