import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
};

export function AppButton({
  title,
  onPress,
  disabled,
  loading,
  variant = "secondary",
}: Props) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: isPrimary ? colors.primary : colors.backgroundChip,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? colors.primaryText : colors.primary}
        />
      ) : (
        <Text
          style={{
            color: isPrimary ? colors.primaryText : colors.textPrimary,
            fontWeight: "600",
            fontSize: fontSize.base,
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
});
