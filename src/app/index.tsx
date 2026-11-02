import { AppButton } from "@/components/app-button";
import { DirectionPicker } from "@/components/direction-picker";
import { LinePicker } from "@/components/line-picker";
import { RouteBadge } from "@/components/route-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Spacing } from "@/constants/theme";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
      </ThemedView>
    </SafeAreaView>
  );
}
