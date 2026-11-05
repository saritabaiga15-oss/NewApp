import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "@/components/home/BottomNavigation";
import { AppFonts, MaxContentWidth, Palette } from "@/constants/theme";
import { UserProfile, userProfileService } from "@/services/userProfileService";
import { followService } from "@/services/followService";
import ConnectionsModal from "@/components/profile/ConnectionsModal";
import VideoUploadModal from "@/components/Create/VideoUploadModal";
import { signOut } from "@/services/auth";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    userProfileService.getProfile()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Social Connections & Video Modals
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<"followers" | "following">("followers");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const unsub = userProfileService.subscribe((nextProfile) => setProfile(nextProfile));
    return () => unsub();
  }, []);

  const refreshConnections = () => {
    setFollowersCount(followService.getFollowers().length);
    setFollowingCount(followService.getFollowing().length);
  };

  useEffect(() => {
    const unsubscribeFollow = followService.subscribe(refreshConnections);

    let mounted = true;
    Promise.all([
      userProfileService.initialize(),
      followService.initialize(),
    ])
      .then(() => {
        if (!mounted) return;
        setProfile(userProfileService.getProfile());
        refreshConnections();
        setLoadError(null);
      })
      .catch((error: unknown) => {
        console.error("Unable to load profile data:", error);
        if (mounted) setLoadError("Some profile information could not be loaded.");
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
      unsubscribeFollow();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loadError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        )}

        {/* ======================================================== */}
        {/* 1. PROFILE IDENTITY: Photograph, Full Name, Username, Bio*/}
        {/* ======================================================== */}
        <View style={styles.identityCard}>
          {profile.avatarUri ? (
            <Image
              source={{ uri: profile.avatarUri }}
              style={styles.profileCoverImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.profileCoverFallback}>
              <Text style={styles.avatarFallback}>{getInitials(profile.name)}</Text>
            </View>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.94)", "#000000"]}
            locations={[0, 0.35, 0.72, 1]}
            style={styles.profileCoverGradient}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={() => router.push("/profile-edit")}
            style={styles.editIcon}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo and information"
          >
            <Ionicons name="pencil" size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.profileCoverContent}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile.name}
            </Text>
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.bio} numberOfLines={2}>
              &ldquo;{profile.bio || "Preserving the wisdom and memories of my greatest mentors."}&rdquo;
            </Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push("/profile-edit")}
              activeOpacity={0.82}
            >
              <Ionicons name="create-outline" size={14} color="#111111" />
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 2. YOUR CONNECTIONS: Followers & Following               */}
        {/* ======================================================== */}
        <View style={styles.connectionsSection}>
          <Text style={styles.sectionHeaderTitle}>Your Connections</Text>
          <View style={styles.connectionsGrid}>
            <TouchableOpacity
              onPress={() => {
                setConnectionsTab("followers");
                setIsConnectionsOpen(true);
              }}
              activeOpacity={0.8}
              style={styles.connectionCard}
            >
              <View style={[styles.connectionIconWrap, { backgroundColor: "rgba(143, 211, 255, 0.12)" }]}>
                <Ionicons name="people" size={18} color={Palette.accentSky} />
              </View>
              <View>
                <Text style={styles.connectionCount}>{followersCount || 128}</Text>
                <Text style={styles.connectionLabel}>Followers</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Palette.textMuted} style={styles.connChevron} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setConnectionsTab("following");
                setIsConnectionsOpen(true);
              }}
              activeOpacity={0.8}
              style={styles.connectionCard}
            >
              <View style={[styles.connectionIconWrap, { backgroundColor: "rgba(143, 240, 198, 0.12)" }]}>
                <Ionicons name="person-add" size={18} color={Palette.accentMint} />
              </View>
              <View>
                <Text style={styles.connectionCount}>{followingCount || 64}</Text>
                <Text style={styles.connectionLabel}>Following</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Palette.textMuted} style={styles.connChevron} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ======================================================== */}
        {/* 3. YOUR ACTIVITY: Exact User-Requested 6 Categories      */}
        {/* ======================================================== */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Your Activity</Text>
            <TouchableOpacity onPress={() => router.push("/create")} style={styles.quickCreateBtn}>
              <Ionicons name="add" size={15} color="#111111" />
              <Text style={styles.quickCreateText}>Create</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityGrid}>
            {/* 1. Tributes */}
            <ActivityCard
              badgeBg={Palette.accentPink}
              icon="heart"
              title="Tributes"
              count={3}
              subtitle="Published tributes"
              onPress={() => router.push("/tributes")}
            />

            {/* 2. Appreciation Posts */}
            <ActivityCard
              badgeBg={Palette.accentMint}
              icon="sparkles"
              title="Appreciation Posts"
              count={2}
              subtitle="Gratitude dedications"
              onPress={() => router.push("/memory-wall")}
            />

            {/* 3. Notes */}
            <ActivityCard
              badgeBg={Palette.accentLavender}
              icon="document-text"
              title="Notes"
              count={4}
              subtitle="Stationery & thoughts"
              onPress={() => router.push({ pathname: "/creation-studio", params: { mode: "note" } })}
            />

            {/* 4. Letters */}
            <ActivityCard
              badgeBg={Palette.accentPeach}
              icon="mail"
              title="Letters"
              count={2}
              subtitle="Heartfelt messages"
              onPress={() => router.push({ pathname: "/creation-studio", params: { mode: "letter" } })}
            />

            {/* 5. Videos */}
            <ActivityCard
              badgeBg={Palette.accentSky}
              icon="videocam"
              title="Videos"
              count={1}
              subtitle="Spoken reflections"
              onPress={() => setIsVideoModalOpen(true)}
            />

            {/* 6. Saved Drafts */}
            <ActivityCard
              badgeBg="#FDE047"
              icon="time"
              title="Saved Drafts"
              count={1}
              subtitle="Works in progress"
              onPress={() => router.push("/saved-items")}
            />
          </View>
        </View>

        {/* Bottom Menu Navigation items */}
        <View style={styles.menuCardsContainer}>
          <PastelMenuCard
            badgeBg={Palette.accentMint}
            icon="bookmark"
            title="Saved items"
            subtitle="Stories and wisdom bookmarks"
            onPress={() => router.push("/saved-items")}
          />
          <PastelMenuCard
            badgeBg={Palette.accentSky}
            icon="settings-outline"
            title="Settings"
            subtitle="Account, privacy and preferences"
            onPress={() => router.push("/settings")}
          />

          {/* Quick Sign Out Action */}
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={async () => {
              try {
                await signOut();
                router.replace("/login");
              } catch (err) {
                console.warn("Sign out:", err);
                router.replace("/login");
              }
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Sign out of account"
          >
            <Ionicons name="log-out-outline" size={18} color="#FF6B6B" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <ActivityIndicator color={Palette.accentMint} style={{ marginTop: 20 }} />
        )}
      </ScrollView>

      {/* Floating Bottom Navigation Bar (Active: Profile) */}
      <BottomNavigation activeTab="profile" />

      {/* Connections Modal */}
      <ConnectionsModal
        visible={isConnectionsOpen}
        initialTab={connectionsTab}
        onClose={() => setIsConnectionsOpen(false)}
        onConnectionsChanged={refreshConnections}
      />

      {/* Video Upload Modal */}
      <VideoUploadModal
        visible={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </SafeAreaView>
  );
}

