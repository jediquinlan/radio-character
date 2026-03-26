import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useMachine } from "@xstate/react";
import { characterMachine } from "../../machines/characterMachine";
import { useCharacterLogic } from "../../hooks/useCharacterLogic";
import type { CharacterEvent } from "../../machines/characterMachine";

interface CharacterProps {
  width?: number;
  height?: number;
  onActorRef?: (send: (event: CharacterEvent) => void) => void;
}

const COLORS = {
  bodyDark: "#2A2A2A",
  bodyLight: "#3A3A3A",
  facePlate: "#303030",
  faceBorder: "#444444",
  eyeOuter: "#2A2A2A",
  eyeOuterBorder: "#555555",
  eyeInner: "#1A1A1A",
  eyeInnerBorder: "#444444",
  coral: "#DD614A",
  antenna: "#777777",
  oscScreen: "#0A1A0A",
  oscGrid: "#1A3A1A",
  oscWave: "#73A580",
  speaker: "#2A2A2A",
  speakerLine: "#444444",
  ledOn: "#73A580",
  ledOff: "#333333",
};

export function Character({
  width = 200,
  height = 240,
  onActorRef,
}: CharacterProps) {
  const [, send, actorRef] = useMachine(characterMachine);
  const anim = useCharacterLogic(actorRef);

  useEffect(() => {
    onActorRef?.(send);
  }, [send, onActorRef]);

  const scale = width / 200;

  return (
    <View style={{ width, height }}>
      <View style={{ transform: [{ scale }], transformOrigin: "top left", width: 200, height: 240 }}>
        {/* Antennae */}
        <Antenna side="left" displacement={anim.antennaDisplacement} />
        <Antenna side="right" displacement={anim.antennaDisplacement} />

        {/* Body */}
        <View style={s.body} />

        {/* Face plate */}
        <View style={s.face} />

        {/* Power LED */}
        <View style={[s.led, { backgroundColor: anim.isPowerOn ? COLORS.ledOn : COLORS.ledOff }]} />

        {/* Eyes */}
        <EyeKnob cx={70} rotation={anim.eyeRotation} mirror={false} />
        <EyeKnob cx={130} rotation={anim.eyeRotation} mirror={true} />

        {/* Oscilloscope mouth */}
        <OscilloscopeMouth amplitude={anim.oscilloscopeAmplitude} isPowerOn={anim.isPowerOn} />

        {/* Speaker grille */}
        <View style={s.speaker}>
          {[0, 1, 2].map((row) => (
            <View key={row} style={s.speakerRow}>
              {[0, 1, 2, 3, 4].map((col) => (
                <View key={col} style={s.speakerSlot} />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/** Antenna rod + tip ball */
function Antenna({ side, displacement }: { side: "left" | "right"; displacement: Animated.Value }) {
  const baseX = side === "left" ? 62 : 132;

  const tipY = displacement.interpolate({
    inputRange: [0, 1],
    outputRange: [15, -10],
  });

  const rodHeight = displacement.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 55],
  });

  return (
    <View style={{ position: "absolute", left: baseX, top: 0, width: 8, height: 50, alignItems: "center" }}>
      {/* Rod */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          width: 3,
          backgroundColor: COLORS.antenna,
          borderRadius: 1.5,
          height: rodHeight,
        }}
      />
      {/* Tip ball */}
      <Animated.View
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: COLORS.coral,
          top: tipY,
        }}
      />
    </View>
  );
}

/** Eye knob with rotating pointer */
function EyeKnob({ cx, rotation, mirror }: { cx: number; rotation: Animated.Value; mirror: boolean }) {
  const pointerRotation = rotation.interpolate({
    inputRange: [-Math.PI, Math.PI],
    outputRange: mirror ? ["180deg", "-180deg"] : ["-180deg", "180deg"],
  });

  return (
    <View style={[s.eyeContainer, { left: cx - 22 }]}>
      {/* Outer ring */}
      <View style={s.eyeOuter}>
        {/* Inner ring */}
        <View style={s.eyeInner}>
          {/* Pointer (rotates) */}
          <Animated.View
            style={[
              s.eyePointerContainer,
              { transform: [{ rotate: pointerRotation }] },
            ]}
          >
            <View style={s.eyePointer} />
          </Animated.View>
          {/* Center dot */}
          <View style={s.eyeCenter} />
        </View>
      </View>
    </View>
  );
}

/** Oscilloscope mouth with animated bar visualization */
function OscilloscopeMouth({ amplitude, isPowerOn }: { amplitude: Animated.Value; isPowerOn: boolean }) {
  const [bars] = useState(() =>
    Array.from({ length: 11 }, (_, i) => {
      // Pre-compute a sine-like envelope for the bars
      const t = i / 10;
      const envelope = Math.sin(t * Math.PI);
      return { key: i, envelope };
    })
  );

  // Animate a time value for wave motion
  const time = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPowerOn) {
      const loop = Animated.loop(
        Animated.timing(time, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      );
      loop.start();
      return () => loop.stop();
    } else {
      time.setValue(0);
    }
  }, [isPowerOn]);

  return (
    <View style={s.oscContainer}>
      {/* Screen background */}
      <View style={s.oscScreen}>
        {/* Grid lines */}
        <View style={[s.oscGridV, { left: "25%" }]} />
        <View style={[s.oscGridV, { left: "50%" }]} />
        <View style={[s.oscGridV, { left: "75%" }]} />
        <View style={s.oscGridH} />

        {/* Wave bars */}
        <View style={s.oscBars}>
          {bars.map(({ key, envelope }) => {
            const barHeight = Animated.multiply(
              amplitude,
              envelope * 40
            );
            const barTop = Animated.subtract(20, Animated.divide(barHeight, 2));

            return (
              <Animated.View
                key={key}
                style={{
                  width: 6,
                  borderRadius: 3,
                  backgroundColor: COLORS.oscWave,
                  height: Animated.add(barHeight, 2),
                  marginTop: barTop,
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  body: {
    position: "absolute",
    left: 20,
    top: 40,
    width: 160,
    height: 160,
    borderRadius: 24,
    backgroundColor: COLORS.bodyLight,
    borderWidth: 2,
    borderColor: "#555555",
  },
  face: {
    position: "absolute",
    left: 32,
    top: 52,
    width: 136,
    height: 136,
    borderRadius: 16,
    backgroundColor: COLORS.facePlate,
    borderWidth: 1,
    borderColor: COLORS.faceBorder,
  },
  led: {
    position: "absolute",
    left: 164,
    top: 51,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eyeContainer: {
    position: "absolute",
    top: 68,
    width: 44,
    height: 44,
  },
  eyeOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.eyeOuter,
    borderWidth: 2,
    borderColor: COLORS.eyeOuterBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  eyeInner: {
    width: 26.4,
    height: 26.4,
    borderRadius: 13.2,
    backgroundColor: COLORS.eyeInner,
    borderWidth: 1,
    borderColor: COLORS.eyeInnerBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  eyePointerContainer: {
    position: "absolute",
    width: 3,
    height: 15.4,
    bottom: "50%",
    transformOrigin: "center bottom",
  },
  eyePointer: {
    width: 3,
    height: 15.4,
    borderRadius: 1.5,
    backgroundColor: COLORS.coral,
  },
  eyeCenter: {
    width: 5.28,
    height: 5.28,
    borderRadius: 2.64,
    backgroundColor: COLORS.coral,
  },
  oscContainer: {
    position: "absolute",
    left: 45,
    top: 125,
    width: 110,
    height: 50,
  },
  oscScreen: {
    width: 110,
    height: 50,
    borderRadius: 6,
    backgroundColor: COLORS.oscScreen,
    borderWidth: 2,
    borderColor: "#555555",
    overflow: "hidden",
  },
  oscGridV: {
    position: "absolute",
    top: 0,
    width: 0.5,
    height: 50,
    backgroundColor: COLORS.oscGrid,
  },
  oscGridH: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: 110,
    height: 0.5,
    backgroundColor: COLORS.oscGrid,
  },
  oscBars: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-evenly",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  speaker: {
    position: "absolute",
    left: 30,
    top: 205,
    width: 140,
    height: 30,
    borderRadius: 8,
    backgroundColor: COLORS.speaker,
    borderWidth: 1,
    borderColor: COLORS.speakerLine,
    justifyContent: "space-evenly",
    paddingHorizontal: 16,
  },
  speakerRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  speakerSlot: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.speakerLine,
  },
});
