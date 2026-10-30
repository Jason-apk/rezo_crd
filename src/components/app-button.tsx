import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary"; // primary = action principale, secondary = action secondaire
};

export function AppButton({
  title,
  onPress,
  disabled,
  variant = "secondary",
}: Props) {
  const theme = useTheme();
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        {
          backgroundColor: isPrimary ? theme.text : theme.backgroundElement,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <ThemedText
        type="smallBold"
        style={{ color: isPrimary ? theme.background : theme.text }}
      >
        {title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 10,
    alignItems: "center",
  },
});
