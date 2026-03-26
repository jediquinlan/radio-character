# @radio-lingo/character

Animated radio-themed character face for React Native. Library package — not a standalone app.

## Stack

- **XState v5** — state machine drives character behavior (idle, listening, thinking, transmitting, error)
- **React Native Reanimated** — spring/timing animations on the UI thread
- **React Native SVG** — all rendering via SVG primitives
- **TypeScript** — strict mode

## Architecture

- `src/machines/characterMachine.ts` — XState machine defining states, transitions, and context (intensity, isPowerOn)
- `src/hooks/useCharacterLogic.ts` — maps machine state to Reanimated shared values (eye rotation, antenna displacement, oscilloscope amplitude/frequency)
- `src/components/Character/` — SVG components (Index, EyeKnob, Antenna, Oscilloscope)
- `src/index.ts` — public API exports

## Commands

```sh
npm run typecheck   # tsc --noEmit
```

## Notes

- This is a **library** consumed via peer dependencies (react-native, reanimated, react-native-svg). There is no bundled app or dev server.
- Character events: POWER_ON, POWER_OFF, START_LISTENING, START_THINKING, START_TRANSMITTING, TRIGGER_ERROR, RESET, SET_INTENSITY
