import { useCallback } from 'react';
import { Paths, File } from 'expo-file-system';
import { Directory } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { useCourseStore } from '../../../stores/useCourseStore';
import { useUIStore } from '../../../stores/useUIStore';
import { exportToJSON, importFromJSON } from '../../../core/services/importExportService';

export function useImportExport() {
  const { exportCourses, importCourses } = useCourseStore();
  const { showToast } = useUIStore();

  const handleExportJSON = useCallback(async () => {
    try {
      const courses = exportCourses();
      const json = exportToJSON(courses);

      const fileName = `schedule-export-${new Date().toISOString().split('T')[0]}.json`;
      const file = new File(Paths.cache, fileName);
      file.write(json);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: '导出课程表',
        });
      } else {
        showToast('此设备不支持分享功能', 'error');
      }
    } catch (error: any) {
      showToast('导出失败：' + error.message, 'error');
    }
  }, [exportCourses, showToast]);

  const handleImportJSON = useCallback(async () => {
    try {
      const result = await File.pickFileAsync({
        mimeTypes: ['application/json'],
      });

      if (result.canceled || !result.result) {
        return;
      }

      const pickedFile = Array.isArray(result.result) ? result.result[0] : result.result;
      const content = await pickedFile.text();

      const courses = importFromJSON(content);

      // Ask user for confirmation
      Alert.alert(
        '导入课程',
        `在文件中发现 ${courses.length} 门课程。\n\n这将替换当前所有课程，是否继续？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '导入',
            onPress: () => {
              importCourses(courses);
              showToast(`成功导入 ${courses.length} 门课程！`, 'success');
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('导入失败', error.message);
    }
  }, [importCourses, showToast]);

  return {
    handleExportJSON,
    handleImportJSON,
  };
}
