import { setup, assign } from "xstate";

export type CharacterState = "normal" | "happy" | "sad";

export interface CharacterContext {
  /** Animation intensity from 0.0 (calm) to 1.0 (max energy) */
  intensity: number;
  /** Whether the character is "powered on" */
  isPowerOn: boolean;
}

export type CharacterEvent =
  | { type: "POWER_ON" }
  | { type: "POWER_OFF" }
  | { type: "SET_NORMAL" }
  | { type: "SET_HAPPY" }
  | { type: "SET_SAD" }
  | { type: "SET_INTENSITY"; intensity: number };

export const characterMachine = setup({
  types: {
    context: {} as CharacterContext,
    events: {} as CharacterEvent,
  },
}).createMachine({
  id: "character",
  initial: "normal",
  context: {
    intensity: 0.0,
    isPowerOn: true,
  },
  on: {
    SET_INTENSITY: {
      actions: assign({
        intensity: ({ event }) => Math.max(0, Math.min(1, event.intensity)),
      }),
    },
    POWER_OFF: {
      target: ".normal",
      actions: assign({ isPowerOn: false, intensity: 0 }),
    },
    POWER_ON: {
      target: ".normal",
      actions: assign({ isPowerOn: true }),
    },
  },
  states: {
    normal: {
      entry: assign({ intensity: 0.3 }),
      on: {
        SET_HAPPY: "happy",
        SET_SAD: "sad",
      },
    },
    happy: {
      entry: assign({ intensity: 0.8 }),
      on: {
        SET_NORMAL: "normal",
        SET_SAD: "sad",
      },
    },
    sad: {
      entry: assign({ intensity: 0.2 }),
      on: {
        SET_NORMAL: "normal",
        SET_HAPPY: "happy",
      },
    },
  },
});
