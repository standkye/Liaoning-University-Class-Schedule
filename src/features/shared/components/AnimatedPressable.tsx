import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

const AnimatedPressable = React.forwardRef<typeof Pressable, AnimatedPressableProps>(
  ({ children, style, scaleTo = 0.96, onPressIn, onPressOut, ...props }, _ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(
      (e: any) => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 300 });
        onPressIn?.(e);
      },
      [scale, scaleTo, onPressIn],
    );

    const handlePressOut = useCallback(
      (e: any) => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        onPressOut?.(e);
      },
      [scale, onPressOut],
    );

    return (
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} {...props}>
        <Animated.View style={[style, animatedStyle]}>
          {children}
        </Animated.View>
      </Pressable>
    );
  },
);

AnimatedPressable.displayName = 'AnimatedPressable';
export default AnimatedPressable;
