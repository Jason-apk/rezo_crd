import { colors, fontSize, spacing } from "@/../theme/tokens";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={"dark-content"}
        backgroundColor={colors.background}
      />
      <Image
        source={require("@/assets/images-rezo/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Où est mon bus ?</Text>
      <ActivityIndicator
        size="small"
        color={colors.primary}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: { width: 120, height: 120, marginBottom: spacing.lg },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  loader: { marginTop: spacing.xs },
});
