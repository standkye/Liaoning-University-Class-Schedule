import React, { useEffect } from 'react';
import { StyleSheet, Text, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useUIStore, ToastType } from '../../../stores/useUIStore';

const TOAST_COLORS: Record<ToastType, string> = {
  success: '#50C878',
  error: '#E74C3C',
  info: '#4A90D9',
};

const TOAST_DURATION = 3000;

export default function Toast() {
  const { toastMessage, toastType, hideToast } = useUIStore();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (toastMessage) {
      // Show
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto hide
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(hideToast)();
          }
        });
      }, TOAST_DURATION);

      return () => clearTimeout(timer);
    }
  }, [toastMessage, toastType, hideToast, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!toastMessage) return null;

  const color = TOAST_COLORS[toastType];

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        { borderLeftColor: color },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{toastMessage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 3,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  text: {
    color: '#F5F5F5',
    fontSize: 14,
    fontWeight: '500',
  },
});
