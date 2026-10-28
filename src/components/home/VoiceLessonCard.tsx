import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

export interface VoiceLessonItem {
  id: string;
  type: "voice" | "lesson";
  badgeLabel: string;
  badgeIcon: "mic" | "book";
  date: string;
  title: string;
  description?: string;
  quote?: string;
  audioDuration?: string;
  mentorName: string;
  mentorId?: string;
  likes: number;
}

interface VoiceLessonCardProps {
  item: VoiceLessonItem;
  cardWidth?: number;
  onPress?: () => void;
  onPlayPress?: () => void;
  onMentorPress?: (mentorName: string) => void;
}

export default function VoiceLessonCard({
  item,
  cardWidth,
  onPress,
  onPlayPress,
  onMentorPress,
}: VoiceLessonCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likes);

  const toggleLike = (e: any) => {
    e.stopPropagation?.();
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} by ${item.mentorName}`}
      style={[
        styles.container,
        {
          width: cardWidth ?? 290,
        },
      ]}
    >
      <View style={styles.contentWrap}>
        {/* Top Row: Badge & Date */}
        <View style={styles.topRow}>
          <View style={styles.badgePill}>
            <Ionicons
              name={item.badgeIcon}
              size={12}
              color={item.type === "voice" ? Palette.accentPeach : Palette.accentSky}
            />
            <Text style={styles.badgeText}>{item.badgeLabel}</Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Body: Voice Description + Waveform Player Box, or Italic Lesson Quote */}
        {item.type === "voice" ? (
          <View style={styles.voiceBody}>
            {item.description ? (
              <Text style={styles.voiceDescription} numberOfLines={3}>
                {item.description}
              </Text>
            ) : null}

            {/* Audio Waveform Player Bar */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onPlayPress || onPress}
              style={styles.playerContainer}
              accessibilityRole="button"
              accessibilityLabel={`Play voice memo: ${item.title}`}
            >
              <View style={styles.playCircle}>
                <Ionicons name="play" size={14} color={Palette.textOnPrimary} />
              </View>

              {/* Waveform Sound Bars */}
              <View style={styles.waveformRow}>
                {[7, 16, 24, 12, 19, 26, 22, 11, 25, 27, 17, 10, 23, 25, 14, 11, 18].map(
                  (h, idx) => (
                    <View
                      key={`wf-${idx}`}
                      style={[styles.waveformBar, { height: h }]}
                    />
                  )
                )}
              </View>

              <Text style={styles.durationText}>{item.audioDuration || "0:45"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.lessonBody}>
            <Text style={styles.lessonQuote} numberOfLines={4}>
              &ldquo;{item.quote}&rdquo;
            </Text>
          </View>
        )}

        {/* Footer: Mentor Profile & Like Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onMentorPress?.(item.mentorName)}
            style={styles.mentorRow}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="person-circle" size={18} color={Palette.accentSky} />
            <Text style={styles.mentorName} numberOfLines={1}>
              {item.mentorName}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleLike}
            activeOpacity={0.75}
            style={styles.likeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={16}
              color={liked ? Palette.accentCoral : Palette.textMuted}
            />
            <Text
              style={[
                styles.likeCountText,
                liked && styles.likeCountTextActive,
              ]}
            >
              {likeCount}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 240,
    justifyContent: "space-between",
  },
  contentWrap: {
    padding: 18,
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Palette.surfaceElevated,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#737373",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    lineHeight: 23,
    marginBottom: 8,
  },
  voiceBody: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 10,
  },
  voiceDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#D1D5DB",
    marginBottom: 10,
  },
  playerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  playCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  waveformRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 28,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#A3A3A3",
  },
  lessonBody: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 10,
  },
  lessonQuote: {
    fontSize: 13,
    lineHeight: 20,
    color: "#E5E5E5",
    fontStyle: "italic",
    fontFamily: AppFonts.body,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  mentorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  mentorName: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#E5E5E5",
  },
  likeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  likeCountText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#737373",
  },
  likeCountTextActive: {
    color: Palette.accentCoral,
  },
});
