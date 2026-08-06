import { Platform } from 'react-native';
import { Course } from '../../types/course';
import { useSettingsStore } from '../../stores/useSettingsStore';
import { timeToMinutes } from '../utils/timeUtils';
import { WeekDay } from '../../types/enums';

/** Formatted channel name for Android */
const CHANNEL_ID = 'class-reminders';

// expo-notifications 在 Expo Go 的 Android 上曾因"自动注册远程推送"的模块副作用而 import 即抛错
// (SDK 53+ 移除了远程推送)。已通过 patch node_modules/expo-notifications/build/DevicePushTokenAutoRegistration.fx.js
// 让该副作用在 Expo Go 下跳过——本地定时通知(课前提醒)在 Expo Go 中仍然可用。
// 这里仍用 try/catch 兜底:万一加载失败(如 patch 未生效),相关功能优雅降级而非崩溃。
const Notifications: typeof import('expo-notifications') | null = (() => {
  try {
    return require('expo-notifications');
  } catch (e) {
    console.warn('[reminders] load expo-notifications failed:', (e as Error)?.message ?? e);
    return null;
  }
})();

// Track whether handler has been configured to avoid duplicate calls
let handlerConfigured = false;

/** Lazily configure the notification handler — avoids crash on import if native module not ready */
function ensureHandler() {
  if (!Notifications || handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureChannel(): Promise<boolean> {
  if (!Notifications) return false;
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: '上课提醒',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
      return true;
    } catch (e) {
      // Expo Go (SDK 53+) 部分原生模块缺失,创建自定义频道可能失败。
      // 降级:不指定 channelId,使用系统默认频道,通知仍可展示。
      // 用 console.log(而非 warn)避免在 Expo Go 下每次调度都弹 LogBox。
      console.log('[reminders] ensureChannel failed, fallback to default channel:', (e as Error)?.message ?? e);
      return false;
    }
  }
  return true;
}

/**
 * Request notification permissions.
 * Returns true if granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false; // 模块加载失败时降级(正常情况不会)
  ensureHandler();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') {
    await ensureChannel();
    return true;
  }
  return false;
}

/**
 * Schedule 30-minute advance notifications for all courses.
 * Cancels all existing scheduled notifications first, then reschedules.
 */
export async function scheduleAllCourseReminders(courses: Course[]): Promise<number> {
  if (!Notifications) { console.warn('[reminders] Notifications module unavailable'); return 0; }
  ensureHandler();

  // Ensure notification permission — request if not yet granted (pops system dialog).
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  console.log(`[reminders] permission=${status}, courses=${courses.length}`);
  if (status !== 'granted') return 0;

  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();
  const channelReady = await ensureChannel();

  const now = new Date();
  const today = now.getDay(); // 0=Sun
  const todayWeekday = today === 0 ? WeekDay.SUNDAY : (today as WeekDay);

  // Get semester week. 未设置(或无效)学期起始日时 currentWeek 为 null,
  // 此时不按周过滤,默认提醒全部课程,避免"静默一条都不提醒"。
  const { semesterStartDate } = useSettingsStore.getState();
  let currentWeek: number | null = null;
  if (semesterStartDate) {
    const start = new Date(semesterStartDate);
    if (!isNaN(start.getTime())) {
      const diffMs = now.getTime() - start.getTime();
      currentWeek = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
    }
  }

  let scheduledCount = 0;

  for (const course of courses) {
    // Check if course runs this week (currentWeek 为 null 时跳过周过滤)
    if (course.weeks.length > 0 && currentWeek !== null && !course.weeks.includes(currentWeek)) continue;

    const startMin = timeToMinutes(course.startTime);
    // Subtract 30 minutes for the reminder
    const reminderMin = startMin - 30;
    if (reminderMin < 0) continue;

    const reminderHour = Math.floor(reminderMin / 60);
    const reminderMinute = reminderMin % 60;

    // Calculate days until this course's weekday
    let daysUntil = course.weekday - todayWeekday;
    if (daysUntil < 0) daysUntil += 7; // next week
    if (daysUntil === 0 && reminderMin < now.getHours() * 60 + now.getMinutes()) {
      // Already passed today, schedule for next week
      daysUntil = 7;
    }

    // Convert WeekDay enum (1=Mon..7=Sun) to notification weekday (1=Sun..7=Sat)
    const notifWeekday = course.weekday === WeekDay.SUNDAY ? 1 : course.weekday + 1;

    // Schedule notification (channelId 仅当自定义频道创建成功时携带,否则用系统默认频道)
    const trigger = Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ ${course.name}`,
        body: `30分钟后上课 · ${course.location || ''} · ${course.instructor || ''}`,
        data: { courseId: course.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: notifWeekday,
        hour: reminderHour,
        minute: reminderMinute,
        ...(channelReady ? { channelId: CHANNEL_ID } : {}),
      },
    });

    try {
      await trigger;
      scheduledCount++;
    } catch (e) {
      console.warn(`[reminders] schedule failed for ${course.name} (${course.startTime}):`, e);
    }
  }

  console.log(`[reminders] currentWeek=${currentWeek}, scheduled=${scheduledCount}`);
  return scheduledCount;
}
