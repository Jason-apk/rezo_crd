import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { AppButton } from "@/components/app-button";
import { LineSelectorRow } from "@/components/line-selector-row";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAvailableLines, getStops, type StopItem } from "../../../lib/stops";

const lines = getAvailableLines();

export default function Wait() {
  const router = useRouter();
  const [line, setLine] = useState<string>(lines[0]?.number ?? "");
  const [stopId, setStopId] = useState<string | null>(null);
  const [stops, setStops] = useState<StopItem[]>(() =>
    lines[0] ? getStops(lines[0].number) : [],
  );

  useEffect(() => {
    setStopId(null);
    setStops(line ? getStops(line) : []);
  }, [line]);

  const selectedStop = stops.find((s) => s.id === stopId);

  function confirm() {
    if (!line || !stopId) return;
    router.push({ pathname: "/eta", params: { line, stopId } });
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Choisis ton arrêt</Text>

        <LineSelectorRow lines={lines} selected={line} onSelect={setLine} />

        <View style={styles.selectedBox}>
          <Text style={styles.selectedLabel}>Arrêt sélectionné</Text>
          <Text style={styles.selectedName}>
            {selectedStop ? selectedStop.name : "Choisis un arrêt ci-dessous"}
          </Text>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {stops.map((stop) => {
            const active = stop.id === stopId;
            return (
              <Pressable
                key={stop.id}
                onPress={() => setStopId(stop.id)}
                style={[styles.stopRow, active && styles.stopRowActive]}
              >
                <Text style={styles.stopName}>{stop.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppButton
          title="Voir les bus"
          onPress={confirm}
          disabled={!stopId}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  selectedBox: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  selectedLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  selectedName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 2,
  },
  stopRow: {
    padding: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  stopRowActive: { borderColor: colors.primary },
  stopName: { fontSize: fontSize.md, color: colors.textPrimary },
});
