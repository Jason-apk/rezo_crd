import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import { useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

// TODO: remplace par le vrai lien d'invitation
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/KdgdwsBd3TwKnDAJXN0SRT";

type Props = { variant: "corner" | "floating" };

export function WhatsAppButton({ variant }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.fab, variant === "floating" && styles.floating]}
      >
        <Image
          source={require("@/assets/images-rezo/whatsapp.png")}
          style={styles.whsImage}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Rejoins le réseau REZO</Text>
              <Text style={styles.sheetSubtitle}>
                Un groupe WhatsApp pour les usagers de REZO :
              </Text>
              <View style={{ gap: spacing.sm }}>
                <Text style={styles.sheetPoint}>
                  💬 Donne ton avis sur l'app
                </Text>
                <Text style={styles.sheetPoint}>
                  🤝 Échange avec les autres usagers
                </Text>
                <Text style={styles.sheetPoint}>
                  🚀 Aide à faire évoluer le réseau
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Linking.openURL(WHATSAPP_GROUP_URL);
                  setOpen(false);
                }}
                style={styles.joinButton}
              >
                <Text style={styles.joinText}>Rejoindre la communauté</Text>
              </Pressable>
              <Pressable
                onPress={() => setOpen(false)}
                style={{ alignItems: "center", padding: spacing.sm }}
              >
                <Text style={styles.laterText}>Plus tard</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 42,
    height: 42,
    borderRadius: 100, // moitié exacte de width/height
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  floating: {
    position: "absolute",
    bottom: spacing.lg,
    right: spacing.lg,
  },
  whsImage: {
    width: 92,
    height: 92,
    resizeMode: "cover",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  sheetSubtitle: { fontSize: fontSize.base, color: colors.textSecondary },
  sheetPoint: { fontSize: fontSize.base, color: colors.textPrimary },
  joinButton: {
    backgroundColor: "#25D366",
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  joinText: { color: "#fff", fontWeight: "700" },
  laterText: { color: colors.textSecondary, fontSize: fontSize.sm },
});
