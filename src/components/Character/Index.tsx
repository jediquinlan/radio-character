import React, { useMemo } from "react";
import Svg from "react-native-svg";
import { useMachine } from "@xstate/react";
import { characterMachine } from "../../machines/characterMachine";
import { useCharacterLogic } from "../../hooks/useCharacterLogic";
import { CharacterTemplate } from "./CharacterTemplate";
import { useAnimationBindings } from "./animationBindings";
import type { CharacterEvent } from "../../machines/characterMachine";

interface CharacterProps {
  /** Width of the character SVG */
  width?: number;
  /** Height of the character SVG */
  height?: number;
  /** External ref to send events to the state machine */
  onActorRef?: (send: (event: CharacterEvent) => void) => void;
}

export function Character({
  width = 200,
  height = 240,
  onActorRef,
}: CharacterProps) {
  const [, send, actorRef] = useMachine(characterMachine);
  const animValues = useCharacterLogic(actorRef);
  const bindings = useAnimationBindings(animValues);

  React.useEffect(() => {
    onActorRef?.(send);
  }, [send, onActorRef]);

  // Build override map: swap static template elements with animated versions
  const overrides = useMemo(() => {
    const map: Record<string, React.ReactElement> = {};
    for (const [id, binding] of Object.entries(bindings)) {
      const Comp = binding.Component;
      map[id] = (
        <Comp
          key={id}
          {...binding.staticProps}
          animatedProps={binding.animatedProps}
        />
      );
    }
    return map;
  }, [bindings]);

  return (
    <Svg width={width} height={height} viewBox="0 0 200 240">
      <CharacterTemplate overrides={overrides} />
    </Svg>
  );
}
