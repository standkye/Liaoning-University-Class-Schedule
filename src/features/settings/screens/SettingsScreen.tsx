import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from '../../shared/components/GlassSurface';
import Toast from '../../shared/components/Toast';
import ImportExportPanel from '../components/ImportExportPanel';
import NotificationGuideSection from '../components/NotificationGuideSection';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import { useSettingsStore } from '../../../stores/useSettingsStore';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore } from '../../../stores/useUIStore';
import { importCoursesFromTsv } from '../../../core/services/courseImportService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { THEMES, ThemeName } from '../../../theme/themes';
import { useThemeColors } from '../../../theme/useThemeColors';
import { requestNotificationPermission, scheduleAllCourseReminders } from '../../../core/services/notificationService';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const { courses, importCourses } = useCourseStore();
  const { showToast } = useUIStore();
  const {
    themeName,
    semesterStartDate,
    setThemeName,
    setSemesterStartDate,
  } = useSettingsStore();

  const [showTsvImport, setShowTsvImport] = useState(false);
  const [tsvText, setTsvText] = useState('');

  const handleTsvImport = () => {
    if (!tsvText.trim()) {
      showToast('请先粘贴课程文本', 'error');
      return;
    }
    try {
      const imported = importCoursesFromTsv(tsvText);
      if (imported.length === 0) {
        showToast('未识别到课程数据，请检查格式', 'error');
        return;
      }
      importCourses(imported);
      showToast(`成功导入 ${imported.length} 个课程时段！`, 'success');
      setTsvText('');
      setShowTsvImport(false);
    } catch (error: any) {
      Alert.alert('导入失败', error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>设置</Text>
          <Text style={[styles.headerSub, { color: theme.textTertiary }]}>管理课程数据与外观偏好</Text>
        </View>
        <View style={[styles.headerIconWrap, { backgroundColor: theme.accentBg }]}>
          <Ionicons name="settings-outline" size={22} color={theme.accent} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 90 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Import */}
        <Animated.View entering={FadeInDown.delay(50).springify().damping(15)}>
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.textTertiary }]}>从教务系统导入</Text>
            <GlassSurface variant="premium" padding>
              {!showTsvImport ? (
                <AnimatedPressable style={styles.tsvImportBtn} onPress={() => setShowTsvImport(true)}>
                  <View style={styles.tsvIconWrap}>
                    <Ionicons name="clipboard-outline" size={22} color="#4A90D9" />
                  </View>
                  <View style={styles.tsvImportContent}>
                    <Text style={styles.tsvImportLabel}>粘贴课程文本导入</Text>
                    <Text style={styles.tsvImportDesc}>从教务系统复制选课结果，一键导入</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#606060" />
                </AnimatedPressable>
              ) : (
                <View>
                  <View style={styles.tsvHeader}>
                    <Text style={styles.tsvTitle}>粘贴课程文本</Text>
                    <AnimatedPressable onPress={() => { setShowTsvImport(false); setTsvText(''); }}>
                      <Ionicons name="close-circle" size={24} color="#606060" />
                    </AnimatedPressable>
                  </View>
                  <Text style={styles.tsvHint}>
                    登录教务系统 → 选课结果 → 全选复制（Ctrl+A → Ctrl+C）→ 粘贴
                  </Text>
                  <TextInput
                    style={styles.tsvInput}
                    value={tsvText}
                    onChangeText={setTsvText}
                    placeholder="粘贴课程列表..."
                    placeholderTextColor="#606060"
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                  />
                  <AnimatedPressable style={styles.tsvImportAction} onPress={handleTsvImport}>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.tsvImportActionText}>确认导入</Text>
                  </AnimatedPressable>
                </View>
              )}
            </GlassSurface>
          </View>
        </Animated.View>

        {/* Appearance */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(15)}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>主题</Text>
            <GlassSurface variant="premium" padding>
              <View style={styles.themeGrid}>
                {(Object.keys(THEMES) as ThemeName[]).map((key) => {
                  const t = THEMES[key];
                  const isActive = themeName === key;
                  return (
                    <AnimatedPressable
                      key={key}
                      style={[styles.themeCard, isActive && styles.themeCardActive]}
                      onPress={() => setThemeName(key)}
                    >
                      {/* Color preview bar */}
                      <View style={[styles.themePreview, { backgroundColor: t.accent }]}>
                        <View style={[styles.themePreviewDot, { backgroundColor: t.bgPrimary }]} />
                        <View style={[styles.themePreviewDot, { backgroundColor: t.textPrimary }]} />
                      </View>
                      <View style={styles.themeMeta}>
                        <Text style={[styles.themeLabel, isActive && styles.themeLabelActive]}>
                          {t.label}
                        </Text>
                        {isActive && (
                          <Ionicons name="checkmark-circle" size={16} color={t.accent} />
                        )}
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>学期起始日</Text>
                  <Text style={styles.settingDesc}>计算学期第几周</Text>
                </View>
              </View>
              <TextInput
                style={styles.dateInput}
                value={semesterStartDate}
                onChangeText={setSemesterStartDate}
                placeholder="2026-02-23"
                placeholderTextColor="#606060"
              />
            </GlassSurface>
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(140).springify().damping(15)}>
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.textTertiary }]}>提醒</Text>
            <GlassSurface variant="premium" padding>
              <AnimatedPressable
                style={styles.notifBtn}
                onPress={async () => {
                  const granted = await requestNotificationPermission();
                  if (granted) {
                    const count = await scheduleAllCourseReminders(courses);
                    if (count > 0) {
                      showToast(`已开启上课提醒（${count}节课）`, 'success');
                    } else {
                      showToast('已开启提醒，但当前没有可调度的课程', 'info');
                    }
                  } else {
                    showToast('通知权限未开启', 'error');
                  }
                }}
              >
                <View style={[styles.notifIcon, { backgroundColor: theme.accentBg }]}>
                  <Ionicons name="notifications-outline" size={22} color={theme.accent} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifLabel, { color: theme.textPrimary }]}>上课提醒</Text>
                  <Text style={[styles.notifDesc, { color: theme.textTertiary }]}>课前30分钟通知栏提醒</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
              </AnimatedPressable>
            </GlassSurface>
          </View>
        </Animated.View>

        {/* Notification reliability guide */}
        <Animated.View entering={FadeInDown.delay(160).springify().damping(15)}>
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.textTertiary }]}>提醒可靠性</Text>
            <NotificationGuideSection />
          </View>
        </Animated.View>

        {/* Data */}
        <Animated.View entering={FadeInDown.delay(180).springify().damping(15)}>
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: theme.textTertiary }]}>数据管理</Text>
            <ImportExportPanel />
          </View>
        </Animated.View>

        {/* About */}
        <Animated.View entering={FadeInDown.delay(200).springify().damping(15)}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>关于</Text>
            <GlassSurface variant="premium" padding>
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>课程表</Text>
                  <Text style={styles.settingDesc}>版本 1.0.0</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>v1.0</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.settingRow}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>课程总数</Text>
                </View>
                <Text style={styles.settingValue}>{courses.length} 门</Text>
              </View>
            </GlassSurface>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: { color: '#F5F5F5', fontSize: 26, fontWeight: '700', letterSpacing: 0.3 },
  headerSub: { color: '#808080', fontSize: 12, fontWeight: '500', marginTop: 4 },
  headerIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(74, 144, 217, 0.12)',
    justifyContent: 'center', alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionHeader: {
    color: '#606060', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10,
    marginLeft: 4,
  },
  // TSV
  tsvImportBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 2 },
  tsvIconWrap: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  tsvImportContent: { flex: 1 },
  tsvImportLabel: { color: '#F5F5F5', fontSize: 15, fontWeight: '600' },
  tsvImportDesc: { color: '#707070', fontSize: 12, marginTop: 3 },
  tsvHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tsvTitle: { color: '#F5F5F5', fontSize: 16, fontWeight: '600' },
  tsvHint: { color: '#707070', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  dateInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9, color: '#F5F5F5', fontSize: 14, fontWeight: '500',
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', marginTop: 8,
  },
  tsvInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 10, padding: 12,
    color: '#F5F5F5', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 180, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tsvImportAction: {
    backgroundColor: '#50C878', borderRadius: 12, paddingVertical: 14, marginTop: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  tsvImportActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  // Settings
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  settingContent: { flex: 1 },
  settingLabel: { color: '#F5F5F5', fontSize: 15, fontWeight: '600' },
  settingDesc: { color: '#707070', fontSize: 12, marginTop: 3 },
  settingValue: { color: '#4A90D9', fontSize: 16, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.05)', marginVertical: 10 },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 4,
  },
  themeCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 10,
  },
  themeCardActive: {
    borderColor: '#4A90D9',
    backgroundColor: 'rgba(74, 144, 217, 0.06)',
  },
  themePreview: {
    height: 32,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  themePreviewDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.5,
  },
  themeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  themeLabel: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '600',
  },
  themeLabelActive: {
    color: '#F5F5F5',
  },
  notifBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 2 },
  notifIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1 },
  notifLabel: { fontSize: 15, fontWeight: '600' },
  notifDesc: { fontSize: 12, marginTop: 3 },
  badge: {
    backgroundColor: 'rgba(74, 144, 217, 0.12)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeText: { color: '#4A90D9', fontSize: 11, fontWeight: '700' },
});
