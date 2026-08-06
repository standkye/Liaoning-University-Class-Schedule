import React, { memo } from 'react';
import { Text, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CourseWithPosition } from '../../../types/course';
import { hexToRgba } from '../../../core/utils/colorUtils';

/** Shorten location: if too long, keep only the last segment */
function shortenLocation(location: string): string {
  if (location.length <= 15) return location;
  const parts = location.split('/').map(s => s.trim());
  if (parts.length <= 1) return location;
  return parts[parts.length - 1];
}

interface CourseBlockProps {
  course: CourseWithPosition;
  onPress: (courseId: string) => void;
  onLongPress: (courseId: string) => void;
  index: number;
}

function CourseBlock({ course, onPress, onLongPress, index }: CourseBlockProps) {
  const { gridPosition, color, name, location, conflicts } = course;
  const hasConflict = conflicts.length > 0;
  const blockHeight = gridPosition.height;
  const isCompact = blockHeight < 45;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 25).springify().damping(18)}
      style={[
        styles.container,
        {
          position: 'absolute',
          top: gridPosition.top,
          left: gridPosition.left,
          width: gridPosition.width,
          height: Math.max(gridPosition.height, 1),
          backgroundColor: hexToRgba(color, 0.2),
          borderLeftColor: color,
          borderLeftWidth: 2,
        },
        hasConflict && styles.conflict,
      ]}
    >
      <Pressable
        style={styles.inner}
        onPress={() => onPress(course.id)}
        onLongPress={() => onLongPress(course.id)}
      >
        <Text style={[styles.name, isCompact && styles.nameCompact]} textBreakStrategy="simple">
          {name.replace(/（/g, '(').replace(/）/g, ')').replace(/、/g, ', ')}
        </Text>
        {location ? (
          <Text style={[styles.location, isCompact && styles.locationCompact]} textBreakStrategy="simple">
            {shortenLocation(location)}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export default memo(CourseBlock);

const styles = StyleSheet.create({
  container: {
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginHorizontal: 1.5,
    marginVertical: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  inner: {
    flex: 1,
    paddingLeft: 3,
    paddingRight: 2,
    paddingVertical: 2,
    justifyContent: 'flex-start',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 15,
  },
  nameCompact: {
    fontSize: 10,
    lineHeight: 12,
  },
  location: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '500',
  },
  locationCompact: {
    fontSize: 8,
    lineHeight: 10,
  },
  conflict: {
    borderRightWidth: 2,
    borderRightColor: '#E74C3C',
    borderTopWidth: 1,
    borderTopColor: 'rgba(231, 76, 60, 0.3)',
  },
});
