import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generic AsyncStorage wrapper with JSON serialization.
 * Provides a clean abstraction that can be replaced with SQLite
 * or a cloud backend without changing store logic.
 */

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`StorageService: Failed to get "${key}"`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`StorageService: Failed to set "${key}"`, error);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`StorageService: Failed to remove "${key}"`, error);
  }
}

export async function clearAll(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const appKeys = keys.filter(k => k.startsWith('course-schedule-'));
    await Promise.all(appKeys.map(k => AsyncStorage.removeItem(k)));
  } catch (error) {
    console.error('StorageService: Failed to clear all', error);
  }
}

export const StorageService = {
  getItem,
  setItem,
  removeItem,
  clearAll,
};
