import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { AppButton } from "@/components/app-button";
import { FeedbackOverlay } from "@/components/feedback-overlay";
import { InlineLoader } from "@/components/inline-loader";
import { usePostTripFeedback } from "@/hooks/usePostTripFeedback";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEta, type RankedBus } from "../../lib/eta";
import { getLineName, getStops } from "../../lib/stops";

function statusColor(bus: RankedBus) {
  if (bus.status === "GREEN") return colors.statusGreen;
  if (bus.status === "ORANGE") return colors.statusAmber;
  return colors.statusRose;
}

function label(bus: RankedBus) {
  if (bus.reported_breakdown && bus.stalled) return "En panne";
  if (bus.minutes <= 0) return "Arrivé";
  return `${bus.minutes} min`;
}

export default function Eta() {
  const router = useRouter();
  const [dismissedCount, setDismissedCount] = useState(0);

  const { line, stopId } = useLocalSearchParams<{
    line: string;
    stopId: string;
  }>();
  const { buses, loading, offline } = useEta(stopId ?? null, line ?? null);

  const stopName = line
    ? getStops(line).find((s) => s.id === stopId)?.name
    : undefined;
  // la liste affichée ignore les N premiers bus "traités"
  const visibleBuses = buses.slice(dismissedCount);
  const top = visibleBuses[0];
  const rest = visibleBuses.slice(1);

  const arrived = !!top && top.minutes <= 0 && !top.stalled;
  const { showFeedback, respond } = usePostTripFeedback(arrived);

  async function handleFeedback(positive: boolean) {
    await respond(positive);
    setDismissedCount((n) => n + 1); // on passe au bus suivant de la liste
  }

  let variant: "normal" | "panne" | "arrived" | "offline" | "no_tracking" =
    "normal";
  if (offline) variant = "offline";
  else if (!top) variant = "no_tracking";
  else if (top.reported_breakdown && top.stalled) variant = "panne";
  else if (arrived) variant = "arrived";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, marginTop: 20 }}
      edges={["top"]}
    >
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={colors.background}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerLine}>{line ? getLineName(line) : ""}</Text>
          {stopName && (
            <Text style={styles.headerStop}>Arrêt : {stopName}</Text>
          )}
        </View>
        <AlertZone variant={variant} />
        <View style={styles.etaZone}>
          {loading ? (
            <InlineLoader />
          ) : variant === "panne" ? (
            <Text style={styles.etaMessage}>
              En attente d'un bus disponible
            </Text>
          ) : variant === "offline" ? (
            <Text style={styles.etaMessage}>Pas de connexion internet</Text>
          ) : variant === "no_tracking" ? (
            <Text style={styles.etaMessage}>
              Aucun suivi disponible pour le moment
            </Text>
          ) : variant === "arrived" ? (
            <Text style={styles.etaMessage}>Le bus est arrivé à ton arrêt</Text>
          ) : (
            <>
              <Text style={styles.etaBusLabel}>Bus 1</Text>
              <Text style={[styles.etaNumber, { color: statusColor(top!) }]}>
                {top!.minutes} min
              </Text>
            </>
          )}
        </View>
        {rest.length > 0 && (
          <ScrollView
            style={styles.rankingList}
            showsVerticalScrollIndicator={false}
          >
            {rest.map((bus, i) => (
              <View key={i} style={styles.rankingRow}>
                <Text style={styles.rankingText}>Bus {i + 2}</Text>
                <Text style={[styles.rankingText, { color: statusColor(bus) }]}>
                  {label(bus)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
        {showFeedback && <FeedbackOverlay onRespond={handleFeedback} />}
      </View>
      <View style={{ marginBottom: 60 }}>
        <AppButton title="← Changer d'arrêt" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

function AlertZone({ variant }: { variant: string }) {
  if (variant === "panne")
    return (
      <View style={[styles.alertCard, { borderLeftColor: colors.statusRose }]}>
        <Text style={styles.alertLabel}>Alerte</Text>
        <Text style={styles.alertMessage}>
          Ce bus rencontre un souci, on suit le suivant pour toi
        </Text>
      </View>
    );
  if (variant === "no_tracking")
    return (
      <View style={[styles.alertCard, { borderLeftColor: colors.statusGray }]}>
        <Text style={styles.alertLabel}>Info</Text>
        <Text style={styles.alertMessage}>
          Pas encore de bus détecté sur cette ligne
        </Text>
      </View>
    );
  if (variant === "arrived")
    return (
      <View style={[styles.alertCard, { borderLeftColor: colors.statusGreen }]}>
        <Text style={styles.alertLabel}>Info</Text>
        <Text style={styles.alertMessage}>Le bus est à ton arrêt</Text>
      </View>
    );
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.sm },
  header: { alignItems: "center", marginTop: spacing.xs },
  headerLine: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerStop: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 25,
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: colors.backgroundCard,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  alertLabel: {
    fontWeight: "700",
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  alertMessage: { fontSize: fontSize.base, color: colors.textPrimary, flex: 1 },
  etaZone: { flex: 1, alignItems: "center", justifyContent: "center" },
  etaNumber: { fontSize: fontSize.hugeX, fontWeight: "bold" },
  etaMessage: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },
  etaBusLabel: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rankingList: {
    maxHeight: 160,
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rankingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  rankingText: { fontSize: fontSize.base, color: colors.textPrimary },
});
