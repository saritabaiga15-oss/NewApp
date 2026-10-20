import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  badge?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  badge,
}: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          style={styles.actionButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={Palette.oceanTeal} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 28,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: Palette.deepTeal, // Deep Teal heading
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: Palette.mintMist, // Mint Mist badge
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  badgeText: {
    color: Palette.oceanTeal, // Ocean Teal text
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 13.5,
    color: Palette.textSecondary,
    marginTop: 3,
    fontWeight: "400",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingBottom: 2,
  },
  actionText: {
    fontSize: 13,
    color: Palette.oceanTeal, // Ocean Teal action
    fontWeight: "800",
  },
});
