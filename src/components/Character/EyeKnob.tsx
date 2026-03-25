import React from "react";
import { Circle, Line, G } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import type { CharacterAnimationValues } from "../../hooks/useCharacterLogic";

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedLine = Animated.createAnimatedComponent(Line);

interface EyeKnobProps {
  /** Center X position in SVG coordinates */
  cx: number;
  /** Center Y position in SVG coordinates */
  cy: number;
  /** Radius of the knob */
  radius: number;
  /** Shared animation values from useCharacterLogic */
  animValues: CharacterAnimationValues;
  /** Whether this is the left or right eye (right eye mirrors rotation) */
  side: "left" | "right";
}

/** Micro-jitter amplitude (radians) for idle state */
const JITTER_AMOUNT = 0.05;

export function EyeKnob({ cx, cy, radius, animValues, side }: EyeKnobProps) {
  const { eyeRotation, currentState } = animValues;
  const pointerLength = radius * 0.7;
  const mirror = side === "right" ? -1 : 1;

  // Pointer endpoint driven by eye rotation
  const animatedPointerProps = useAnimatedProps(() => {
    const angle = eyeRotation.value * mirror;

    // Add micro-jitter in idle
    const jitter =
      currentState === "idle"
        ? Math.sin(Date.now() * 0.003) * JITTER_AMOUNT
        : 0;

    const totalAngle = angle + jitter;
    const endX = cx + Math.cos(totalAngle - Math.PI / 2) * pointerLength;
    const endY = cy + Math.sin(totalAngle - Math.PI / 2) * pointerLength;

    return {
      x2: endX,
      y2: endY,
    };
  });

  return (
    <G>
      {/* Outer ring */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#2A2A2A"
        stroke="#555555"
        strokeWidth={2}
      />
      {/* Inner circle */}
      <Circle
        cx={cx}
        cy={cy}
        r={radius * 0.6}
        fill="#1A1A1A"
        stroke="#444444"
        strokeWidth={1}
      />
      {/* Pointer notch */}
      <AnimatedLine
        x1={cx}
        y1={cy}
        animatedProps={animatedPointerProps}
        stroke="#DD614A"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Center dot */}
      <Circle cx={cx} cy={cy} r={radius * 0.12} fill="#DD614A" />
    </G>
  );
}
