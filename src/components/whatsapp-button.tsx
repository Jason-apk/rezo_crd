import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useState } from "react";
import { Linking, Modal, Pressable, View } from "react-native";

// TODO: remplace par le vrai lien d'invitation de ton groupe
const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/KdgdwsBd3TwKnDAJXN0SRT";

type Props = { variant: "corner" | "floating" };

export function WhatsAppButton({ variant }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#25D366", // couleur officielle WhatsApp : hors thème, volontairement (icône de marque)
            alignItems: "center",
            justifyContent: "center",
          },
          variant === "floating" && {
            position: "absolute",
            bottom: Spacing.four,
            right: Spacing.four,
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 6,
          },
        ]}
      >
        <ThemedText style={{ fontSize: 22 }}>💬</ThemedText>
      </Pressable>

      <Modal
        visible={open}
        presentationStyle="fullScreen"
        backdropColor="rgba(0,0,0,0.5)"
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.69)",
            justifyContent: "flex-end",
          }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <ThemedView
              style={{
                //   marginBottom: "50%",

                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: Spacing.four,
                gap: Spacing.three,
              }}
            >
              <ThemedText type="subtitle">Rejoins le réseau REZO</ThemedText>
              <ThemedText themeColor="textSecondary">
                Un groupe WhatsApp pour les usagers de REZO :
              </ThemedText>
              <View style={{ gap: Spacing.two }}>
                <ThemedText>💬 Donne ton avis sur l'app</ThemedText>
                <ThemedText>🤝 Échange avec les autres usagers</ThemedText>
                <ThemedText>🚀 Aide à faire évoluer le réseau</ThemedText>
              </View>
              <Pressable
                onPress={() => {
                  Linking.openURL(WHATSAPP_GROUP_URL);
                  setOpen(false);
                }}
                style={{
                  backgroundColor: "#25D366",
                  borderRadius: 10,
                  padding: Spacing.three,
                  alignItems: "center",
                }}
              >
                <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                  Rejoindre la communauté
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setOpen(false)}
                style={{ alignItems: "center", padding: Spacing.two }}
              >
                <ThemedText themeColor="textSecondary" type="small">
                  Plus tard
                </ThemedText>
              </Pressable>
            </ThemedView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
