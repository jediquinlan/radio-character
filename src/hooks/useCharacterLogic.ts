import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { useSelector } from "@xstate/react";
import type { ActorRefFrom } from "xstate";
import type { characterMachine, CharacterState } from "../machines/characterMachine";

/** Map each state to a target eye rotation (radians) */
const EYE_ROTATION_MAP: Record<CharacterState, number> = {
  normal: 0,
  happy: Math.PI * 4, // 720 degrees
  sad: -Math.PI * 0.15,
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
  const antennaLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Stop any running antenna wiggle
    if (antennaLoopRef.current) {
      antennaLoopRef.current.stop();
      antennaLoopRef.current = null;
    }

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

    if (currentState === "happy") {
      // Normalize first so the 720° spin always starts fresh
      eyeRotation.setValue(0);
      Animated.timing(eyeRotation, {
        toValue: EYE_ROTATION_MAP.happy,
        duration: 2000,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }).start();

      // Continuous antenna wiggle
      const wiggle = Animated.loop(
        Animated.sequence([
          Animated.timing(antennaDisplacement, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
          Animated.timing(antennaDisplacement, {
            toValue: 0.2,
            duration: 300,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: false,
          }),
        ])
      );
      antennaLoopRef.current = wiggle;
      wiggle.start();
    } else {
      // Normalize eye rotation to [-PI, PI] so it doesn't unwind from 720°
      const listener = eyeRotation.addListener(({ value }) => {
        eyeRotation.removeListener(listener);
        const TWO_PI = Math.PI * 2;
        let normalized = ((value % TWO_PI) + TWO_PI) % TWO_PI;
        if (normalized > Math.PI) normalized -= TWO_PI;
        eyeRotation.setValue(normalized);

        Animated.spring(eyeRotation, {
          toValue: EYE_ROTATION_MAP[currentState],
          damping: 12,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: false,
        }).start();
      });

      Animated.spring(antennaDisplacement, {
        toValue: currentState === "sad" ? 0 : 0.2,
        damping: 8,
        stiffness: 200,
        mass: 1.2,
        useNativeDriver: false,
      }).start();
    }

    Animated.spring(oscilloscopeAmplitude, {
      toValue: OSCILLOSCOPE_AMP_MAP[currentState],
      damping: 15,
      stiffness: 100,
      useNativeDriver: false,
    }).start();
  }, [currentState, isPowerOn]);

  return {
    eyeRotation,
    antennaDisplacement,
    oscilloscopeAmplitude,
    currentState,
    isPowerOn,
  };
}
