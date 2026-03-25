import { setup, assign } from "xstate";

export type CharacterState =
  | "idle"
  | "listening"
  | "thinking"
  | "transmitting"
  | "error";

export interface CharacterContext {
  /** Animation intensity from 0.0 (calm) to 1.0 (max energy) */
  intensity: number;
  /** Whether the character is "powered on" */
  isPowerOn: boolean;
}

export type CharacterEvent =
  | { type: "POWER_ON" }
  | { type: "POWER_OFF" }
  | { type: "START_LISTENING" }
  | { type: "START_THINKING" }
  | { type: "START_TRANSMITTING"; intensity?: number }
  | { type: "TRIGGER_ERROR" }
  | { type: "RESET" }
  | { type: "SET_INTENSITY"; intensity: number };

export const characterMachine = setup({
  types: {
    context: {} as CharacterContext,
    events: {} as CharacterEvent,
  },
}).createMachine({
  id: "character",
  initial: "idle",
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
      target: ".idle",
      actions: assign({ isPowerOn: false, intensity: 0 }),
    },
    POWER_ON: {
      target: ".idle",
      actions: assign({ isPowerOn: true }),
    },
  },
  states: {
    idle: {
      entry: assign({ intensity: 0.2 }),
      on: {
        START_LISTENING: "listening",
        START_THINKING: "thinking",
        START_TRANSMITTING: {
          target: "transmitting",
          actions: assign({
            intensity: ({ event }) => event.intensity ?? 0.7,
          }),
        },
        TRIGGER_ERROR: "error",
      },
    },
    listening: {
      entry: assign({ intensity: 0.4 }),
      on: {
        START_THINKING: "thinking",
        START_TRANSMITTING: {
          target: "transmitting",
          actions: assign({
            intensity: ({ event }) => event.intensity ?? 0.7,
          }),
        },
        TRIGGER_ERROR: "error",
        RESET: "idle",
      },
    },
    thinking: {
      entry: assign({ intensity: 0.6 }),
      on: {
        START_TRANSMITTING: {
          target: "transmitting",
          actions: assign({
            intensity: ({ event }) => event.intensity ?? 0.8,
          }),
        },
        TRIGGER_ERROR: "error",
        RESET: "idle",
      },
    },
    transmitting: {
      entry: assign({ intensity: 0.8 }),
      on: {
        START_LISTENING: "listening",
        START_THINKING: "thinking",
        TRIGGER_ERROR: "error",
        RESET: "idle",
      },
    },
    error: {
      entry: assign({ intensity: 1.0 }),
      on: {
        RESET: "idle",
      },
    },
  },
});
