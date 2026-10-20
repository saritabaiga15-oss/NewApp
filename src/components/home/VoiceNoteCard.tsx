import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Palette } from "@/constants/theme";

export interface VoiceNoteData {
  id: string;
  title: string;
  mentorName: string;
  duration: string;
  date: string;
  category: string;
}

interface VoiceNoteCardProps {
  voiceNote: VoiceNoteData;
}

export default function VoiceNoteCard({ voiceNote }: VoiceNoteCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardSurface}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Ionicons name="mic" size={12} color={Palette.oceanTeal} />
            <Text style={styles.categoryText}>{voiceNote.category}</Text>
          </View>
          <Text style={styles.dateText}>{voiceNote.date}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          &ldquo;{voiceNote.title}&rdquo;
        </Text>

        <Text style={styles.mentorDedicated}>
          To: <Text style={styles.mentorNameHighlight}>{voiceNote.mentorName}</Text>
        </Text>

        {/* Audio Player Row */}
        <View style={styles.playerRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsPlaying((prev) => !prev)}
            style={[styles.playButton, isPlaying && styles.playButtonActive]}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Waveform Visualization */}
          <View style={styles.waveformContainer}>
            {[
              8, 16, 26, 14, 18, 30, 22, 12, 28, 32, 18, 10, 24, 28, 16, 12,
              22, 30, 18, 14, 26, 20, 12, 18, 24, 10,
            ].map((height, idx) => {
              const isPast = isPlaying && idx < 12;
              return (
                <View
                  key={`bar-${idx}`}
                  style={[
                    styles.waveformBar,
                    { height },
                    isPast && styles.waveformBarActive,
                  ]}
                />
              );
            })}
          </View>

          <Text style={styles.durationText}>{voiceNote.duration}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
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
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    color: Palette.oceanTeal,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  dateText: {
    color: Palette.textMuted,
    fontSize: 11,
  },
  title: {
    fontSize: 15.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  mentorDedicated: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  mentorNameHighlight: {
    color: Palette.oceanTeal,
    fontWeight: "700",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(84, 0, 14, 0.05)",
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.oceanTeal, // Ocean Teal play button
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  playButtonActive: {
    backgroundColor: Palette.turquoise, // Turquoise active state
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 2.5,
    height: 32,
  },
  waveformBar: {
    width: 3,
    backgroundColor: "rgba(84, 0, 14, 0.22)",
    borderRadius: 2,
  },
  waveformBarActive: {
    backgroundColor: Palette.turquoise,
  },
  durationText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
});



