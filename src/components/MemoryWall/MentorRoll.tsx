import React from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, getCategoryAccent, Palette } from "@/constants/theme";
import { WallMentorProfile } from "@/types/memoryWall";

const SCREEN_W = Dimensions.get("window").width;
const GRID_GAP = 14;
const PADDING_H = 20;
const CARD_W = (SCREEN_W - PADDING_H * 2 - GRID_GAP) / 2;

interface MentorRollProps {
  mentors: WallMentorProfile[];
  onMentorPress: (mentor: WallMentorProfile) => void;
  onAddMentorPress?: () => void;
  onSendThanks?: (mentor: WallMentorProfile) => void;
}

function getInitials(name: string): string {
  const parts = name.replace(/^(Mrs\.|Mr\.|Dr\.|Prof\.)\s+/i, "").trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function MentorRoll({
  mentors,
  onMentorPress,
  onAddMentorPress,
  onSendThanks,
}: MentorRollProps) {
  const handleThanks = (mentor: WallMentorProfile) => {
    if (onSendThanks) {
      onSendThanks(mentor);
    } else {
      Alert.alert(
        "Send Thanks",
        `A thank-you note draft to ${mentor.name} has been created.`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>Your Mentors</Text>
          <Text style={styles.sectionSubtitle}>The people who shaped you.</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{mentors.length} people</Text>
        </View>
      </View>

      {/* 2-Column Grid */}
      <View style={styles.grid}>
        {mentors.map((mentor) => {
          const initials = getInitials(mentor.name);
          const accentColor = getCategoryAccent(mentor.relationship);
          const quoteText =
            mentor.meaningfulQuote ||
            mentor.description ||
            "She stayed after class until fractions finally clicked.";

          return (
            <TouchableOpacity
              key={mentor.id}
              onPress={() => onMentorPress(mentor)}
              activeOpacity={0.92}
              style={styles.card}
              accessibilityRole="button"
              accessibilityLabel={`${mentor.name} profile card`}
            >
              {/* Top Banner (72px) with Cover Color & Refresh Button */}
              <View style={styles.banner}>
                <View style={styles.bannerArc} />
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Memory Cycled", `Showing another note for ${mentor.name}`)
                  }
                  style={styles.flipBtn}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Flip memory"
                >
                  <Ionicons name="sync-outline" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Overlapping Centered Circular Avatar with Dual Halo Ring */}
              <View style={styles.avatarWrap}>
                <View style={styles.avatarHalo}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>{initials}</Text>
                  </View>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                {/* Mentor Name in Cursive Script Style */}
                <Text style={styles.mentorName} numberOfLines={2}>
                  {mentor.name}
                </Text>

                {/* Role / Relationship */}
                <Text style={styles.mentorRole} numberOfLines={1}>
                  {mentor.relationship}
                </Text>

                {/* Duration in Amber Italics */}
                <Text style={styles.mentorDuration} numberOfLines={1}>
                  {mentor.duration || "Guided you for years"}
                </Text>

                {/* Trait Pill Badge */}
                <View style={styles.traitPill}>
                  <Ionicons
                    name={(mentor.traitIcon as any) || "compass-outline"}
                    size={12}
                    color={accentColor}
                  />
                  <Text style={styles.traitText} numberOfLines={1}>
                    {mentor.trait || "Patient guide"}
                  </Text>
                </View>

                {/* "The lesson I carry" label */}
                <Text style={styles.lessonLabel}>The lesson I carry</Text>

                {/* Quote Clamped to 3 lines */}
                <Text style={styles.quote} numberOfLines={3}>
                  “{quoteText}”
                </Text>
              </View>

              {/* Inset Divider */}
              <View style={styles.divider} />

              {/* Memory Counter */}
              <View style={styles.memoryCountRow}>
                <Ionicons name="book-outline" size={13} color={Palette.accentLavender} />
                <Text style={styles.memoryCountText}>
                  {mentor.itemCount || 4} memories
                </Text>
              </View>

              {/* Full-width Amber "Send thanks" Button */}
              <TouchableOpacity
                onPress={() => handleThanks(mentor)}
                activeOpacity={0.8}
                style={styles.sendThanksBtn}
                accessibilityRole="button"
                accessibilityLabel={`Send thanks to ${mentor.name}`}
              >
                <Ionicons name="heart" size={13} color={Palette.textOnPrimary} />
                <Text style={styles.sendThanksText}>Send thanks</Text>
              </TouchableOpacity>

              {/* Last Thanked Footnote */}
              <Text style={styles.lastThankedText}>
                {mentor.lastThanked || "Last thanked recently"}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Dashed "Add a mentor" Card */}
        {onAddMentorPress && (
          <TouchableOpacity
            onPress={onAddMentorPress}
            activeOpacity={0.82}
            style={styles.addCard}
            accessibilityRole="button"
            accessibilityLabel="Add a mentor"
          >
            <View style={styles.addIconCircle}>
              <Ionicons name="add" size={24} color={Palette.accentSky} />
            </View>
            <Text style={styles.addTitle}>Add a mentor</Text>
            <Text style={styles.addSubtitle}>Honor someone who helped you grow</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    paddingHorizontal: PADDING_H,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.serif,
    fontSize: 22,
    fontWeight: "700",
    color: Palette.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontWeight: "400",
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countBadgeText: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
  },
  card: {
    width: CARD_W,
    borderRadius: 24,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
    display: "flex",
    flexDirection: "column",
  },
  banner: {
    height: 72,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: Palette.surfaceElevated,
  },
  bannerArc: {
    position: "absolute",
    top: -24,
    right: -24,
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  flipBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  avatarWrap: {
    marginTop: -36,
    alignSelf: "center",
    zIndex: 2,
  },
  avatarHalo: {
    padding: 3,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.surfaceCard,
  },
  avatarCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: Palette.surfaceElevated,
    borderWidth: 1.5,
    borderColor: Palette.borderSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: Fonts.serif,
    fontSize: 21,
    fontWeight: "700",
    color: Palette.textPrimary,
    letterSpacing: -0.5,
  },
  cardBody: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: "center",
    flexGrow: 1,
  },
  mentorName: {
    fontFamily: Fonts.serif,
    fontStyle: "italic",
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 2,
  },
  mentorRole: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 3,
  },
  mentorDuration: {
    fontFamily: Fonts.serif,
    fontStyle: "italic",
    fontSize: 12.5,
    color: Palette.accentAmber,
    textAlign: "center",
    marginBottom: 8,
  },
  traitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 240, 154, 0.12)",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
    marginBottom: 10,
    maxWidth: "94%",
  },
  traitText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textPrimary,
  },
  lessonLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.accentAmber,
    marginBottom: 4,
    textAlign: "center",
  },
  quote: {
    fontFamily: Fonts.serif,
    fontSize: 12.5,
    lineHeight: 17,
    color: Palette.textPrimary,
    textAlign: "center",
    opacity: 0.95,
    paddingHorizontal: 4,
  },
  divider: {
    width: "86%",
    alignSelf: "center",
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginVertical: 8,
  },
  memoryCountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 8,
  },
  memoryCountText: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    fontWeight: "500",
  },
  sendThanksBtn: {
    backgroundColor: Palette.oceanTeal,
    marginHorizontal: 8,
    paddingVertical: 8.5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  sendThanksText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: Palette.textOnPrimary,
  },
  lastThankedText: {
    fontSize: 10.5,
    color: Palette.textSecondary,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 12,
  },
  addCard: {
    width: CARD_W,
    minHeight: 240,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.surfaceCard,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  addIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  addTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: Palette.textPrimary,
    marginBottom: 2,
    textAlign: "center",
  },
  addSubtitle: {
    fontSize: 10.5,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
});
