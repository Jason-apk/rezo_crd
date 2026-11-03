import { AppButton } from "@/components/app-button";
import { DirectionPicker } from "@/components/direction-picker";
import { LinePicker } from "@/components/line-picker";
import { RouteBadge } from "@/components/route-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Spacing } from "@/constants/theme";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { sendReport } from "../../lib/reports";
import { getAvailableLines } from "../../lib/stops";
import { useGpsPing } from "../../lib/useGpsping";

const lines = getAvailableLines();

export default function Home() {
  const [line, setLine] = useState<string | null>(null);
  const [direction, setDirection] = useState<0 | 1>(0);
  const { active, pingCount, session, lastError, start, stop } = useGpsPing();
  const [starting, setStarting] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setLine(session.line);
      setDirection(session.direction);
    }
  }, [session]);

  async function handleToggle() {
    if (active) {
      await stop();
      return;
    }
    if (!line) return;
    setStarting(true);
    try {
      await start(line, direction);
    } finally {
      setStarting(false);
    }
  }

  async function handleReport() {
    if (!line) return;
    setReporting(true);
    try {
      const r = await sendReport(line, direction);
      setReportMsg(
        r === "ok"
          ? "Merci, ta contribution aide tout le réseau !"
          : r === "duplicate"
            ? "Déjà signalé récemment"
            : "Connecte-toi d'abord au réseau",
      );
    } catch (e: any) {
      setReportMsg("Échec : " + e.message);
    } finally {
      setReporting(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, marginTop: 50 }}
      //edges={["top"]
    >
      <ThemedView
        style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <ThemedText type="subtitle">Rejoins le réseau</ThemedText>
          <WhatsAppButton variant="corner" />
        </View>

        <LinePicker
          lines={lines}
          selected={line}
          onSelect={setLine}
          disabled={active}
        />
        <DirectionPicker
          selected={direction}
          onSelect={setDirection}
          disabled={active}
        />

        <RouteBadge line={line} direction={direction} />

        <AppButton
          title={
            active ? "Je me déconnecte du réseau" : "Je me connecte au réseau"
          }
          onPress={handleToggle}
          disabled={!line}
          loading={starting}
          variant="primary"
        />

        <ThemedText themeColor="textSecondary" type="small">
          Contributions envoyées : {pingCount}
        </ThemedText>
        {lastError && (
          <ThemedText style={{ color: "#D93025" }} type="small">
            {lastError}
          </ThemedText>
        )}

        <AppButton
          title="Signaler une panne"
          onPress={handleReport}
          disabled={!active}
          loading={reporting}
        />
        {reportMsg && <ThemedText type="small">{reportMsg}</ThemedText>}
        <View style={{ height: 50 }}></View>
        <Collapsible
          title="Comment marche REZO"
          subtitle="Une communauté qui partage l'info pour que personne n'attende dans le flou."
        >
          <View style={{ gap: Spacing.two }}>
            <ThemedText type="small">
              📍 Quand tu es dans un bus, ton téléphone indique discrètement la
              position du bus. Pas de compte, pas de données personnelles.
            </ThemedText>
            <ThemedText type="small">
              ⏱️ Avec ces infos, on calcule combien de temps il reste à attendre
              à chaque arrêt.
            </ThemedText>
            <ThemedText type="small">
              ⚠️ Si un bus tombe en panne, tu peux le signaler en un geste pour
              prévenir les autres.
            </ThemedText>
            <ThemedText type="small">
              🔒 Ta position reste anonyme : personne ne sait que c'est toi qui
              partages.
            </ThemedText>
            <ThemedText type="small">
              🤝 Plus on est nombreux à participer, plus les temps d'attente
              affichés sont justes.
            </ThemedText>
          </View>
        </Collapsible>
      </ThemedView>
    </ScrollView>
  );
}
