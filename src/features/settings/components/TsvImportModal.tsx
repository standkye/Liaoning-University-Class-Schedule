import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from '../../shared/components/GlassSurface';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import { importCoursesFromTsv } from '../../../core/services/courseImportService';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore } from '../../../stores/useUIStore';

interface TsvImportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TsvImportModal({ visible, onClose }: TsvImportModalProps) {
  const insets = useSafeAreaInsets();
  const { importCourses } = useCourseStore();
  const { showToast } = useUIStore();
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<{ name: string; count: number; sessions: number }[]>([]);

  const handlePreview = () => {
    if (!text.trim()) {
      showToast('请先粘贴课程文本', 'error');
      return;
    }

    try {
      const courses = importCoursesFromTsv(text);
      if (courses.length === 0) {
        showToast('未识别到课程数据，请检查格式', 'error');
        return;
      }

      // Group by course code for preview
      const grouped = new Map<string, { name: string; count: number; sessions: number }>();
      for (const c of courses) {
        const existing = grouped.get(c.courseCode);
        if (existing) {
          existing.sessions++;
        } else {
          grouped.set(c.courseCode, { name: c.name, count: 1, sessions: 1 });
        }
      }

      setPreview(Array.from(grouped.values()));
      showToast(`识别到 ${grouped.size} 门课程，共 ${courses.length} 个时段`, 'success');
    } catch (error: any) {
      Alert.alert('解析失败', error.message);
    }
  };

  const handleImport = () => {
    if (!text.trim()) {
      showToast('请先粘贴课程文本', 'error');
      return;
    }

    try {
      const courses = importCoursesFromTsv(text);
      if (courses.length === 0) {
        showToast('未识别到课程数据', 'error');
        return;
      }

      Alert.alert(
        '确认导入',
        `将导入 ${preview.length} 门课程，共 ${courses.length} 个时段。\n\n这会替换当前所有课程，是否继续？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '导入',
            onPress: () => {
              importCourses(courses);
              showToast(`成功导入 ${preview.length} 门课程！`, 'success');
              setText('');
              setPreview([]);
              onClose();
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('导入失败', error.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <AnimatedPressable onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close" size={24} color="#A0A0A0" />
          </AnimatedPressable>
          <Text style={styles.headerTitle}>从教务系统导入</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <GlassSurface variant="elevated" padding>
            <Text style={styles.helpTitle}>操作步骤</Text>
            <Text style={styles.helpText}>
              1. 登录学校教务系统 → 本学期课表{'\n'}
              2. 全选课程列表文字（Ctrl+A）→ 复制（Ctrl+C）{'\n'}
              3. 粘贴到下方文本框（Ctrl+V）{'\n'}
              4. 点击「预览」查看识别结果{'\n'}
              5. 确认无误后点击「导入」
            </Text>
          </GlassSurface>

          <View style={styles.spacer} />

          <Text style={styles.label}>粘贴课程文本</Text>
          <TextInput
            style={styles.textArea}
            value={text}
            onChangeText={setText}
            placeholder="将教务系统的课程列表粘贴到这里..."
            placeholderTextColor="#606060"
            multiline
            numberOfLines={12}
            textAlignVertical="top"
          />

          <View style={styles.buttonRow}>
            <AnimatedPressable style={styles.previewBtn} onPress={handlePreview}>
              <Ionicons name="search" size={18} color="#4A90D9" />
              <Text style={styles.previewBtnText}>预览</Text>
            </AnimatedPressable>
            <AnimatedPressable style={styles.importBtn} onPress={handleImport}>
              <Ionicons name="download" size={18} color="#FFFFFF" />
              <Text style={styles.importBtnText}>导入</Text>
            </AnimatedPressable>
          </View>

          {/* Preview */}
          {preview.length > 0 && (
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>
                识别结果（{preview.length} 门课程）
              </Text>
              {preview.map((item, i) => (
                <View key={i} style={styles.previewItem}>
                  <Text style={styles.previewName}>{item.name}</Text>
                  <Text style={styles.previewCount}>
                    {item.sessions} 个时段
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F5F5F5',
    fontSize: 17,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  helpTitle: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpText: {
    color: '#808080',
    fontSize: 13,
    lineHeight: 22,
  },
  spacer: {
    height: 16,
  },
  label: {
    color: '#A0A0A0',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 14,
    color: '#F5F5F5',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  previewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(74, 144, 217, 0.12)',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 217, 0.2)',
  },
  previewBtnText: {
    color: '#4A90D9',
    fontSize: 15,
    fontWeight: '600',
  },
  importBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4A90D9',
    borderRadius: 10,
    paddingVertical: 12,
  },
  importBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  previewSection: {
    marginTop: 16,
  },
  previewTitle: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    marginBottom: 4,
  },
  previewName: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  previewCount: {
    color: '#606060',
    fontSize: 12,
  },
});
