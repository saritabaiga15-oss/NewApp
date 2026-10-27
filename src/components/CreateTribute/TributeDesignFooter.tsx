import React, { useMemo } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface TributeDesignFooterProps {
  onContinue: () => void;
  errorMessage?: string | null;
}

export default function TributeDesignFooter({
  onContinue,
  errorMessage,
}: TributeDesignFooterProps) {
  const scaleAnim = useMemo(() => new Animated.Value(1), []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Friendly Validation Feedback Message */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={16} color="#9E2A2B" />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Supporting Text */}
      <Text style={styles.supportingText}>
        Turn your words and memories into a beautiful tribute.
      </Text>

      {/* Prominent Action Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onContinue}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.continueButton}
          accessibilityRole="button"
          accessibilityLabel="Continue to Design tribute studio"
        >
          <View style={styles.buttonTextGroup}>
            <Text style={styles.buttonLabel}>Continue to Design</Text>
            <Text style={styles.buttonSub}>Preserve in Design Studio</Text>
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color={Palette.deepTeal} />
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFECEB",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(158, 42, 43, 0.3)",
  },
  errorText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#9E2A2B",
    flex: 1,
  },
  supportingText: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    textAlign: "center",
    marginBottom: 10,
    fontStyle: "italic",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  buttonTextGroup: {},
  buttonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.textOnPrimary,
    letterSpacing: -0.2,
  },
  buttonSub: {
    fontSize: 11,
    color: "rgba(252, 238, 228, 0.75)",
    marginTop: 2,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
  },
});
