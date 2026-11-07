import { colors, fontSize, spacing } from "@/../theme/tokens";
import { AppButton } from "@/components/app-button";
import { LineSelectorRow } from "@/components/line-selector-row";
import { Collapsible } from "@/components/ui/collapsible";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { useEffect, useRef, useState } from "react";
import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { humanizePingError } from "../../../lib/errorMessages";
import { sendReport } from "../../../lib/reports";
import { getAvailableLines } from "../../../lib/stops";
import { useGpsPing } from "../../../lib/useGpsping";

const lines = getAvailableLines();

export default function Home() {
  const [line, setLine] = useState<string>(lines[0]?.number ?? "");
  const { active, pingCount, session, lastError, start, stop } = useGpsPing();
  const [starting, setStarting] = useState(false);
  const [breakdownOn, setBreakdownOn] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const breakdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [connectMsg, setConnectMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session) setLine(session.line);
  }, [session]);
  useEffect(
    () => () => {
      if (breakdownTimer.current) clearTimeout(breakdownTimer.current);
    },
    [],
  );

  async function handleToggleConnect() {
    if (active) {
      await stop();
      return;
    }
    setStarting(true);
    try {
      await start(line, 0);
    } catch (e: any) {
      setConnectMsg(
        e.message ?? "Impossible de se connecter au réseau. Réessaie.",
      );
    } finally {
      setStarting(false);
    }
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
        <View style={styles.header}>
          <Text style={styles.title}>Acceder au Rezo</Text>
          <WhatsAppButton variant="corner" />
        </View>

        <LineSelectorRow
          lines={lines}
          selected={line}
          onSelect={setLine}
          disabled={active}
        />

        <View style={{ height: spacing.lg }} />

        <AppButton
          title={
            active ? "Je me déconnecte du réseau" : "Je me connecte au réseau"
          }
          onPress={handleToggleConnect}
          loading={starting}
          variant="primary"
        />
        {connectMsg && <Text style={styles.errorText}>{connectMsg}</Text>}
        <AppButton
          title={
            active ? "Je me déconnecte du réseau" : "Je me connecte au réseau"
          }
          onPress={handleToggleConnect}
          loading={starting}
          variant="primary"
        />

        <Text style={styles.statsText}>
          Contributions envoyées : {pingCount}
        </Text>
        {lastError && (
          <Text style={styles.errorText}>{humanizePingError(lastError)}</Text>
        )}
        <View style={{ height: spacing.lg }} />

        <AppButton
          title={breakdownOn ? "✓ Panne signalée" : "Signaler une panne"}
          onPress={toggleBreakdown}
          disabled={!active}
          variant={breakdownOn ? "primary" : "secondary"}
        />
        {reportMsg && <Text style={styles.statsText}>{reportMsg}</Text>}

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
  errorText: {
    fontSize: fontSize.sm,
    color: colors.statusRose,
    textAlign: "center",
    marginTop: spacing.xs,
  },
});
