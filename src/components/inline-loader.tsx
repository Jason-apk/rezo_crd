import { useTheme } from "@/hooks/use-theme";
import { ActivityIndicator } from "react-native";

export function InlineLoader({
  size = "small" as "small" | "large",
}: {
  size?: "small" | "large";
}) {
  const theme = useTheme();
  return <ActivityIndicator size={size} color={theme.tint} />;
}
