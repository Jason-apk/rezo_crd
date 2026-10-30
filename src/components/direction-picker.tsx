// src/components/direction-picker.tsx
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, View } from "react-native";

type Props = {
  selected: 0 | 1;
  onSelect: (d: 0 | 1) => void;
  disabled?: boolean;
};

export function DirectionPicker({ selected, onSelect, disabled }: Props) {
  const theme = useTheme();
  const options: { value: 0 | 1; label: string }[] = [
    { value: 0, label: "Aller" },
    { value: 1, label: "Retour" },
  ];

  return (
    <View style={{ flexDirection: "row", gap: Spacing.two }}>
      {options.map((o) => {
        const active = o.value === selected;
        return (
          <Pressable
            key={o.value}
            onPress={() => onSelect(o.value)}
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
              {o.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
