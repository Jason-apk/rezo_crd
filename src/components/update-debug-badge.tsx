import { colors, fontSize, radius, spacing } from "@/../theme/tokens";
import * as Updates from "expo-updates";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

export function UpdateDebugBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onLongPress={() => setOpen(true)}
        style={{ position: "absolute", top: 4, left: 4, width: 24, height: 24 }}
      />
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setOpen(false)}
        >
          <View
            style={{
              backgroundColor: colors.backgroundCard,
              borderRadius: radius.md,
              padding: spacing.lg,
              gap: spacing.xs,
            }}
          >
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>
              Update ID : {Updates.updateId ?? "embarqué (aucun OTA)"}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>
              Channel : {Updates.channel ?? "inconnu"}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>
              Runtime : {Updates.runtimeVersion ?? "inconnu"}
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>
              Créé le : {Updates.createdAt?.toLocaleString("fr-FR") ?? "—"}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
