import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect } from "react";

export const unstable_settings = {
  initialRouteName: "splash",
};

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) return; // inutile en dev client, Metro gère déjà le live reload
    (async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // applique IMMÉDIATEMENT, sans attendre un 2e relancement
        }
      } catch (e) {
        console.log("Updates: vérification échouée", e);
      }
    })();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="eta" />
    </Stack>
  );
}
