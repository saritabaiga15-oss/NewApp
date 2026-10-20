import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface QuickActionProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string;
  color?: string;
  onPress: () => void;
}

export default function QuickAction({
  icon,
  label,
  badge,
  color = Palette.oceanTeal,
  onPress,
}: QuickActionProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.container}
    >
      <View style={[styles.iconWrap, { borderColor: Palette.borderSubtle }]}>
        <Ionicons name={icon} size={22} color={color} />
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 72,
    marginRight: 10,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.pureWhite, // Pure White surface
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    position: "relative",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.deepTeal, // Deep Teal label
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Palette.turquoise, // Turquoise badge
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
});