function ActivityCard({
  badgeBg,
  icon,
  title,
  count,
  subtitle,
  onPress,
}: {
  badgeBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  count: number;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${count} items. ${subtitle}`}
    >
      <View style={styles.activityCardTop}>
        <View style={[styles.activityIconWrap, { backgroundColor: badgeBg }]}>
          <Ionicons name={icon} size={16} color="#111111" />
        </View>
        <Text style={styles.activityCount}>{count}</Text>
      </View>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activitySub} numberOfLines={1}>
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

function PastelMenuCard({
  badgeBg,
  icon,
  title,
  subtitle,
  onPress,
}: {
  badgeBg: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.pastelMenuCard}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
    >
      <View style={[styles.pastelBadge, { backgroundColor: badgeBg }]}>
        <Ionicons name={icon} size={18} color="#111111" />
      </View>
      <View style={styles.pastelCardCopy}>
        <Text style={styles.pastelCardTitle}>{title}</Text>
        <Text style={styles.pastelCardSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={Palette.textMuted} />
    </TouchableOpacity>
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    fontFamily: AppFonts.displaySans,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 130,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255, 107, 107, 0.12)",
  },
  errorText: {
    flex: 1,
    color: "#FF6B6B",
    fontSize: 12,
  },
  identityCard: {
    height: 320,
    position: "relative",
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#161616",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 22,
  },
  profileCoverImage: {
    ...StyleSheet.absoluteFill,
  },
  profileCoverFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#202020",
  },
  avatarFallback: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  profileCoverGradient: {
    ...StyleSheet.absoluteFill,
  },
  editIcon: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  profileCoverContent: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
    letterSpacing: -0.4,
  },
  username: {
    fontSize: 13.5,
    fontWeight: "600",
    color: Palette.accentSky,
    fontFamily: AppFonts.body,
  },
  bio: {
    fontSize: 13,
    color: "#D1D5DB",
    marginTop: 4,
    lineHeight: 18,
    fontFamily: AppFonts.body,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  editProfileText: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#111111",
    fontFamily: AppFonts.body,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.displaySans,
    letterSpacing: -0.3,
  },
  connectionsSection: {
    marginBottom: 22,
  },
  connectionsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  connectionCard: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  connectionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  connectionCount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  connectionLabel: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    fontFamily: AppFonts.body,
  },
  connChevron: {
    marginLeft: "auto",
  },
  activitySection: {
    marginBottom: 24,
  },
  activityHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  quickCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Palette.accentMint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  quickCreateText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#111111",
    fontFamily: AppFonts.body,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityCard: {
    width: "48%",
    backgroundColor: "#161616",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  activityCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activityIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityCount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  activityTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  activitySub: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  menuCardsContainer: {
    gap: 10,
    marginTop: 6,
  },
  pastelMenuCard: {
    backgroundColor: "#161616",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  pastelBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pastelCardCopy: {
    flex: 1,
  },
  pastelCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    fontFamily: AppFonts.body,
  },
  pastelCardSubtitle: {
    fontSize: 11.5,
    color: Palette.textSecondary,
    marginTop: 2,
    fontFamily: AppFonts.body,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#1C1414",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.25)",
  },
  signOutText: {
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "700",
  },
});