import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useSelector } from "@xstate/react";
import type { ActorRefFrom } from "xstate";
import type { characterMachine, CharacterState } from "../machines/characterMachine";

/** Map each state to a target eye rotation (radians) */
const EYE_ROTATION_MAP: Record<CharacterState, number> = {
  normal: 0,
  happy: Math.PI * 0.15,
  sad: -Math.PI * 0.15,
};

/** Map each state to antenna displacement (0–1 normalized) */
const ANTENNA_MAP: Record<CharacterState, number> = {
  normal: 0.2,
  happy: 0.8,
  sad: 0,
};

/** Map each state to oscilloscope amplitude (0–1) */
const OSCILLOSCOPE_AMP_MAP: Record<CharacterState, number> = {
  normal: 0.2,
  happy: 0.7,
  sad: 0.05,
};

export interface CharacterAnimationValues {
  eyeRotation: Animated.Value;
  antennaDisplacement: Animated.Value;
  oscilloscopeAmplitude: Animated.Value;
  currentState: CharacterState;
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
  const isPowerOn = useSelector(actorRef, (s) => s.context.isPowerOn);

  const eyeRotation = useRef(new Animated.Value(0)).current;
  const antennaDisplacement = useRef(new Animated.Value(0.2)).current;
  const oscilloscopeAmplitude = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    if (!isPowerOn) {
      Animated.parallel([
        Animated.timing(eyeRotation, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(antennaDisplacement, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(oscilloscopeAmplitude, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.spring(eyeRotation, {
        toValue: EYE_ROTATION_MAP[currentState],
        damping: 12,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: false,
      }),
      Animated.spring(antennaDisplacement, {
        toValue: ANTENNA_MAP[currentState],
        damping: 8,
        stiffness: 200,
        mass: 1.2,
        useNativeDriver: false,
      }),
      Animated.spring(oscilloscopeAmplitude, {
        toValue: OSCILLOSCOPE_AMP_MAP[currentState],
        damping: 15,
        stiffness: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentState, isPowerOn]);

  return {
    eyeRotation,
    antennaDisplacement,
    oscilloscopeAmplitude,
    currentState,
    isPowerOn,
  };
}
