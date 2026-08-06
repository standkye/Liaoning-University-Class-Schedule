import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = 'calendar-outline', title, subtitle, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(15)} style={styles.iconWrapper}>
        <View style={styles.iconGlow} />
        {/* @ts-expect-error - Ionicons dynamic names */}
        <Ionicons name={icon} size={52} color="#4A90D9" />
      </Animated.View>
      <Animated.View entering={FadeIn.delay(200)}>
        <Text style={styles.title}>{title}</Text>
      </Animated.View>
      {subtitle && (
        <Animated.View entering={FadeIn.delay(300)}>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </Animated.View>
      )}
      {action && (
        <Animated.View entering={FadeInDown.delay(400).springify().damping(15)} style={styles.action}>
          {action}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(74, 144, 217, 0.1)',
  },
  title: {
    color: '#F5F5F5',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#808080',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  action: {
    marginTop: 28,
  },
});
