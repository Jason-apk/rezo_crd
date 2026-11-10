import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { AppButton } from "@/components/app-button";
import { LineSelectorRow } from "@/components/line-selector-row";
import { ReportFab } from "@/components/report-fab";
import { Collapsible } from "@/components/ui/collapsible";
import { WhatsAppButton } from "@/components/whatsapp-button";
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
import {
  getLocationPermissionState,
  type PermissionState,
} from "../../../lib/permissions";
import { sendReport } from "../../../lib/reports";
import { getAvailableLines } from "../../../lib/stops";
import { useGpsPing } from "../../../lib/useGpsping";

const lines = getAvailableLines();

const STATUS_CONFIG = {
  disconnected: { color: colors.statusGray, label: "Non connecté" },
  connecting: { color: colors.statusAmber, label: "Connexion en cours…" },
  connected: {
    color: colors.statusGreen,
    label: "Connecté · tu partages ta position",
  },
  error: { color: colors.statusRose, label: "Problème de connexion" },
} as const;

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

  function handleTogglePress() {
    if (status === "connected") {
      Alert.alert(
        "Te déconnecter du réseau ?",
        "Tu arrêteras de partager ta position. Les autres usagers ne verront plus ta contribution.",
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
    start(line, 0);
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

  const buttonTitle =
    status === "connected"
      ? "Se déconnecter"
      : status === "error"
        ? "Réessayer"
        : "Se connecter";
  const buttonVariant = status === "connected" ? "danger" : "primary";
  const statusCfg = STATUS_CONFIG[status];

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

        {locationState === "denied" && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              📍 La localisation est désactivée pour REZO. Active-la dans les
              réglages pour partager ta position.
            </Text>
          </View>
        )}

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusCfg.color }]} />
            <Text style={styles.statusLabel}>{statusCfg.label}</Text>
          </View>
          {status === "connected" && (
            <Text style={styles.statusDetail}>
              Contributions envoyées : {pingCount}
            </Text>
          )}
          {errorMessage && (
            <Text style={styles.statusError}>{errorMessage}</Text>
          )}
        </View>

        <View style={{ height: spacing.md }} />

        <LineSelectorRow
          lines={lines}
          selected={line}
          onSelect={setLine}
          disabled={status === "connected" || status === "connecting"}
        />

        <View style={{ height: spacing.lg }} />

        <AppButton
          title={buttonTitle}
          onPress={handleTogglePress}
          loading={status === "connecting"}
          variant={buttonVariant}
        />

        <View style={{ flex: 1 }} />

        <Collapsible
          title="Comment marche REZO"
          subtitle="Une communauté qui partage l'info pour que personne n'attende dans le flou."
        >
          <Text style={styles.point}>
            📍 Ton téléphone indique discrètement la position du bus. Pas de
            compte, pas de données personnelles.
          </Text>
          <Text style={styles.point}>
            ⏱️ Avec ces infos, on calcule combien de temps il reste à attendre à
            chaque arrêt.
          </Text>
          <Text style={styles.point}>
            ⚠️ Si un bus tombe en panne, tu peux le signaler en un geste pour
            prévenir les autres.
          </Text>
          <Text style={styles.point}>
            🔒 Ta position reste anonyme : personne ne sait que c'est toi qui
            partages.
          </Text>
          <Text style={styles.point}>
            🤝 Plus on est nombreux à participer, plus les temps d'attente
            affichés sont justes.
          </Text>
        </Collapsible>

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
    marginBottom: spacing.sm,
  },
  warningText: { fontSize: fontSize.sm, color: colors.statusRose },
  statusCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  statusDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusError: {
    fontSize: fontSize.sm,
    color: colors.statusRose,
    marginTop: spacing.xs,
  },
  point: {
    fontSize: fontSize.base,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});
