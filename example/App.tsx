import React, { useCallback, useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import type { CharacterEvent } from "../src";
import { Character } from "../src";

const STATES: { label: string; event: CharacterEvent }[] = [
  { label: "Normal", event: { type: "SET_NORMAL" } },
  { label: "Happy", event: { type: "SET_HAPPY" } },
  { label: "Sad", event: { type: "SET_SAD" } },
];

export default function App() {
  const [send, setSend] = useState<((e: CharacterEvent) => void) | null>(null);
  const [active, setActive] = useState("Normal");

  const handleActorRef = useCallback(
    (sendFn: (e: CharacterEvent) => void) => {
      setSend(() => sendFn);
    },
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Radio Character</Text>
      <Character width={200} height={240} onActorRef={handleActorRef} />
      <View style={styles.buttons}>
        {STATES.map(({ label, event }) => (
          <Pressable
            key={label}
            style={[styles.btn, active === label && styles.btnActive]}
            onPress={() => {
              send?.(event);
              setActive(label);
            }}
          >
            <Text
              style={[
                styles.btnText,
                active === label && styles.btnTextActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  title: {
    color: "#e0e0e0",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1,
  },
  buttons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#2a2a4a",
    borderWidth: 1,
    borderColor: "#444",
  },
  btnActive: {
    backgroundColor: "#3a5a8a",
    borderColor: "#6a9aea",
  },
  btnText: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
  },
  btnTextActive: {
    color: "#fff",
  },
});
