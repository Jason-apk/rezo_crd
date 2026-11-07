import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getLineName, type Line } from "../../lib/stops";

type Props = {
  lines: Line[];
  selected: string;
  onSelect: (number: string) => void;
  disabled?: boolean;
};

export function LineSelectorRow({
  lines,
  selected,
  onSelect,
  disabled,
}: Props) {
  return (
    <View>
      <View style={styles.row}>
        {lines.map((line) => {
          const active = line.number === selected;
          return (
            <Pressable
              key={line.number}
              onPress={() => onSelect(line.number)}
              disabled={disabled}
              style={[
                styles.button,
                {
                  backgroundColor: active
                    ? colors.primary
                    : colors.backgroundChip,
                  opacity: disabled && !active ? 0.5 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.primaryText : colors.textPrimary,
                  fontWeight: "700",
                }}
              >
                {line.number}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.name}>{getLineName(selected)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
  name: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
});
