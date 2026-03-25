import React, { useEffect } from "react";
import { Rect, G } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Path as SvgPath } from "react-native-svg";
import type { CharacterAnimationValues } from "../../hooks/useCharacterLogic";

const AnimatedPath = Animated.createAnimatedComponent(SvgPath);

interface OscilloscopeProps {
  /** Left edge X of the oscilloscope display */
  x: number;
  /** Top edge Y */
  y: number;
  /** Width of the display area */
  width: number;
  /** Height of the display area */
  height: number;
  /** Shared animation values */
  animValues: CharacterAnimationValues;
}

/** Number of sample points for the waveform */
const SAMPLE_COUNT = 24;

export function Oscilloscope({
  x,
  y,
  width,
  height,
  animValues,
}: OscilloscopeProps) {
  const { oscilloscopeAmplitude, oscilloscopeFrequency, isPowerOn } =
    animValues;

  // Time value that continuously advances on the UI thread
  const time = useSharedValue(0);

  useEffect(() => {
    if (isPowerOn) {
      time.value = 0;
      time.value = withRepeat(
        withTiming(Math.PI * 20, {
          duration: 10000,
          easing: Easing.linear,
        }),
        -1, // infinite
        false
      );
    } else {
      time.value = withTiming(0, { duration: 500 });
    }
  }, [isPowerOn]);

  // Build the SVG path string entirely on the UI thread
  const animatedPathProps = useAnimatedProps(() => {
    "worklet";
    const A = oscilloscopeAmplitude.value;
    const freq = oscilloscopeFrequency.value;
    const t = time.value;
    const centerY = y + height / 2;
    const step = width / (SAMPLE_COUNT - 1);

    let d = "";
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const px = x + i * step;
      // y = A * sin(k*x + ω*t)  with slight harmonic for character
      const normalizedX = (i / (SAMPLE_COUNT - 1)) * Math.PI * 2 * freq;
      const wave =
        A * (height / 2) * 0.8 *
        (Math.sin(normalizedX + t) +
          0.3 * Math.sin(normalizedX * 2.5 + t * 1.7));
      const py = centerY - wave;
      d += i === 0 ? `M ${px},${py}` : ` L ${px},${py}`;
    }
    return { d };
  });

  return (
    <G>
      {/* Screen background */}
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={6}
        ry={6}
        fill="#0A1A0A"
        stroke="#555555"
        strokeWidth={2}
      />
      {/* Grid lines (static) */}
      <Rect
        x={x + width * 0.25}
        y={y}
        width={0.5}
        height={height}
        fill="#1A3A1A"
      />
      <Rect
        x={x + width * 0.5}
        y={y}
        width={0.5}
        height={height}
        fill="#1A3A1A"
      />
      <Rect
        x={x + width * 0.75}
        y={y}
        width={0.5}
        height={height}
        fill="#1A3A1A"
      />
      <Rect
        x={x}
        y={y + height * 0.5}
        width={width}
        height={0.5}
        fill="#1A3A1A"
      />
      {/* Waveform */}
      <AnimatedPath
        animatedProps={animatedPathProps}
        stroke="#73A580"
        strokeWidth={2.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  );
}
