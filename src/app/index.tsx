import { AppButton } from "@/components/app-button";
import { DirectionPicker } from "@/components/direction-picker";
import { LinePicker } from "@/components/line-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLines } from "../../lib/lines";
import { ReportType, sendReport } from "../../lib/reports";
import { useGpsPing } from "../../lib/useGpsping";

export default function Home() {
  const [line, setLine] = useState<string | null>(null);
  const [direction, setDirection] = useState<0 | 1>(0);
  const { active, pingCount, session, lastError, start, stop } = useGpsPing();
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const { lines, loading } = useLines();

  useEffect(() => {
    if (session) {
      setLine(session.line);
      setDirection(session.direction);
    }
  }, [session]);

  function handleStart() {
    if (!line) return;
    start(line, direction);
  }

  async function report(type: ReportType) {
    if (!line) return;
    try {
      const r = await sendReport(line, direction, type);
      setReportMsg(
        r === "ok"
          ? "Signalement envoyé, merci !"
          : r === "duplicate"
            ? "Déjà signalé récemment"
            : "Active d'abord le partage de position",
      );
    } catch (e: any) {
      setReportMsg("Échec : " + e.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ThemedView
        style={{
          flex: 1,
          padding: Spacing.four,
          gap: Spacing.three,
          justifyContent: "center",
        }}
      >
        <StatusBar style="auto" />

        <ThemedText type="subtitle">Je suis dans le bus</ThemedText>

        <ThemedText themeColor="textSecondary">
          {line
            ? `${line} · ${direction === 0 ? "vers Campus" : "depuis Campus"}`
            : "Choisis une ligne"}
        </ThemedText>

        {/* On fige le choix pendant le trajet : changer de ligne en route fausserait les pings */}
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

        <AppButton
          title={active ? "Je descends" : "Je suis dans le bus"}
          onPress={active ? stop : handleStart}
          disabled={!line}
          variant="primary"
        />

        <ThemedText themeColor="textSecondary" type="small">
          Pings envoyés : {pingCount}
        </ThemedText>
        {lastError && (
          <ThemedText style={{ color: "#D93025" }} type="small">
            {lastError}
          </ThemedText>
        )}

        <ThemedView
          type="backgroundElement"
          style={{
            flexDirection: "row",
            gap: Spacing.two,
            borderRadius: 12,
            padding: Spacing.three,
          }}
        >
          <AppButton
            title="Bus complet"
            onPress={() => report("FULL")}
            disabled={!active}
          />
          <AppButton
            title="En panne"
            onPress={() => report("BREAKDOWN")}
            disabled={!active}
          />
        </ThemedView>
        {reportMsg && <ThemedText type="small">{reportMsg}</ThemedText>}
      </ThemedView>
    </SafeAreaView>
  );
}
