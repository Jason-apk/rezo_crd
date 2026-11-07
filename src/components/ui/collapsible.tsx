import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { SymbolView } from "expo-symbols";
import { PropsWithChildren, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

type Props = PropsWithChildren & { title: string; subtitle?: string };

export function Collapsible({ children, title, subtitle }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.heading,
          pressed && styles.pressedHeading,
        ]}
        onPress={() => setIsOpen((v) => !v)}
      >
        <View style={styles.button}>
          <SymbolView
            name={{
              ios: "chevron.right",
              android: "chevron_right",
              web: "chevron_right",
            }}
            size={14}
            weight="bold"
            tintColor={colors.textPrimary}
            style={{ transform: [{ rotate: isOpen ? "-90deg" : "90deg" }] }}
          />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </Pressable>
      {isOpen && (
        <Animated.View entering={FadeIn.duration(200)}>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  pressedHeading: { opacity: 0.7 },
  titleBlock: { flex: 1, gap: 2 },
  title: {
    fontSize: fontSize.base,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary },
  button: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundChip,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    marginTop: spacing.sm,
    borderRadius: radius.md,
    marginLeft: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.backgroundChip,
    gap: spacing.sm,
  },
});

// Dans index.tsx, le style "point" passe de fontSize.sm à fontSize.base avec un lineHeight explicite
