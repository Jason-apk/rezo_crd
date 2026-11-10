import { colors, spacing } from "@/../theme/tokens";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = { onPress: () => void; active: boolean; disabled?: boolean };

export function ReportFab({ onPress, active, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.fab,
        {
          backgroundColor: active ? colors.statusRose : colors.backgroundCard,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={{ fontSize: 22 }}>{active ? "✓" : "⚠️"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
