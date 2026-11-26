import { colors } from "@/../theme/tokens";
import { SymbolView } from "expo-symbols";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

type Props = { connected: boolean; onPress: () => void; disabled?: boolean };

export function PowerButton({ connected, onPress, disabled }: Props) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 0.6 }],
  }));

  const haloColor = connected ? colors.statusRose : colors.primary;

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.halo, { backgroundColor: haloColor }, haloStyle]}
      />
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: connected ? colors.statusRose : colors.primary,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <SymbolView
          name={{
            ios: "power",
            android: "power_settings_new",
            web: "power_settings_new",
          }}
          size={40}
          weight="bold"
          tintColor="#fff"
        />
      </Pressable>
    </View>
  );
}

const SIZE = 96;

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", height: SIZE * 1.8 },
  halo: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});
