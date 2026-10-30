import { AppButton } from "@/components/app-button";
import { DirectionPicker } from "@/components/direction-picker";
import { LinePicker } from "@/components/line-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchStops, StopItem, useEta } from "../../lib/eta";
import { useLines } from "../../lib/lines";

const COLORS = { GREEN: "#2E9E4F", ORANGE: "#F08A00", RED: "#D93025" } as const;
const LABELS = {
  FULL: "Le prochain bus est complet",
  BREAKDOWN:
    "Le prochain bus est signalé en panne : son heure d'arrivée est incertaine",
} as const;

export default function Wait() {
  const { lines } = useLines();
  const [line, setLine] = useState<string | null>(null);
  const [direction, setDirection] = useState<0 | 1>(0);
  const [stops, setStops] = useState<StopItem[]>([]);
  const [stopId, setStopId] = useState<string | null>(null);
  const { eta, updatedAt, offline } = useEta(stopId, line, direction);

  useEffect(() => {
    setStopId(null);
    if (!line) return;
    fetchStops(line, direction)
      .then(setStops)
      .catch((e) => {
        console.log("fetchStops erreur :", e);
        setStops([]);
      });
  }, [line, direction]);

  const color = eta ? COLORS[eta.status] : "#888888";
  const hhmm = updatedAt?.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const selected = stops.find((s) => s.id === stopId);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ThemedView
        style={{ flex: 1, padding: Spacing.four, gap: Spacing.three }}
      >
        <StatusBar style="auto" />

        <ThemedText type="subtitle">J'attends le bus</ThemedText>

        <LinePicker lines={lines} selected={line} onSelect={setLine} />
        <DirectionPicker selected={direction} onSelect={setDirection} />

        {selected && (
          <ThemedText themeColor="textSecondary">
            Arrêt : {selected.name}
          </ThemedText>
        )}

        {/* Bloc ETA géant : couleur de statut, volontairement indépendante du thème (sémantique) */}
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
          ) : !eta ? (
            <ThemedText style={{ fontSize: 22, color: "#fff" }}>
              Chargement…
            </ThemedText>
          ) : eta.source === "live" ? (
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

        {eta?.reports?.map((r) => (
          <ThemedView
            key={r.type}
            style={{
              backgroundColor: "#FFF3CD",
              padding: Spacing.three,
              borderRadius: 8,
            }}
          >
            <ThemedText style={{ color: "#5C4A00" }}>
              ⚠️ {LABELS[r.type]} · signalé par {r.count} personne
              {r.count > 1 ? "s" : ""}
            </ThemedText>
          </ThemedView>
        ))}

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
      </ThemedView>
    </SafeAreaView>
  );
}
