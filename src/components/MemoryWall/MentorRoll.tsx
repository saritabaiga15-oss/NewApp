import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";
import { WallMentorProfile } from "@/types/memoryWall";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W = SCREEN_W * 0.38;

interface MentorRollProps {
  mentors: WallMentorProfile[];
  onMentorPress: (mentor: WallMentorProfile) => void;
}

export default function MentorRoll({ mentors, onMentorPress }: MentorRollProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.sectionHeader}>
        <Ionicons name="people" size={16} color={Palette.turquoise} />
        <Text style={styles.sectionTitle}>Your Mentors</Text>
        <Text style={styles.sectionCount}>{mentors.length} people</Text>
      </View>

      <View style={styles.row}>
        {mentors.map((mentor) => (
          <TouchableOpacity
            key={mentor.id}
            onPress={() => onMentorPress(mentor)}
            activeOpacity={0.82}
            style={styles.card}
            accessibilityRole="button"
            accessibilityLabel={`${mentor.name} profile`}
          >
            {/* Cover gradient */}
            <LinearGradient
              colors={[mentor.coverColor, `${mentor.coverColor}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />

            {/* Avatar */}
            <Image source={{ uri: mentor.avatarUri }} style={styles.avatar} />

            {/* Info */}
            <Text style={styles.mentorName} numberOfLines={1}>
              {mentor.name}
            </Text>
            <Text style={styles.relationship} numberOfLines={1}>
              {mentor.relationship}
            </Text>

            {/* Item count badge */}
            <View style={styles.countBadge}>
              <Ionicons name="albums-outline" size={10} color={Palette.turquoise} />
              <Text style={styles.countLabel}>{mentor.itemCount}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: CARD_W,
    height: 110,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: Palette.pureWhite,
    shadowColor: Palette.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
    padding: 12,
  },
  cardGradient: {
    ...StyleSheet.absoluteFill,
    opacity: 0.92,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 8,
  },
  mentorName: {
    color: "#FFF8F0",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  relationship: {
    color: "rgba(252,238,228,0.7)",
    fontSize: 10,
    fontWeight: "500",
  },
  countBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  countLabel: {
    color: Palette.turquoise,
    fontSize: 10,
    fontWeight: "800",
  },
});
