import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { AppButton } from "@/components/app-button";
import { LineSelectorRow } from "@/components/line-selector-row";
import { Collapsible } from "@/components/ui/collapsible";
import { UpdateDebugBadge } from "@/components/update-debug-badge";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useEffect, useRef, useState } from "react";
import { AppState, StatusBar, StyleSheet, Text, View } from "react-native";
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
  const { status, errorMessage, pingCount, lastPingAt, session, start, stop } =
    useGpsPing();
  const [breakdownOn, setBreakdownOn] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
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

  // Vérifie la permission au montage ET quand l'utilisateur revient depuis les réglages système
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
      stop();
      return;
    }
    start(line, 0);
  }

  async function toggleBreakdown() {
    if (breakdownOn) {
      setBreakdownOn(false);
      if (breakdownTimer.current) clearTimeout(breakdownTimer.current);
      return;
    }
    const r = await sendReport(line, 0);
    if (r === "ok" || r === "duplicate") {
      setBreakdownOn(true);
      breakdownTimer.current = setTimeout(
        () => setBreakdownOn(false),
        10 * 60 * 1000,
      );
    } else {
      setReportMsg("Connecte-toi d'abord au réseau");
    }
  }

  const buttonTitle =
    status === "connected"
      ? "Je me déconnecte du réseau"
      : status === "error"
        ? "Réessayer"
        : "Je me connecte au réseau";

  const statusCfg = STATUS_CONFIG[status];
  const lastPingLabel = lastPingAt
    ? `Dernier envoi à ${lastPingAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
    : null;

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
              réglages de ton téléphone pour pouvoir partager ta position.
            </Text>
          </View>
        )}

        {/* Carte d'état : seule source de vérité visuelle, toujours visible */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: statusCfg.color }]} />
            <Text style={styles.statusLabel}>{statusCfg.label}</Text>
          </View>
          {status === "connected" && (
            <>
              <Text style={styles.statusDetail}>
                Contributions envoyées : {pingCount}
              </Text>
              {lastPingLabel && (
                <Text style={styles.statusDetail}>{lastPingLabel}</Text>
              )}
            </>
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
          variant="primary"
        />

        <View style={{ height: spacing.lg }} />

        <View style={styles.card}>
          <AppButton
            title={breakdownOn ? "✓ Panne signalée" : "Signaler une panne"}
            onPress={toggleBreakdown}
            disabled={status !== "connected"}
            variant={breakdownOn ? "primary" : "secondary"}
          />
          {reportMsg && <Text style={styles.statsText}>{reportMsg}</Text>}
        </View>

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
      </View>
      <UpdateDebugBadge />
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
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  point: {
    fontSize: fontSize.base,
    lineHeight: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statsText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
