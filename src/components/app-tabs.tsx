import { colors } from "@/../theme/tokens";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={colors.backgroundCard}
      indicatorColor={colors.backgroundChip}
      tintColor={colors.primary}
      labelStyle={{ selected: { color: colors.primary } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Réseau</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="wait">
        <NativeTabs.Trigger.Label>Arrêt</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
