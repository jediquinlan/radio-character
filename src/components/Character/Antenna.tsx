import React from "react";
import { Line, Circle, G } from "react-native-svg";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import type { CharacterAnimationValues } from "../../hooks/useCharacterLogic";

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AntennaProps {
  /** Base X position (center of antenna base) */
  baseX: number;
  /** Base Y position (top of the head) */
  baseY: number;
  /** Maximum displacement upward in SVG units */
  maxDisplacement: number;
  /** Shared animation values from useCharacterLogic */
  animValues: CharacterAnimationValues;
  /** Which antenna (left tilts left, right tilts right) */
  side: "left" | "right";
}

export function Antenna({
  baseX,
  baseY,
  maxDisplacement,
  animValues,
  side,
}: AntennaProps) {
  const { antennaDisplacement, intensity } = animValues;
  const tiltSign = side === "left" ? -1 : 1;
  const tipRadius = 4;

  // Animate the tip position — Y moves up, X tilts slightly
  const animatedLineProps = useAnimatedProps(() => {
    const displacement = antennaDisplacement.value * maxDisplacement;
    const tilt = intensity.value * 8 * tiltSign;

    return {
      y2: baseY - 30 - displacement,
      x2: baseX + tilt,
    };
  });

  const animatedTipProps = useAnimatedProps(() => {
    const displacement = antennaDisplacement.value * maxDisplacement;
    const tilt = intensity.value * 8 * tiltSign;

    return {
      cy: baseY - 30 - displacement,
      cx: baseX + tilt,
    };
  });

  return (
    <G>
      {/* Antenna rod */}
      <AnimatedLine
        x1={baseX}
        y1={baseY}
        animatedProps={animatedLineProps}
        stroke="#777777"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Antenna tip ball */}
      <AnimatedCircle
        r={tipRadius}
        animatedProps={animatedTipProps}
        fill="#DD614A"
      />
    </G>
  );
}
