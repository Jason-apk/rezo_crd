import { colors } from "@/../theme/tokens";
import { ActivityIndicator } from "react-native";

export function InlineLoader({
  size = "small" as "small" | "large",
}: {
  size?: "small" | "large";
}) {
  return <ActivityIndicator size={size} color={colors.primary} />;
}
