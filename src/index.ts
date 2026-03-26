// Components
export { Character } from "./components/Character/Index";

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
