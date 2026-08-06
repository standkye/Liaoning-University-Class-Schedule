import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassSurface from '../../shared/components/GlassSurface';
import AnimatedPressable from '../../shared/components/AnimatedPressable';
import ConfirmDialog from '../../shared/components/ConfirmDialog';
import { useImportExport } from '../hooks/useImportExport';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore, getTimetableGridRef } from '../../../stores/useUIStore';

export default function ImportExportPanel() {
  const { handleExportJSON, handleImportJSON } = useImportExport();
  const { clearAllCourses, courses } = useCourseStore();
  const { showToast } = useUIStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    clearAllCourses();
    showToast('所有数据已重置', 'info');
    setShowResetConfirm(false);
  };

  const handleExportImage = async () => {
    if (Platform.OS === 'web') {
      showToast('图片导出在网页端不可用', 'info');
      return;
    }

    const gridRef = getTimetableGridRef();
    if (!gridRef) {
      showToast('请先切换到课表页面再导出图片', 'error');
      return;
    }

    try {
      const { captureRef } = await import('react-native-view-shot');
      const MediaLibrary = await import('expo-media-library');
      const Sharing = await import('expo-sharing');

      const uri = await captureRef(gridRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(uri);
        showToast('课表已保存到相册！', 'success');
      } else {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save Timetable',
        });
        showToast('课表已分享！', 'success');
      }
    } catch (error: any) {
      showToast('截图失败：' + error.message, 'error');
    }
  };

  return (
    <View>
      <GlassSurface variant="premium" padding>
        <ActionRow
          icon="download-outline"
          label="导出 JSON"
          subtitle="将所有课程保存到文件"
          onPress={handleExportJSON}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="cloud-upload-outline"
          label="导入 JSON"
          subtitle="从文件加载课程"
          onPress={handleImportJSON}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="image-outline"
          label="保存为图片"
          subtitle={Platform.OS === 'web' ? '仅移动端可用' : '将课表截图为 PNG'}
          onPress={handleExportImage}
        />
        <View style={styles.divider} />
        <ActionRow
          icon="trash-outline"
          label="重置所有数据"
          subtitle={`删除全部 ${courses.length} 门课程`}
          onPress={() => setShowResetConfirm(true)}
          destructive
        />
      </GlassSurface>

      <ConfirmDialog
        visible={showResetConfirm}
        title="重置所有数据"
        message={`将永久删除全部 ${courses.length} 门课程，此操作不可撤销。`}
        confirmLabel="全部删除"
        confirmDestructive
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </View>
  );
}

function ActionRow({
  icon,
  label,
  subtitle,
  onPress,
  destructive = false,
}: {
  icon: string;
  label: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <AnimatedPressable style={styles.actionRow} onPress={onPress}>
      <View style={[styles.iconContainer, destructive && styles.destructiveIcon]}>
        <Ionicons name={icon as any} size={20} color={destructive ? '#E74C3C' : '#4A90D9'} />
      </View>
      <View style={styles.actionContent}>
        <Text style={[styles.actionLabel, destructive && styles.destructiveText]}>{label}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#606060" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(74, 144, 217, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIcon: {
    backgroundColor: 'rgba(231, 76, 60, 0.12)',
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '500',
  },
  actionSubtitle: {
    color: '#606060',
    fontSize: 12,
    marginTop: 2,
  },
  destructiveText: {
    color: '#E74C3C',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 4,
  },
});
