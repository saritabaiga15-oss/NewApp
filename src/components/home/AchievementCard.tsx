import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

export interface AchievementData {
  id: string;
  badgeType: "graduation" | "award" | "job" | "certificate" | "competition";
  title: string;
  mentorName: string;
  date: string;
  story: string;
}

interface AchievementCardProps {
  achievement: AchievementData;
  onPress?: () => void;
}

export default function AchievementCard({
  achievement,
  onPress,
}: AchievementCardProps) {
  const getBadgeMeta = () => {
    switch (achievement.badgeType) {
      case "graduation":
        return { icon: "school" as const, color: Palette.oceanTeal, bg: Palette.mintMist, label: "Graduation" };
      case "award":
        return { icon: "trophy" as const, color: Palette.oceanTeal, bg: "rgba(236, 143, 62, 0.22)", label: "Honor Award" };
      case "job":
        return { icon: "briefcase" as const, color: Palette.oceanTeal, bg: Palette.mintMist, label: "Career Start" };
      case "certificate":
        return { icon: "ribbon" as const, color: Palette.deepTeal, bg: Palette.mintMist, label: "Certification" };
      case "competition":
        return { icon: "medal" as const, color: Palette.oceanTeal, bg: "rgba(236, 143, 62, 0.22)", label: "Victory" };
    }
  };

  const meta = getBadgeMeta();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <View style={styles.cardSurface}>
        <View style={styles.topRow}>
          <View style={[styles.badgeIcon, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={18} color={meta.color} />
          </View>
          <Text style={styles.dateText}>{achievement.date}</Text>
        </View>

        <Text style={styles.title}>{achievement.title}</Text>

        <Text style={styles.dedicatedText}>
          Dedicated to: <Text style={styles.mentorName}>{achievement.mentorName}</Text>
        </Text>

        <Text style={styles.storyText} numberOfLines={3}>
          &ldquo;{achievement.story}&rdquo;
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 250,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: Palette.pureWhite, // Pure White card surface
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSurface: {
    padding: 16,
    borderRadius: 22,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 11.5,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal, // Deep Teal heading
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  dedicatedText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginBottom: 10,
  },
  mentorName: {
    color: Palette.turquoise, // Turquoise highlight
    fontWeight: "800",
  },
  storyText: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.deepTeal,
    opacity: 0.88,
    fontStyle: "italic",
  },
});
