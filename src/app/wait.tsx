import { AppButton } from "@/components/app-button";
import { DirectionPicker } from "@/components/direction-picker";
import { InlineLoader } from "@/components/inline-loader";
import { LinePicker } from "@/components/line-picker";
import { RouteBadge } from "@/components/route-badge";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEta } from "../../lib/eta";
import { getAvailableLines, getStops, type StopItem } from "../../lib/stops";

const lines = getAvailableLines();
const COLORS = { GREEN: "#2E9E4F", ORANGE: "#F08A00", RED: "#D93025" } as const;
const REPORT_LABEL = "Signalé en panne : son heure d'arrivée est incertaine";

export default function Wait() {
  const [line, setLine] = useState<string | null>(null);
  const [direction, setDirection] = useState<0 | 1>(0);
  const [stopId, setStopId] = useState<string | null>(null);
  const { eta, loading, updatedAt, offline } = useEta(stopId, line, direction);

  const stops: StopItem[] = line ? getStops(line, direction) : [];

  useEffect(() => {
    setStopId(null);
  }, [line, direction]);

  const color = eta ? COLORS[eta.status] : "#888888";
  const hhmm = updatedAt?.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const selected = stops.find((s) => s.id === stopId);
  const breakdown = eta?.reports?.find((r) => r.type === "BREAKDOWN");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ThemedView
        style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}
      >
        <ThemedText type="subtitle">Le réseau en direct</ThemedText>

        <LinePicker lines={lines} selected={line} onSelect={setLine} />
        <DirectionPicker selected={direction} onSelect={setDirection} />

        <RouteBadge line={line} direction={direction} />
        {selected && (
          <ThemedText themeColor="textSecondary">
            Arrêt : {selected.name}
          </ThemedText>
        )}

        <ThemedView
          style={{
            backgroundColor: color,
            borderRadius: 16,
            padding: Spacing.five,
            height: 150,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!stopId ? (
            <ThemedText style={{ fontSize: 22, color: "#fff" }}>
              Choisis ton arrêt
            </ThemedText>
          ) : loading ? (
            <InlineLoader />
          ) : eta?.source === "live" ? (
            <ThemedText
              style={{ fontSize: 64, fontWeight: "700", color: "#fff" }}
            >
              {eta.minutes} min
            </ThemedText>
          ) : (
            <ThemedText
              style={{ fontSize: 22, color: "#fff", textAlign: "center" }}
            >
              Aucun bus détecté pour l'instant
            </ThemedText>
          )}
        </ThemedView>

        {breakdown && (
          <ThemedView
            style={{
              backgroundColor: "#FFF3CD",
              padding: Spacing.three,
              borderRadius: 8,
            }}
          >
            <ThemedText style={{ color: "#5C4A00" }}>
              ⚠️ {REPORT_LABEL} · {breakdown.count} signalement
              {breakdown.count > 1 ? "s" : ""}
            </ThemedText>
          </ThemedView>
        )}

        {offline && (
          <ThemedText
            style={{ color: "#D93025", fontWeight: "600" }}
            type="small"
          >
            Hors-ligne · Dernière mise à jour à {hhmm ?? "--:--"}
          </ThemedText>
        )}

        <ScrollView
          contentContainerStyle={{
            gap: Spacing.two,
            paddingBottom: BottomTabInset,
          }}
          showsVerticalScrollIndicator={false}
        >
          {stops.map((s) => (
            <AppButton
              key={s.id}
              title={s.name}
              onPress={() => setStopId(s.id)}
              variant={s.id === stopId ? "primary" : "secondary"}
            />
          ))}
        </ScrollView>

        <WhatsAppButton variant="floating" />
      </ThemedView>
    </SafeAreaView>
  );
}
