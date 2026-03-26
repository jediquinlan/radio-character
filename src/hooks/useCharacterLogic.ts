import { useEffect } from "react";
import { useSelector } from "@xstate/react";
import {
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import type { ActorRefFrom } from "xstate";
import type { characterMachine, CharacterState } from "../machines/characterMachine";

/** Spring config for snappy, mechanical dial movements */
const DIAL_SPRING = { damping: 12, stiffness: 180, mass: 0.8 };

/** Spring config for metallic antenna bounce */
const ANTENNA_SPRING = { damping: 8, stiffness: 200, mass: 1.2 };

/** Map each state to a target eye rotation (radians) */
const EYE_ROTATION_MAP: Record<CharacterState, number> = {
  normal: 0,
  happy: Math.PI * 0.15,       // slight upward turn
  sad: -Math.PI * 0.15,        // slight downward turn
};

/** Map each state to antenna displacement (0–1 normalized) */
const ANTENNA_MAP: Record<CharacterState, number> = {
  normal: 0.2,
  happy: 0.8,     // perky, raised
  sad: 0,         // droopy, flat
};

/** Map each state to oscilloscope amplitude (0–1) */
const OSCILLOSCOPE_AMP_MAP: Record<CharacterState, number> = {
  normal: 0.2,       // gentle idle wave
  happy: 0.7,        // energetic wave
  sad: 0.05,         // near-flatline
};

/** Map each state to oscilloscope frequency multiplier */
const OSCILLOSCOPE_FREQ_MAP: Record<CharacterState, number> = {
  normal: 1.5,
  happy: 3,          // fast, bouncy
  sad: 0.8,          // slow, sluggish
};

export interface CharacterAnimationValues {
  /** Eye-knob rotation target (radians) */
  eyeRotation: ReturnType<typeof useSharedValue<number>>;
  /** Antenna vertical displacement (0–1) */
  antennaDisplacement: ReturnType<typeof useSharedValue<number>>;
  /** Oscilloscope wave amplitude (0–1) */
  oscilloscopeAmplitude: ReturnType<typeof useSharedValue<number>>;
  /** Oscilloscope wave frequency multiplier */
  oscilloscopeFrequency: ReturnType<typeof useSharedValue<number>>;
  /** Global intensity from XState context (0–1) */
  intensity: ReturnType<typeof useSharedValue<number>>;
  /** Current state name as string */
  currentState: CharacterState;
  /** Whether powered on */
  isPowerOn: boolean;
}

type CharacterActorRef = ActorRefFrom<typeof characterMachine>;

export function useCharacterLogic(
  actorRef: CharacterActorRef
): CharacterAnimationValues {
  const currentState = useSelector(
    actorRef,
    (s) => s.value as CharacterState
  );
  const contextIntensity = useSelector(actorRef, (s) => s.context.intensity);
  const isPowerOn = useSelector(actorRef, (s) => s.context.isPowerOn);

  // Shared values — live on the UI thread
  const eyeRotation = useSharedValue(0);
  const antennaDisplacement = useSharedValue(0.2);
  const oscilloscopeAmplitude = useSharedValue(0.2);
  const oscilloscopeFrequency = useSharedValue(1.5);
  const intensity = useSharedValue(0);

  // React to state changes — push new targets to UI thread via springs/timings
  useEffect(() => {
    if (!isPowerOn) {
      eyeRotation.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) });
      antennaDisplacement.value = withTiming(0, { duration: 600 });
      oscilloscopeAmplitude.value = withTiming(0, { duration: 400 });
      oscilloscopeFrequency.value = withTiming(0, { duration: 400 });
      intensity.value = withTiming(0, { duration: 400 });
      return;
    }

    const targetEye = EYE_ROTATION_MAP[currentState];
    const targetAntenna = ANTENNA_MAP[currentState];
    const targetAmp = OSCILLOSCOPE_AMP_MAP[currentState];
    const targetFreq = OSCILLOSCOPE_FREQ_MAP[currentState];

    eyeRotation.value = withSpring(targetEye, DIAL_SPRING);
    antennaDisplacement.value = withSpring(targetAntenna, ANTENNA_SPRING);
    oscilloscopeAmplitude.value = withSpring(targetAmp, { damping: 15, stiffness: 100 });
    oscilloscopeFrequency.value = withTiming(targetFreq, { duration: 300 });
    intensity.value = withSpring(contextIntensity, { damping: 20, stiffness: 120 });
  }, [currentState, isPowerOn, contextIntensity]);

  return {
    eyeRotation,
    antennaDisplacement,
    oscilloscopeAmplitude,
    oscilloscopeFrequency,
    intensity,
    currentState,
    isPowerOn,
  };
}
