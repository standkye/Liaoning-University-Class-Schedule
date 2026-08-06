import { randomUUID as expoRandomUUID } from 'expo-crypto';

/**
 * Generate a UUID, falling back to a pure-JS implementation
 * when expo-crypto native module is not available.
 */
export function randomUUID(): string {
  try {
    return expoRandomUUID();
  } catch {
    // Fallback: Math.random-based UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
