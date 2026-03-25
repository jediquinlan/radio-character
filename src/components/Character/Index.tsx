import React from "react";
import Svg, { Rect, G, Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { useMachine } from "@xstate/react";
import { characterMachine } from "../../machines/characterMachine";
import { useCharacterLogic } from "../../hooks/useCharacterLogic";
import { EyeKnob } from "./EyeKnob";
import { Antenna } from "./Antenna";
import { Oscilloscope } from "./Oscilloscope";
import type { CharacterEvent } from "../../machines/characterMachine";

interface CharacterProps {
  /** Width of the character SVG */
  width?: number;
  /** Height of the character SVG */
  height?: number;
  /** External ref to send events to the state machine */
  onActorRef?: (send: (event: CharacterEvent) => void) => void;
}

/**
 * The Radio Character — a radio-themed mechanical face.
 *
 * Layout (200x240 viewBox):
 *   - Antennae at top (y: 0–40)
 *   - Head/body rounded rect (y: 40–200)
 *   - Eyes (knob dials) at y: 80
 *   - Mouth (oscilloscope) at y: 130–180
 *   - Speaker grille at bottom (y: 200–240)
 */
export function Character({
  width = 200,
  height = 240,
  onActorRef,
}: CharacterProps) {
  const [, send, actorRef] = useMachine(characterMachine);
  const animValues = useCharacterLogic(actorRef);

  // Expose send function to parent
  React.useEffect(() => {
    onActorRef?.(send);
  }, [send, onActorRef]);

  return (
    <Svg width={width} height={height} viewBox="0 0 200 240">
      <Defs>
        <LinearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3A3A3A" />
          <Stop offset="1" stopColor="#2A2A2A" />
        </LinearGradient>
        <LinearGradient id="faceGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#333333" />
          <Stop offset="1" stopColor="#282828" />
        </LinearGradient>
      </Defs>

      {/* Antennae */}
      <Antenna
        baseX={65}
        baseY={45}
        maxDisplacement={25}
        animValues={animValues}
        side="left"
      />
      <Antenna
        baseX={135}
        baseY={45}
        maxDisplacement={25}
        animValues={animValues}
        side="right"
      />

      {/* Body — rounded rectangle */}
      <Rect
        x={20}
        y={40}
        width={160}
        height={160}
        rx={24}
        ry={24}
        fill="url(#bodyGrad)"
        stroke="#555555"
        strokeWidth={2}
      />

      {/* Face plate — slightly inset */}
      <Rect
        x={32}
        y={52}
        width={136}
        height={136}
        rx={16}
        ry={16}
        fill="url(#faceGrad)"
        stroke="#444444"
        strokeWidth={1}
      />

      {/* Eye knobs */}
      <EyeKnob
        cx={70}
        cy={90}
        radius={22}
        animValues={animValues}
        side="left"
      />
      <EyeKnob
        cx={130}
        cy={90}
        radius={22}
        animValues={animValues}
        side="right"
      />

      {/* Oscilloscope mouth */}
      <Oscilloscope
        x={45}
        y={125}
        width={110}
        height={50}
        animValues={animValues}
      />

      {/* Speaker grille at bottom */}
      <G>
        <Rect
          x={30}
          y={205}
          width={140}
          height={30}
          rx={8}
          ry={8}
          fill="#2A2A2A"
          stroke="#444444"
          strokeWidth={1}
        />
        {/* Grille slots */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect
            key={i}
            x={50 + i * 24}
            y={211}
            width={16}
            height={2}
            rx={1}
            fill="#444444"
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect
            key={`b${i}`}
            x={50 + i * 24}
            y={218}
            width={16}
            height={2}
            rx={1}
            fill="#444444"
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect
            key={`c${i}`}
            x={50 + i * 24}
            y={225}
            width={16}
            height={2}
            rx={1}
            fill="#444444"
          />
        ))}
      </G>

      {/* Power indicator LED */}
      <Circle
        cx={168}
        cy={55}
        r={4}
        fill={animValues.isPowerOn ? "#73A580" : "#333333"}
      />
    </Svg>
  );
}
