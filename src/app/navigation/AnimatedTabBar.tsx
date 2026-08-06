import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useThemeColors } from '../../theme/useThemeColors';

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 300,
  mass: 0.8,
};

const PRESS_SPRING = {
  damping: 12,
  stiffness: 250,
};

// Android BlurView compatibility: use a solid background on Android
const TAB_BAR_PADDING = 4;
const TAB_BAR_MARGIN = 24;

interface TabItemProps {
  label: string;
  icon: string;
  isFocused: boolean;
  onPress: () => void;
  accent: string;
}

function TabItem({ label, icon, isFocused, onPress, accent }: TabItemProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.88, PRESS_SPRING);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, PRESS_SPRING);
  }, [scale]);

  useAnimatedReaction(
    () => isFocused,
    (focused) => {
      scale.value = withSpring(focused ? 1.05 : 1, PRESS_SPRING);
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {isFocused && (
          <View style={styles.glowContainer}>
            <View style={[styles.glow, { backgroundColor: `${accent}1F` }]} />
          </View>
        )}
        <Ionicons name={icon as any} size={22} color={isFocused ? '#FFFFFF' : '#999'} />
        <Text
          style={[styles.tabLabel, { color: isFocused ? '#FFFFFF' : '#888' }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useThemeColors();
  const numTabs = state.routes.length;

  // Track container width for math-based indicator positioning
  const containerWidth = useSharedValue(1);

  const onContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      containerWidth.value = e.nativeEvent.layout.width;
    },
    [containerWidth],
  );

  // Math-based: tab width = (containerWidth - 2*padding) / numTabs
  // tab position = tabWidth * index + padding
  const indicatorStyle = useAnimatedStyle(() => {
    const innerWidth = containerWidth.value - TAB_BAR_PADDING * 2;
    const tabWidth = innerWidth / numTabs;
    const idx = state.index;
    const left = TAB_BAR_PADDING + tabWidth * idx;
    return {
      left: withSpring(left, SPRING_CONFIG),
      width: withSpring(tabWidth, SPRING_CONFIG),
    };
  });

  const getIconName = (routeName: string, focused: boolean): string => {
    switch (routeName) {
      case 'TimetableTab':
        return focused ? 'calendar' : 'calendar-outline';
      case 'ScheduleTab':
        return focused ? 'today' : 'today-outline';
      case 'CoursesTab':
        return focused ? 'book' : 'book-outline';
      case 'SettingsTab':
        return focused ? 'settings' : 'settings-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.wrapper}>
      <View
        onLayout={onContainerLayout}
        style={[
          styles.tabBarBg,
          {
            backgroundColor: theme.tabBarBg,
            borderColor: theme.tabBarBorder,
          },
        ]}
      >
        <View style={styles.inner}>
          {/* Sliding indicator */}
          <Animated.View style={[styles.indicator, indicatorStyle]}>
            <View
              style={[
                styles.indicatorInner,
                {
                  backgroundColor: `${theme.accent}2E`,
                  borderColor: `${theme.accent}40`,
                },
                Platform.OS === 'ios' ? { shadowColor: theme.accent } : undefined,
              ]}
            />
          </Animated.View>

          {/* Tabs */}
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : route.name;
            const iconName = getIconName(route.name, isFocused);

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                label={label ?? ''}
                icon={iconName}
                isFocused={isFocused}
                onPress={onPress}
                accent={theme.accent}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: TAB_BAR_MARGIN,
    right: TAB_BAR_MARGIN,
    height: 68,
    borderRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  tabBarBg: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: TAB_BAR_PADDING,
  },
  indicator: {
    position: 'absolute',
    top: 4,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorInner: {
    flex: 1,
    margin: 4,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'stretch',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    top: -8,
    left: -16,
    right: -16,
    bottom: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 0,
  },
});
