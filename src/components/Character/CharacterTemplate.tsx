import React from "react";
import { Rect, G, Circle, Line, Path, Defs, LinearGradient, Stop } from "react-native-svg";

interface CharacterTemplateProps {
  /**
   * Map of element id → replacement React element.
   * Animated elements are swapped at runtime via this map.
   * A designer can freely edit everything else in this file;
   * just keep the id attributes on animated elements intact.
   */
  overrides?: Record<string, React.ReactElement>;
}

/**
 * Static SVG template for the Radio Character.
 *
 * Renders inside a parent <Svg> — returns a <G> fragment.
 * Elements with id="anim-*" are the animation contract:
 *
 *   anim-antenna-rod-left    Line   — antenna rod (left)
 *   anim-antenna-rod-right   Line   — antenna rod (right)
 *   anim-antenna-tip-left    Circle — antenna tip ball (left)
 *   anim-antenna-tip-right   Circle — antenna tip ball (right)
 *   anim-eye-pointer-left    Line   — eye knob pointer (left)
 *   anim-eye-pointer-right   Line   — eye knob pointer (right)
 *   anim-oscilloscope-wave   Path   — oscilloscope waveform
 *   anim-power-led           Circle — power indicator LED
 */
export function CharacterTemplate({ overrides }: CharacterTemplateProps) {
  const el = (id: string, fallback: React.ReactElement) =>
    overrides?.[id] ?? fallback;

  return (
    <G>
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

      {/* ── Antennae ── */}
      <G>
        {/* Left antenna */}
        {el(
          "anim-antenna-rod-left",
          <Line x1={65} y1={45} x2={65} y2={15}
                stroke="#777777" strokeWidth={3} strokeLinecap="round" />
        )}
        {el(
          "anim-antenna-tip-left",
          <Circle cx={65} cy={15} r={4} fill="#DD614A" />
        )}
        {/* Right antenna */}
        {el(
          "anim-antenna-rod-right",
          <Line x1={135} y1={45} x2={135} y2={15}
                stroke="#777777" strokeWidth={3} strokeLinecap="round" />
        )}
        {el(
          "anim-antenna-tip-right",
          <Circle cx={135} cy={15} r={4} fill="#DD614A" />
        )}
      </G>

      {/* ── Body — rounded rectangle ── */}
      <Rect
        x={20} y={40} width={160} height={160}
        rx={24} ry={24}
        fill="url(#bodyGrad)" stroke="#555555" strokeWidth={2}
      />

      {/* ── Face plate — slightly inset ── */}
      <Rect
        x={32} y={52} width={136} height={136}
        rx={16} ry={16}
        fill="url(#faceGrad)" stroke="#444444" strokeWidth={1}
      />

      {/* ── Left eye knob ── */}
      <G>
        <Circle cx={70} cy={90} r={22}
                fill="#2A2A2A" stroke="#555555" strokeWidth={2} />
        <Circle cx={70} cy={90} r={13.2}
                fill="#1A1A1A" stroke="#444444" strokeWidth={1} />
        {el(
          "anim-eye-pointer-left",
          <Line x1={70} y1={90} x2={70} y2={74.6}
                stroke="#DD614A" strokeWidth={3} strokeLinecap="round" />
        )}
        <Circle cx={70} cy={90} r={2.64} fill="#DD614A" />
      </G>

      {/* ── Right eye knob ── */}
      <G>
        <Circle cx={130} cy={90} r={22}
                fill="#2A2A2A" stroke="#555555" strokeWidth={2} />
        <Circle cx={130} cy={90} r={13.2}
                fill="#1A1A1A" stroke="#444444" strokeWidth={1} />
        {el(
          "anim-eye-pointer-right",
          <Line x1={130} y1={90} x2={130} y2={74.6}
                stroke="#DD614A" strokeWidth={3} strokeLinecap="round" />
        )}
        <Circle cx={130} cy={90} r={2.64} fill="#DD614A" />
      </G>

      {/* ── Oscilloscope mouth ── */}
      <G>
        {/* Screen background */}
        <Rect x={45} y={125} width={110} height={50}
              rx={6} ry={6}
              fill="#0A1A0A" stroke="#555555" strokeWidth={2} />
        {/* Grid lines */}
        <Rect x={72.5} y={125} width={0.5} height={50} fill="#1A3A1A" />
        <Rect x={100} y={125} width={0.5} height={50} fill="#1A3A1A" />
        <Rect x={127.5} y={125} width={0.5} height={50} fill="#1A3A1A" />
        <Rect x={45} y={150} width={110} height={0.5} fill="#1A3A1A" />
        {/* Waveform */}
        {el(
          "anim-oscilloscope-wave",
          <Path d="M 45,150 L 155,150"
                stroke="#73A580" strokeWidth={2.5}
                fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </G>

      {/* ── Speaker grille ── */}
      <G>
        <Rect x={30} y={205} width={140} height={30}
              rx={8} ry={8}
              fill="#2A2A2A" stroke="#444444" strokeWidth={1} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect key={`a${i}`} x={50 + i * 24} y={211} width={16} height={2} rx={1} fill="#444444" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect key={`b${i}`} x={50 + i * 24} y={218} width={16} height={2} rx={1} fill="#444444" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <Rect key={`c${i}`} x={50 + i * 24} y={225} width={16} height={2} rx={1} fill="#444444" />
        ))}
      </G>

      {/* ── Power indicator LED ── */}
      {el(
        "anim-power-led",
        <Circle cx={168} cy={55} r={4} fill="#333333" />
      )}
    </G>
  );
}
