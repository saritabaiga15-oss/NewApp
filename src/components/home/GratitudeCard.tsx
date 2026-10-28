import React, { useState } from "react";
import {
  Alert,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppFonts, Palette } from "@/constants/theme";

export interface GratitudePostData {
  id: string;
  authorName: string;
  authorAvatar: string;
  mentorName: string;
  location: string;
  message: string;
  image?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
}

interface GratitudeCardProps {
  post: GratitudePostData;
  onPress?: () => void;
}

export default function GratitudeCard({ post, onPress }: GratitudeCardProps) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${post.message}" — Dedicated to ${post.mentorName} by ${post.authorName} on Honour Your Mentor.`,
      });
    } catch {
      Alert.alert("Share unavailable", "This gratitude post could not be shared.");
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.cardSurface}>
        {/* Author & Mentor Header */}
        <View style={styles.header}>
          <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{post.authorName}</Text>
            <Text style={styles.dedicationText}>
              Honouring <Text style={styles.mentorHighlight}>{post.mentorName}</Text>
            </Text>
          </View>
          <Text style={styles.timeAgo}>{post.timeAgo}</Text>
        </View>

        {/* Message */}
        <Text style={styles.messageText}>
          &ldquo;{post.message}&rdquo;
        </Text>

        {/* Optional Media */}
        {post.image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: post.image }} style={styles.postImage} />
          </View>
        ) : null}

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <View style={styles.leftActions}>
            <TouchableOpacity
              onPress={toggleLike}
              activeOpacity={0.7}
              style={styles.actionBtn}
            >
              <Ionicons
                name={liked ? "heart" : "heart-outline"}
                size={18}
                color={liked ? Palette.turquoise : Palette.textMuted}
              />
              <Text style={[styles.actionCount, liked && styles.actionCountActive]}>
                {likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Comments unavailable",
                  "Community comments are not available in this local-only app."
                )
              }
              activeOpacity={0.7}
              style={styles.actionBtn}
              accessibilityRole="button"
              accessibilityLabel={`View ${post.commentsCount} comments`}
            >
              <Ionicons name="chatbubble-outline" size={17} color={Palette.textMuted} />
              <Text style={styles.actionCount}>{post.commentsCount}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.7}
            style={styles.shareBtn}
          >
            <Ionicons name="share-social-outline" size={18} color={Palette.oceanTeal} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    marginBottom: 16,
    marginHorizontal: 20,
    backgroundColor: Palette.pureWhite, // Pure White card surface
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSurface: {
    padding: 16,
    borderRadius: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Palette.turquoise, // Turquoise avatar ring
    backgroundColor: Palette.mintMist,
  },
  headerText: {
    flex: 1,
    marginLeft: 10,
  },
  authorName: {
    fontSize: 14.5,
    fontWeight: "800",
    color: Palette.deepTeal,
    fontFamily: AppFonts.displaySans,
  },
  dedicationText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  mentorHighlight: {
    color: Palette.oceanTeal,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  timeAgo: {
    fontSize: 11,
    color: Palette.textMuted,
    fontFamily: AppFonts.body,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    color: Palette.deepTeal,
    marginBottom: 12,
    fontFamily: AppFonts.displaySerif,
    fontStyle: "italic",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14,
  },
  postImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(84, 0, 14, 0.08)",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    fontWeight: "600",
  },
  actionCountActive: {
    color: Palette.turquoise,
  },
  shareBtn: {
    padding: 4,
  },
});
