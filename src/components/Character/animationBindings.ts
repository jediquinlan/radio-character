import React, { useEffect } from "react";
import { Circle, Line, Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { CharacterAnimationValues } from "../../hooks/useCharacterLogic";

// Animated SVG primitives
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Coordinates must match CharacterTemplate.tsx.
 * If you move elements in the template, update these to match.
 */
const LAYOUT = {
  eyeLeft:  { cx: 70,  cy: 90, radius: 22 },
  eyeRight: { cx: 130, cy: 90, radius: 22 },
  antennaLeft:  { baseX: 65,  baseY: 45, maxDisplacement: 25 },
  antennaRight: { baseX: 135, baseY: 45, maxDisplacement: 25 },
  oscilloscope: { x: 45, y: 125, width: 110, height: 50 },
} as const;

const SAMPLE_COUNT = 24;

type AnimBinding = {
  Component: typeof AnimatedLine | typeof AnimatedCircle | typeof AnimatedPath;
  staticProps: Record<string, unknown>;
  animatedProps: ReturnType<typeof useAnimatedProps>;
};

export function useAnimationBindings(
  animValues: CharacterAnimationValues
): Record<string, AnimBinding> {
  const {
    eyeRotation,
    antennaDisplacement,
    oscilloscopeAmplitude,
    oscilloscopeFrequency,
    intensity,
    currentState,
    isPowerOn,
  } = animValues;

  // ── Eye pointers ──

  const leftPointerLength = LAYOUT.eyeLeft.radius * 0.7;
  const animEyePointerLeft = useAnimatedProps(() => {
    const angle = eyeRotation.value;
    const jitter =
      currentState === "normal"
        ? Math.sin(Date.now() * 0.003) * 0.05
        : 0;
    const total = angle + jitter;
    return {
      x2: LAYOUT.eyeLeft.cx + Math.cos(total - Math.PI / 2) * leftPointerLength,
      y2: LAYOUT.eyeLeft.cy + Math.sin(total - Math.PI / 2) * leftPointerLength,
    };
  });

  const rightPointerLength = LAYOUT.eyeRight.radius * 0.7;
  const animEyePointerRight = useAnimatedProps(() => {
    const angle = eyeRotation.value * -1; // mirror
    const jitter =
      currentState === "normal"
        ? Math.sin(Date.now() * 0.003) * 0.05
        : 0;
    const total = angle + jitter;
    return {
      x2: LAYOUT.eyeRight.cx + Math.cos(total - Math.PI / 2) * rightPointerLength,
      y2: LAYOUT.eyeRight.cy + Math.sin(total - Math.PI / 2) * rightPointerLength,
    };
  });

  // ── Antennae ──

  const animAntennaRodLeft = useAnimatedProps(() => {
    const d = antennaDisplacement.value * LAYOUT.antennaLeft.maxDisplacement;
    const tilt = intensity.value * 8 * -1;
    return {
      x2: LAYOUT.antennaLeft.baseX + tilt,
      y2: LAYOUT.antennaLeft.baseY - 30 - d,
    };
  });

  const animAntennaTipLeft = useAnimatedProps(() => {
    const d = antennaDisplacement.value * LAYOUT.antennaLeft.maxDisplacement;
    const tilt = intensity.value * 8 * -1;
    return {
      cx: LAYOUT.antennaLeft.baseX + tilt,
      cy: LAYOUT.antennaLeft.baseY - 30 - d,
    };
  });

  const animAntennaRodRight = useAnimatedProps(() => {
    const d = antennaDisplacement.value * LAYOUT.antennaRight.maxDisplacement;
    const tilt = intensity.value * 8 * 1;
    return {
      x2: LAYOUT.antennaRight.baseX + tilt,
      y2: LAYOUT.antennaRight.baseY - 30 - d,
    };
  });

  const animAntennaTipRight = useAnimatedProps(() => {
    const d = antennaDisplacement.value * LAYOUT.antennaRight.maxDisplacement;
    const tilt = intensity.value * 8 * 1;
    return {
      cx: LAYOUT.antennaRight.baseX + tilt,
      cy: LAYOUT.antennaRight.baseY - 30 - d,
    };
  });

  // ── Oscilloscope waveform ──

  const time = useSharedValue(0);

  useEffect(() => {
    if (isPowerOn) {
      time.value = 0;
      time.value = withRepeat(
        withTiming(Math.PI * 20, {
          duration: 10000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      time.value = withTiming(0, { duration: 500 });
    }
  }, [isPowerOn]);

  const { x: oscX, y: oscY, width: oscW, height: oscH } = LAYOUT.oscilloscope;

  const animOscilloscopeWave = useAnimatedProps(() => {
    "worklet";
    const A = oscilloscopeAmplitude.value;
    const freq = oscilloscopeFrequency.value;
    const t = time.value;
    const centerY = oscY + oscH / 2;
    const step = oscW / (SAMPLE_COUNT - 1);

    let d = "";
    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const px = oscX + i * step;
      const normalizedX = (i / (SAMPLE_COUNT - 1)) * Math.PI * 2 * freq;
      const wave =
        A * (oscH / 2) * 0.8 *
        (Math.sin(normalizedX + t) +
          0.3 * Math.sin(normalizedX * 2.5 + t * 1.7));
      const py = centerY - wave;
      d += i === 0 ? `M ${px},${py}` : ` L ${px},${py}`;
    }
    return { d };
  });

  // ── Power LED ──

  const animPowerLed = useAnimatedProps(() => {
    return { fill: isPowerOn ? "#73A580" : "#333333" };
  });

  // ── Return bindings ──

  return {
    "anim-eye-pointer-left": {
      Component: AnimatedLine,
      staticProps: {
        x1: LAYOUT.eyeLeft.cx, y1: LAYOUT.eyeLeft.cy,
        stroke: "#DD614A", strokeWidth: 3, strokeLinecap: "round",
      },
      animatedProps: animEyePointerLeft,
    },
    "anim-eye-pointer-right": {
      Component: AnimatedLine,
      staticProps: {
        x1: LAYOUT.eyeRight.cx, y1: LAYOUT.eyeRight.cy,
        stroke: "#DD614A", strokeWidth: 3, strokeLinecap: "round",
      },
      animatedProps: animEyePointerRight,
    },
    "anim-antenna-rod-left": {
      Component: AnimatedLine,
      staticProps: {
        x1: LAYOUT.antennaLeft.baseX, y1: LAYOUT.antennaLeft.baseY,
        stroke: "#777777", strokeWidth: 3, strokeLinecap: "round",
      },
      animatedProps: animAntennaRodLeft,
    },
    "anim-antenna-tip-left": {
      Component: AnimatedCircle,
      staticProps: { r: 4, fill: "#DD614A" },
      animatedProps: animAntennaTipLeft,
    },
    "anim-antenna-rod-right": {
      Component: AnimatedLine,
      staticProps: {
        x1: LAYOUT.antennaRight.baseX, y1: LAYOUT.antennaRight.baseY,
        stroke: "#777777", strokeWidth: 3, strokeLinecap: "round",
      },
      animatedProps: animAntennaRodRight,
    },
    "anim-antenna-tip-right": {
      Component: AnimatedCircle,
      staticProps: { r: 4, fill: "#DD614A" },
      animatedProps: animAntennaTipRight,
    },
    "anim-oscilloscope-wave": {
      Component: AnimatedPath,
      staticProps: {
        stroke: "#73A580", strokeWidth: 2.5,
        fill: "none", strokeLinecap: "round", strokeLinejoin: "round",
      },
      animatedProps: animOscilloscopeWave,
    },
    "anim-power-led": {
      Component: AnimatedCircle,
      staticProps: { cx: 168, cy: 55, r: 4 },
      animatedProps: animPowerLed,
    },
  };
}
