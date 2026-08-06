import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from '../../shared/components/GlassSurface';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import { useThemeColors } from '../../../theme/useThemeColors';

const isAndroid = Platform.OS === 'android';
// 精确闹钟权限只在 Android 12 (API 31)+ 存在
const isAndroid12Plus = isAndroid && parseInt(String(Platform.Version), 10) >= 31;
// Expo Go 中运行的应用 ID 是 host.exp.exponent,真机/开发构建才是项目包名
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const appPackage = isExpoGo
  ? 'host.exp.exponent'
  : (Constants.expoConfig?.android?.package ?? 'host.exp.exponent');

type NotifStatus = 'granted' | 'denied' | 'checking';

/**
 * 提醒可靠性引导:检测通知权限并引导用户开启系统级权限,
 * 提升"课前 30 分钟提醒"在 Android 各机型(含 vivo/OPPO/小米/华为)上的送达率。
 */
export default function NotificationGuideSection() {
  const theme = useThemeColors();
  const [notifStatus, setNotifStatus] = useState<NotifStatus>('checking');

  const checkNotifStatus = useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setNotifStatus(status === 'granted' ? 'granted' : 'denied');
    } catch {
      setNotifStatus('denied');
    }
  }, []);

  useEffect(() => {
    checkNotifStatus();
    // 从系统设置返回 App 时重新检测权限状态(用户在设置里改了权限后能实时反映)
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkNotifStatus();
    });
    return () => sub.remove();
  }, [checkNotifStatus]);

  const requestNotif = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setNotifStatus(status === 'granted' ? 'granted' : 'denied');
  };

  const openExactAlarm = async () => {
    try {
      await IntentLauncher.startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
        data: `package:${appPackage}`,
      });
    } catch (e) {
      console.warn('[guide] open exact-alarm settings failed:', e);
    }
  };

  const openBatterySettings = async () => {
    try {
      await IntentLauncher.startActivityAsync('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
    } catch (e) {
      console.warn('[guide] open battery settings failed:', e);
    }
  };

  const notifReady = notifStatus === 'granted';

  return (
    <GlassSurface variant="premium" padding>
      {/* 通知权限 */}
      <AnimatedPressable
        style={styles.row}
        onPress={notifReady ? undefined : requestNotif}
      >
        <View style={[styles.rowIcon, { backgroundColor: theme.accentBg }]}>
          <Ionicons name="notifications-outline" size={20} color={theme.accent} />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>通知权限</Text>
          <Text style={[styles.rowDesc, { color: theme.textTertiary }]}>
            {notifStatus === 'checking'
              ? '检测中…'
              : notifReady
                ? '已开启，课前提醒可正常送达'
                : '未开启，点击授权（提醒将不会显示）'}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: notifReady ? 'rgba(80,200,120,0.15)' : 'rgba(255,90,90,0.15)' },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              { color: notifReady ? '#50C878' : '#FF5A5A' },
            ]}
          >
            {notifStatus === 'checking' ? '…' : notifReady ? '已开启' : '未开启'}
          </Text>
        </View>
      </AnimatedPressable>

      {isAndroid12Plus && (
        <>
          <View style={styles.divider} />
          <AnimatedPressable style={styles.row} onPress={openExactAlarm}>
            <View style={[styles.rowIcon, { backgroundColor: 'rgba(240,180,60,0.12)' }]}>
              <Ionicons name="alarm-outline" size={20} color="#F0B43C" />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>精确闹钟权限</Text>
              <Text style={[styles.rowDesc, { color: theme.textTertiary }]}>
                Android 12+ 需允许"闹钟和提醒"。若开关不可用(Android 15 系统限制)，提醒可能延迟数分钟，但仍会通知
              </Text>
            </View>
            <Text style={styles.linkText}>去开启</Text>
          </AnimatedPressable>
        </>
      )}

      <View style={styles.divider} />
      <AnimatedPressable style={styles.row} onPress={openBatterySettings}>
        <View style={[styles.rowIcon, { backgroundColor: 'rgba(90,160,255,0.12)' }]}>
          <Ionicons name="battery-half-outline" size={20} color="#5AA0FF" />
        </View>
        <View style={styles.rowContent}>
          <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>电池优化</Text>
          <Text style={[styles.rowDesc, { color: theme.textTertiary }]}>
            允许后台运行，防止系统延迟提醒（建议设为不限制）
          </Text>
        </View>
        <Text style={styles.linkText}>去设置</Text>
      </AnimatedPressable>

      <View style={styles.divider} />
      <View style={styles.hintBlock}>
        <Text style={[styles.hintTitle, { color: theme.textSecondary }]}>
          <Ionicons name="phone-portrait-outline" size={13} color="#909090" /> 国产机型提示
        </Text>
        <Text style={[styles.hintText, { color: theme.textTertiary }]}>
          vivo/OPPO/小米/华为等系统可能默认限制后台与锁屏通知。请在系统设置中：允许应用
          “自启动”，并开启“锁屏通知/横幅通知”，否则到点可能收不到提醒。
        </Text>
      </View>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600' },
  rowDesc: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  linkText: { color: '#4A90D9', fontSize: 13, fontWeight: '600' },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 10,
  },
  hintBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
  },
  hintTitle: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  hintText: { fontSize: 11.5, lineHeight: 18 },
});
