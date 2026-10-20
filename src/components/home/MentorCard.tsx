import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

export interface MentorData {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  memoriesCount: number;
  yearsKnown: string;
  isBookmarked?: boolean;
}

interface MentorCardProps {
  mentor: MentorData;
  onPress?: () => void;
  onBookmarkToggle?: (id: string) => void;
}

export default function MentorCard({
  mentor,
  onPress,
  onBookmarkToggle,
}: MentorCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.cardSurface}>
        {/* Top Header Row with Bookmark */}
        <View style={styles.topRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: mentor.avatar }} style={styles.avatar} />
            <View style={styles.statusDot} />
          </View>

          <TouchableOpacity
            onPress={() => onBookmarkToggle?.(mentor.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.bookmarkBtn}
          >
            <Ionicons
              name={mentor.isBookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color={mentor.isBookmarked ? Palette.turquoise : Palette.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Mentor Info */}
        <View style={styles.infoArea}>
          <Text style={styles.name} numberOfLines={1}>
            {mentor.name}
          </Text>
          <View style={styles.roleRow}>
            <Text style={styles.role}>{mentor.role}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.years}>{mentor.yearsKnown}</Text>
          </View>

          {/* Quote */}
          <Text style={styles.quote} numberOfLines={2}>
            &ldquo;{mentor.quote}&rdquo;
          </Text>
        </View>

        {/* Card Footer */}
        <View style={styles.footer}>
          <View style={styles.memoryPill}>
            <Ionicons name="sparkles" size={12} color={Palette.oceanTeal} />
            <Text style={styles.memoryCount}>
              {mentor.memoriesCount} Memories
            </Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={20} color={Palette.oceanTeal} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 236,
    borderRadius: 20,
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
    borderRadius: 20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: Palette.oceanTeal, // Ocean Teal ring
    backgroundColor: Palette.mintMist,
  },
  statusDot: {
    position: "absolute",
    bottom: 0,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.turquoise, // Turquoise active dot
    borderWidth: 2,
    borderColor: Palette.pureWhite,
  },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(236, 143, 62, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoArea: {
    marginTop: 12,
  },
  name: {
    fontSize: 16.5,
    fontWeight: "800",
    color: Palette.deepTeal, // Deep Teal heading
    letterSpacing: -0.2,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  role: {
    fontSize: 12.5,
    color: Palette.oceanTeal, // Ocean Teal role
    fontWeight: "700",
  },
  bullet: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  years: {
    fontSize: 11.5,
    color: Palette.textSecondary,
  },
  quote: {
    fontSize: 12.5,
    lineHeight: 18,
    color: Palette.deepTeal,
    fontStyle: "italic",
    marginTop: 8,
    opacity: 0.88,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(84, 0, 14, 0.08)",
  },
  memoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.mintMist, // Mint Mist pill
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memoryCount: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.oceanTeal,
  },
});
