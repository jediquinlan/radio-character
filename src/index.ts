// Components
export { Character } from "./components/Character/Index";
export { EyeKnob } from "./components/Character/EyeKnob";
export { Antenna } from "./components/Character/Antenna";
export { Oscilloscope } from "./components/Character/Oscilloscope";

// State machine
export { characterMachine } from "./machines/characterMachine";
export type {
  CharacterState,
  CharacterContext,
  CharacterEvent,
} from "./machines/characterMachine";

// Hooks
export { useCharacterLogic } from "./hooks/useCharacterLogic";
export type { CharacterAnimationValues } from "./hooks/useCharacterLogic";
