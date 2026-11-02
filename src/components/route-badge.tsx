import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { getDirectionLabel, getLineName } from "../../lib/stops";

type Props = { line: string | null; direction: 0 | 1 };

export function RouteBadge({ line, direction }: Props) {
  if (!line) return null;

  return (
    <ThemedView
      type="backgroundElement"
      style={{ borderRadius: 12, padding: Spacing.three, gap: Spacing.half }}
    >
      <ThemedText type="smallBold">
        {line} · {getLineName(line)}
      </ThemedText>
      <ThemedText themeColor="textSecondary" type="small">
        {getDirectionLabel(line, direction)}
      </ThemedText>
    </ThemedView>
  );
}
