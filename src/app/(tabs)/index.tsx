import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { LineSelectorRow } from "@/components/line-selector-row";
import { PowerButton } from "@/components/power-button";
import { ReportFab } from "@/components/report-fab";
import { WhatsAppButton } from "@/components/whatsapp-button";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { distanceToNearestStop } from "../../../lib/geofence";
import {
  getLocationPermissionState,
  type PermissionState,
} from "../../../lib/permissions";
import { sendReport } from "../../../lib/reports";
import { getAvailableLines, getLineName } from "../../../lib/stops";
import { useGpsPing } from "../../../lib/useGpsping";

const lines = getAvailableLines();
const OFF_LINE_THRESHOLD_M = 100;

export default function Home() {
  const [line, setLine] = useState<string>(lines[0]?.number ?? "");
  const { status, errorMessage, pingCount, session, start, stop } =
    useGpsPing();
  const [breakdownOn, setBreakdownOn] = useState(false);
  const breakdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [locationState, setLocationState] =
    useState<PermissionState>("unknown");

  useEffect(() => {
    if (session) setLine(session.line);
  }, [session]);
  useEffect(
    () => () => {
      if (breakdownTimer.current) clearTimeout(breakdownTimer.current);
    },
    [],
  );

  useEffect(() => {
    const check = () => getLocationPermissionState().then(setLocationState);
    check();
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") check();
    });
    return () => sub.remove();
  }, []);

  async function handlePowerPress() {
    if (status === "connected") {
      Alert.alert(
        "Te déconnecter du réseau ?",
        "Tu arrêteras de partager ta position.",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Me déconnecter",
            style: "destructive",
            onPress: () => stop(),
          },
        ],
      );
      return;
    }

    // Vérification de position AVANT la confirmation de démarrage
    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const dist = distanceToNearestStop(
        line,
        pos.coords.latitude,
        pos.coords.longitude,
      );
      if (dist !== null && dist > OFF_LINE_THRESHOLD_M) {
        Alert.alert(
          "Es-tu bien sur cette ligne ?",
          `Ta position semble loin du trajet de ${getLineName(line)}. Veux-tu quand même commencer le partage ?`,
          [
            { text: "Annuler", style: "cancel" },
            { text: "Oui, commencer", onPress: confirmStart },
          ],
        );
        return;
      }
    } catch {
      // position indisponible : on laisse la confirmation normale décider,
      // startBackgroundPing gérera le refus de permission le cas échéant
    }

    confirmStart();
  }

  function confirmStart() {
    Alert.alert(
      "Commencer le partage ?",
      `Tu vas partager la position du bus sur la ligne ${getLineName(line)}.`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Commencer", onPress: () => start(line, 0) },
      ],
    );
  }

  function handleReportPress() {
    if (status !== "connected") {
      Alert.alert(
        "Connecte-toi d'abord",
        "Tu dois partager ta position pour signaler une panne.",
      );
      return;
    }
    Alert.alert(
      "Signaler une panne ?",
      "Les autres usagers verront que ton bus semble à l'arrêt ou en panne.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Signaler", style: "destructive", onPress: confirmReport },
      ],
    );
  }

  async function confirmReport() {
    const r = await sendReport(line, 0);
    if (r === "ok" || r === "duplicate") {
      setBreakdownOn(true);
      breakdownTimer.current = setTimeout(
        () => setBreakdownOn(false),
        10 * 60 * 1000,
      );
    } else {
      Alert.alert(
        "Échec",
        "Le signalement n'a pas pu être envoyé. Réessaie dans un instant.",
      );
    }
  }

  const bottomLabel =
    status === "connected"
      ? "Toucher pour arrêter le partage"
      : "Commencer le partage";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Réseau REZO</Text>
          <WhatsAppButton variant="corner" />
        </View>

        <LineSelectorRow
          lines={lines}
          selected={line}
          onSelect={setLine}
          disabled={status === "connected" || status === "connecting"}
        />

        {locationState === "denied" && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              📍 La localisation est désactivée pour REZO. Active-la dans les
              réglages pour partager ta position.
            </Text>
          </View>
        )}

        <View style={styles.centerZone}>
          <PowerButton
            connected={status === "connected"}
            onPress={handlePowerPress}
            disabled={status === "connecting"}
          />
          <Text style={styles.bottomLabel}>{bottomLabel}</Text>
          {status === "connected" && (
            <Text style={styles.statsText}>
              Contributions envoyées : {pingCount}
            </Text>
          )}
          {errorMessage && (
            <Text style={styles.statusError}>{errorMessage}</Text>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <ReportFab onPress={handleReportPress} active={breakdownOn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  warningBanner: {
    backgroundColor: "#FDECEA",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  warningText: { fontSize: fontSize.sm, color: colors.statusRose },
  centerZone: { alignItems: "center", marginTop: spacing.xl, gap: spacing.sm },
  bottomLabel: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statsText: { fontSize: fontSize.sm, color: colors.textSecondary },
  statusError: {
    fontSize: fontSize.sm,
    color: colors.statusRose,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
