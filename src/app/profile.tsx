import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import BottomNavigation from "@/components/home/BottomNavigation";
import YearGratitudeCard from "@/components/profile/YearGratitudeCard";
import { Palette } from "@/constants/theme";
import { UserProfile, userProfileService } from "@/services/userProfileService";
import { memoryService } from "@/services/memoryService";
import type {
  WallItem,
  WallMentorProfile,
} from "@/types/memoryWall";

type BadgeIcon = keyof typeof Ionicons.glyphMap;

interface ProfileBadge {
  title: string;
  detail: string;
  icon: BadgeIcon;
  locked?: boolean;
}

const ACTION_ROWS: {
  title: string;
  subtitle: string;
  icon: BadgeIcon;
  tint: string;
  color: string;
  action: "wall" | "create" | "days" | "privacy";
}[] = [
  {
    title: "Memory Wall",
    subtitle: "Your saved tributes and memories",
    icon: "library-outline",
    tint: "#F9E5E8",
    color: "#A62B4A",
    action: "wall",
  },
  {
    title: "Create a keepsake",
    subtitle: "Turn a memory into a gift",
    icon: "gift-outline",
    tint: "#FDEAD7",
    color: "#C45A12",
    action: "create",
  },
  {
    title: "Important days",
    subtitle: "Birthdays and anniversaries to remember",
    icon: "notifications-outline",
    tint: "#F8E4E8",
    color: "#B84D5A",
    action: "days",
  },
  {
    title: "Privacy",
    subtitle: "Choose who sees each tribute",
    icon: "shield-outline",
    tint: "#F9EDCB",
    color: "#89600B",
    action: "privacy",
  },
];

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    userProfileService.getProfile()
  );
  const [items, setItems] = useState<WallItem[]>(() =>
    memoryService.getAllMemories()
  );
  const [mentors, setMentors] = useState<WallMentorProfile[]>(() =>
    memoryService.getAllMentorProfiles()
  );
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [avatarErrorUri, setAvatarErrorUri] = useState<string | null>(null);

  useEffect(
    () => userProfileService.subscribe((nextProfile) => setProfile(nextProfile)),
    []
  );

  useEffect(() => {
    const syncMemories = () => {
      setItems(memoryService.getAllMemories());
      setMentors(memoryService.getAllMentorProfiles());
    };
    return memoryService.subscribe(syncMemories);
  }, []);

  const currentYear = new Date().getFullYear();
  const currentYearItems = useMemo(
    () => items.filter((item) => item.createdAt.startsWith(String(currentYear))),
    [currentYear, items]
  );
  const honouredMentors = useMemo(
    () =>
      mentors.filter((mentor) =>
        items.some(
          (item) =>
            item.mentorId === mentor.id ||
            item.mentorName.trim().toLowerCase() === mentor.name.trim().toLowerCase()
        )
      ),
    [items, mentors]
  );
  const currentYearMentors = useMemo(() => {
    const names = new Set(
      currentYearItems.map((item) => item.mentorName.trim().toLowerCase())
    );
    return mentors.filter((mentor) => names.has(mentor.name.trim().toLowerCase()));
  }, [currentYearItems, mentors]);

  const memoryCount = items.filter((item) => item.kind === "memory").length;
  const letterCount = items.filter((item) => item.kind === "letter").length;
  const tributeCount = items.filter((item) => item.kind === "tribute").length;
  const firstTributeYear = items
    .filter((item) => item.kind === "tribute")
    .map((item) => item.createdAt.slice(0, 4))
    .sort()[0];

  const badges: ProfileBadge[] = [
    ...(tributeCount > 0
      ? [
          {
            title: "First tribute",
            detail: firstTributeYear ? `Written in ${firstTributeYear}` : "First tribute saved",
            icon: "heart-outline" as const,
          },
        ]
      : []),
    ...(letterCount > 0
      ? [
          {
            title: "Letter writer",
            detail: `${letterCount} ${letterCount === 1 ? "letter" : "letters"} sent`,
            icon: "mail-outline" as const,
          },
        ]
      : []),
    {
      title: "Five mentors",
      detail:
        honouredMentors.length >= 5
          ? `Honoured ${honouredMentors.length} people`
          : `${5 - honouredMentors.length} more to go`,
      icon: "star-outline",
      locked: honouredMentors.length < 5,
    },
    {
      title: "Ten mentors",
      detail: `${Math.max(0, 10 - honouredMentors.length)} more to go`,
      icon: "lock-closed-outline",
      locked: honouredMentors.length < 10,
    },
  ];

  const openEdit = () => {
    setName(profile.name);
    setEmail(profile.email);
    setIsEditVisible(true);
  };

  const saveProfile = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Enter your name before saving your profile.");
      return;
    }
    userProfileService.updateProfile({ name, email });
    setIsEditVisible(false);
    Alert.alert("Profile saved", "Your local profile details have been updated.");
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/home");
  };

  const handleAction = (action: (typeof ACTION_ROWS)[number]["action"]) => {
    if (action === "wall") {
      router.push("/memory-wall");
    } else if (action === "create") {
      router.push("/create");
    } else if (action === "days") {
      Alert.alert(
        "Important days",
        "Birthday and anniversary reminders are not set up yet."
      );
    } else {
      Alert.alert(
        "Privacy",
        "Your profile and keepsakes are local in this frontend-only app. Sharing is up to you."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={Palette.deepTeal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your profile</Text>
        <TouchableOpacity
          onPress={openEdit}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Edit your profile"
        >
          <Ionicons name="create-outline" size={22} color={Palette.deepTeal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <LinearGradient
            colors={["#68152A", "#3A0A14"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileBanner}
          />
          <View style={[styles.bannerGlow, { pointerEvents: "none" }]} />

          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarFallback}>{getInitials(profile.name)}</Text>
              {profile.avatarUri && avatarErrorUri !== profile.avatarUri && (
                <Image
                  source={{ uri: profile.avatarUri }}
                  style={styles.avatarImage}
                  onError={() => setAvatarErrorUri(profile.avatarUri)}
                />
              )}
            </View>
          </View>

          <Text style={styles.profileName} numberOfLines={2}>
            {profile.name}
          </Text>
          <Text style={styles.email}>{profile.email}</Text>
          <Text style={styles.bio}>“Learning to pass it forward.”</Text>
          <View style={styles.privateBadge}>
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color="#7A3A12"
            />
            <Text style={styles.privateBadgeText}>Private to you</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat value={honouredMentors.length} label="Mentors honoured" />
            <View style={styles.statDivider} />
            <Stat value={memoryCount} label="Memories" />
            <View style={styles.statDivider} />
            <Stat value={letterCount} label="Letters sent" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your mentor circle</Text>
        <TouchableOpacity
          style={styles.circleCard}
          onPress={() => router.push("/memory-wall")}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel={`See your full mentor circle, ${honouredMentors.length} people`}
        >
          <View style={styles.overlapAvatars}>
            {honouredMentors.slice(0, 3).map((mentor, index) => (
              <MentorAvatar key={mentor.id} mentor={mentor} index={index} />
            ))}
            {honouredMentors.length > 3 && (
              <View style={[styles.moreAvatar, styles.avatarOverlap]}>
                <Text style={styles.moreAvatarText}>
                  +{honouredMentors.length - 3}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.circleCopy}>
            <Text style={styles.circleTitle}>
              {honouredMentors.length}{" "}
              {honouredMentors.length === 1 ? "person" : "people"} shaped you
            </Text>
            <Text style={styles.circleSubtitle}>See your full circle</Text>
          </View>
          <Ionicons name="chevron-forward" size={23} color={Palette.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your year in gratitude</Text>
        <YearGratitudeCard
          year={currentYear}
          mentors={currentYearMentors}
          userName={profile.name}
        />

        <Text style={styles.sectionTitle}>Your badges</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesRow}
        >
          {badges.map((badge) => (
            <View key={badge.title} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeIconCircle,
                  badge.locked && styles.lockedBadgeIconCircle,
                ]}
              >
                <Ionicons
                  name={badge.icon}
                  size={25}
                  color={badge.locked ? "#8B6874" : Palette.oceanTeal}
                />
              </View>
              <Text style={styles.badgeTitle} numberOfLines={1}>
                {badge.title}
              </Text>
              <Text style={styles.badgeDetail} numberOfLines={2}>
                {badge.detail}
              </Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Your Honour Your Mentor</Text>
        {ACTION_ROWS.map((row) => (
          <TouchableOpacity
            key={row.action}
            style={styles.actionCard}
            onPress={() => handleAction(row.action)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel={`${row.title}. ${row.subtitle}`}
          >
            <View style={[styles.actionIcon, { backgroundColor: row.tint }]}>
              <Ionicons name={row.icon} size={23} color={row.color} />
            </View>
            <View style={styles.actionCopy}>
              <Text style={styles.actionTitle}>{row.title}</Text>
              <Text style={styles.actionSubtitle}>{row.subtitle}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Palette.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNavigation activeTab="profile" />

      <Modal
        visible={isEditVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit your profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel profile editing"
              >
                <Ionicons name="close" size={22} color={Palette.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              autoCapitalize="words"
            />
            <Text style={styles.fieldLabel}>EMAIL</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Palette.textMuted}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsEditVisible(false)}
                style={styles.cancelButton}
                accessibilityRole="button"
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveProfile}
                style={styles.saveButton}
                accessibilityRole="button"
              >
                <Text style={styles.saveText}>Save profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MentorAvatar({
  mentor,
  index,
}: {
  mentor: WallMentorProfile;
  index: number;
}) {
  return (
    <View
      style={[
        styles.mentorAvatar,
        { backgroundColor: mentor.coverColor },
        index > 0 && styles.avatarOverlap,
      ]}
    >
      <Text style={styles.mentorInitials}>{getInitials(mentor.name)}</Text>
      {mentor.avatarUri ? (
        <Image
          source={{ uri: mentor.avatarUri }}
          style={styles.mentorAvatarImage}
        />
      ) : null}
    </View>
  );
}

function getInitials(name: string) {
  return name
    .replace(/^(Mrs\.|Mr\.|Dr\.)\s*/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.iceWhite },
  header: {
    height: 56,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Palette.deepTeal,
    fontFamily: "serif",
    fontSize: 25,
    fontWeight: "800",
  },
  content: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 130 },
  profileCard: {
    position: "relative",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderRadius: 30,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: "#EED9CE",
    overflow: "hidden",
  },
  profileBanner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 136,
  },
  bannerGlow: {
    position: "absolute",
    top: -35,
    right: -25,
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "rgba(236, 143, 62, 0.12)",
  },
  avatarRing: {
    width: 132,
    height: 132,
    padding: 5,
    marginTop: 52,
    borderRadius: 66,
    borderWidth: 3,
    borderColor: Palette.turquoise,
    backgroundColor: Palette.pureWhite,
  },
  avatarInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    backgroundColor: "#F4C9B7",
    overflow: "hidden",
  },
  avatarImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarFallback: {
    color: "#8E1B34",
    fontFamily: "serif",
    fontSize: 36,
    fontWeight: "800",
  },
  profileName: {
    marginTop: 16,
    color: Palette.deepTeal,
    fontFamily: "serif",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  email: { marginTop: 2, color: Palette.textSecondary, fontSize: 17 },
  bio: {
    marginTop: 18,
    color: Palette.deepTeal,
    fontFamily: "serif",
    fontSize: 19,
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "center",
  },
  privateBadge: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 17,
    borderRadius: 24,
    backgroundColor: "#FDEAD7",
  },
  privateBadgeText: {
    color: "#7A3A12",
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0DDD3",
  },
  stat: {
    flex: 1,
    minHeight: 68,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  statValue: {
    color: "#C76612",
    fontFamily: "serif",
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  statLabel: {
    color: Palette.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    marginVertical: 4,
    backgroundColor: "#F0DDD3",
  },
  sectionTitle: {
    marginTop: 25,
    marginBottom: 12,
    color: Palette.deepTeal,
    fontFamily: "serif",
    fontSize: 24,
    fontWeight: "800",
  },
  circleCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#EED9CE",
    backgroundColor: Palette.pureWhite,
  },
  overlapAvatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  mentorAvatar: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Palette.pureWhite,
    overflow: "hidden",
  },
  avatarOverlap: {
    marginLeft: -13,
  },
  mentorInitials: {
    color: Palette.pureWhite,
    fontSize: 15,
    fontWeight: "800",
  },
  mentorAvatarImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 26,
  },
  moreAvatar: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Palette.pureWhite,
    backgroundColor: "#6F2C4B",
  },
  moreAvatarText: {
    color: Palette.pureWhite,
    fontSize: 14,
    fontWeight: "800",
  },
  circleCopy: { flex: 1, marginLeft: 16 },
  circleTitle: {
    color: Palette.deepTeal,
    fontSize: 16,
    fontWeight: "800",
  },
  circleSubtitle: {
    marginTop: 3,
    color: Palette.textSecondary,
    fontSize: 14,
  },
  badgesRow: {
    paddingHorizontal: 2,
    paddingBottom: 2,
    gap: 12,
  },
  badgeItem: {
    width: 112,
    alignItems: "center",
  },
  badgeIconCircle: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 42,
    backgroundColor: "#FDEAD7",
  },
  lockedBadgeIconCircle: {
    borderWidth: 2,
    borderColor: "#EED9CE",
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  badgeTitle: {
    marginTop: 9,
    color: Palette.deepTeal,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  badgeDetail: {
    marginTop: 2,
    color: Palette.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  actionCard: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EED9CE",
    backgroundColor: Palette.pureWhite,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: { flex: 1, marginHorizontal: 13 },
  actionTitle: { color: Palette.deepTeal, fontSize: 17, fontWeight: "800" },
  actionSubtitle: {
    marginTop: 3,
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 19,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  editSheet: {
    padding: 22,
    paddingBottom: 34,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Palette.iceWhite,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { color: Palette.deepTeal, fontSize: 18, fontWeight: "800" },
  fieldLabel: {
    marginBottom: 7,
    color: Palette.textSecondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
    color: Palette.deepTeal,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  cancelText: { color: Palette.deepTeal, fontWeight: "700" },
  saveButton: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: Palette.oceanTeal,
  },
  saveText: { color: Palette.pureWhite, fontWeight: "800" },
});
