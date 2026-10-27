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
  isDark?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  badge,
  isDark = false,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.textWrapper}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
          {badge ? (
            <View style={[styles.badge, isDark && styles.badgeDark]}>
              <Text style={[styles.badgeText, isDark && styles.badgeTextDark]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onActionPress ? (
        <TouchableOpacity
          onPress={onActionPress}
          activeOpacity={0.7}
          style={styles.actionButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.actionText, isDark && styles.actionTextDark]}>
            {actionLabel}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Palette.accentSky}
          />
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
  containerDark: {
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 14,
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
    color: Palette.deepTeal,
    letterSpacing: -0.3,
  },
  titleDark: {
    color: "#FFFFFF",
  },
  badge: {
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.3)",
  },
  badgeDark: {
    backgroundColor: "#1A1A1A",
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  badgeText: {
    color: Palette.oceanTeal,
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  badgeTextDark: {
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13.5,
    color: Palette.textSecondary,
    marginTop: 3,
    fontWeight: "400",
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingBottom: 2,
  },
  actionText: {
    fontSize: 13,
    color: Palette.accentSky,
    fontWeight: "800",
  },
  actionTextDark: {
    color: Palette.accentSky,
  },
});
