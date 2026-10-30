// src/components/line-picker.tsx
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, View } from "react-native";
import type { Line } from "../../lib/lines";

type Props = {
  lines: Line[];
  selected: string | null;
  onSelect: (number: string) => void;
  disabled?: boolean;
};

export function LinePicker({ lines, selected, onSelect, disabled }: Props) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
      {lines.map((line) => {
        const active = line.number === selected;
        return (
          <Pressable
            key={line.id}
            onPress={() => onSelect(line.number)}
            disabled={disabled}
            style={{
              paddingVertical: Spacing.two,
              paddingHorizontal: Spacing.three,
              borderRadius: 10,
              backgroundColor: active
                ? theme.backgroundSelected
                : theme.backgroundElement,
              opacity: disabled && !active ? 0.5 : 1,
            }}
          >
            <ThemedText
              style={{ color: active ? theme.text : theme.textSecondary }}
            >
              {line.number}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
