import React, { useEffect, useMemo, useState } from "react";
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
import { memoryService } from "@/services/memoryService";
import { storyBookmarkService } from "@/services/storyBookmarkService";
import { tributeDraftService } from "@/services/tributeDraftService";
import { UserProfile, userProfileService } from "@/services/userProfileService";
import { getAllStories, WISDOM_LESSON } from "@/data/mockStories";
import type { LessonQuote, Story } from "@/types/story";
import type { WallItem } from "@/types/memoryWall";

type ProfileActionIcon = keyof typeof Ionicons.glyphMap;

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    userProfileService.getProfile()
  );
  const [items, setItems] = useState<WallItem[]>(() =>
    memoryService.getUserCreatedItems()
  );
  const [bookmarkedStories, setBookmarkedStories] = useState<Story[]>([]);
  const [savedLessons, setSavedLessons] = useState<LessonQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(
    () => userProfileService.subscribe((nextProfile) => setProfile(nextProfile)),
    []
  );

  useEffect(() => {
    const syncItems = () => setItems(memoryService.getUserCreatedItems());
    const unsubscribeMemory = memoryService.subscribe(syncItems);
    const unsubscribeTributes = tributeDraftService.subscribe(syncItems);
    const unsubscribeBookmarks = storyBookmarkService.subscribe(syncStories);
    const unsubscribeLessons = storyBookmarkService.subscribeLessons(syncLessons);

    function syncStories() {
      const bookmarkedIds = new Set(storyBookmarkService.getBookmarkedStoryIds());
      setBookmarkedStories(
        getAllStories().filter((story) => bookmarkedIds.has(story.id))
      );
    }

    function syncLessons() {
      const savedIds = new Set(storyBookmarkService.getSavedLessonIds());
      const availableLessons: LessonQuote[] = [
        WISDOM_LESSON,
        ...getAllStories()
          .filter((story) => !!story.keyLesson)
          .map((story) => ({
            id: story.id,
            quote: story.keyLesson || "",
            attribution: story.author,
            storyTitle: story.title,
            storyId: story.id,
          })),
      ];
      setSavedLessons(availableLessons.filter((lesson) => savedIds.has(lesson.id)));
    }

    let mounted = true;
    Promise.all([
      memoryService.initialize(),
      userProfileService.initialize(),
      tributeDraftService.initialize(),
      storyBookmarkService.initialize(),
    ])
      .then(() => {
        if (!mounted) return;
        setProfile(userProfileService.getProfile());
        memoryService.getAllMemories();
        syncItems();
        syncStories();
        syncLessons();
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
      unsubscribeMemory();
      unsubscribeTributes();
      unsubscribeBookmarks();
      unsubscribeLessons();
    };
  }, []);

  const tributes = (() => {
    memoryService.getAllMemories();
    return tributeDraftService
      .getSavedKeepsakes()
      .map((keepsake) => {
        const currentItem = memoryService.getMemoryById(keepsake.id);
        return {
          kind: "tribute" as const,
          id: keepsake.id,
          mentorName: keepsake.mentorName,
          relationship: keepsake.relationship,
          photoUri: keepsake.photoUri,
          quote: keepsake.quote,
          title: keepsake.customTitle || `A Tribute to ${keepsake.mentorName}`,
          story: keepsake.story,
          createdAt: keepsake.createdAt,
          templateId: keepsake.templateId,
          isPinned: currentItem?.isPinned,
          mentorId: currentItem?.mentorId,
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  })();
  const memories = useMemo(
    () => items.filter((item) => item.kind === "memory"),
    [items]
  );
  const pinnedItems = useMemo(
    () => [
      ...memoryService.getUserSavedItems().filter((item) => item.kind !== "tribute"),
      ...tributes.filter((tribute) => tribute.isPinned),
    ],
    [tributes]
  );

  const openMemory = (item: WallItem) =>
    router.push({ pathname: "/memory-detail/[id]", params: { id: item.id } });
  const openStory = (story: Story) =>
    router.push({ pathname: "/stories/[id]", params: { id: story.id } });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.iceWhite} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/home"))}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={23} color={Palette.deepTeal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your archive</Text>
        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.headerIcon}
          accessibilityRole="button"
          accessibilityLabel="Open settings"
        >
          <Ionicons name="settings-outline" size={21} color={Palette.deepTeal} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loadError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color={Palette.deepTeal} />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        )}

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
            colors={["transparent", "rgba(0, 0, 0, 0.12)", "rgba(0, 0, 0, 0.94)", "#000000"]}
            locations={[0, 0.34, 0.7, 1]}
            style={styles.profileCoverGradient}
            pointerEvents="none"
          />
          <TouchableOpacity
            onPress={() => router.push("/profile-edit")}
            style={styles.editIcon}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo and information"
          >
            <Ionicons name="pencil" size={17} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.profileCoverContent}>
            <Text style={styles.profileName} numberOfLines={2}>
              {profile.name}
            </Text>
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.bio} numberOfLines={2}>
              &ldquo;{profile.bio}&rdquo;
            </Text>
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => router.push("/profile-edit")}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Text style={styles.editProfileText}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Your keepsakes</Text>
          <Text style={styles.sectionSubtitle}>What you carry</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            count={tributes.length}
            label="Tributes"
            icon="heart-outline"
            onPress={() => router.push("/tributes")}
          />
          <StatCard
            count={memories.length}
            label="Memories"
            icon="images-outline"
            onPress={() => router.push("/memories")}
          />
          <StatCard
            count={bookmarkedStories.length}
            label="Stories saved"
            icon="bookmark-outline"
            onPress={() => router.push("/saved-items?section=stories")}
          />
        </View>

        <TouchableOpacity
          style={styles.createTributePrompt}
          onPress={() => router.push("/create-tribute")}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Honour someone who helped you grow"
        >
          <Ionicons name="heart-outline" size={16} color={Palette.accentSky} />
          <Text style={styles.createTributePromptText}>
            Honour someone who helped you grow
          </Text>
          <Ionicons name="chevron-forward" size={15} color={Palette.accentSky} />
        </TouchableOpacity>

        <SectionHeading
          title="My tributes"
          action="View all"
          onAction={() => router.push("/tributes")}
        />
        {isLoading ? (
          <ActivityIndicator color={Palette.turquoise} style={styles.loader} />
        ) : tributes.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCards}
          >
            {tributes.slice(0, 6).map((tribute) => (
              <TouchableOpacity
                key={tribute.id}
                style={styles.tributeCard}
                onPress={() => openMemory(tribute)}
                activeOpacity={0.86}
                accessibilityRole="button"
                accessibilityLabel={`Open tribute to ${tribute.mentorName}`}
              >
                <Image source={{ uri: tribute.photoUri }} style={styles.tributePhoto} />
                <View style={styles.tributeCardBody}>
                  <Text style={styles.tributeRelationship}>{tribute.relationship}</Text>
                  <Text style={styles.tributeName} numberOfLines={1}>
                    {tribute.mentorName}
                  </Text>
                  <Text style={styles.tributeExcerpt} numberOfLines={2}>
                    {tribute.quote || tribute.story || "A tribute kept with gratitude."}
                  </Text>
                  <Text style={styles.tributeDate}>{formatDate(tribute.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="heart-outline" size={24} color={Palette.oceanTeal} />
            </View>
            <Text style={styles.emptyTitle}>There is room for a first.</Text>
            <Text style={styles.emptyCopy}>
              Begin with someone whose kindness still guides you.
            </Text>
            <TouchableOpacity
              style={styles.emptyAction}
              onPress={() => router.push("/create-tribute")}
              accessibilityRole="button"
            >
              <Text style={styles.emptyActionText}>Create your first tribute</Text>
              <Ionicons name="arrow-forward" size={15} color={Palette.pureWhite} />
            </TouchableOpacity>
          </View>
        )}

        <SectionHeading
          title="My saved collection"
          action="View all"
          onAction={() => router.push("/saved-items")}
        />
        {pinnedItems.length === 0 &&
        bookmarkedStories.length === 0 &&
        savedLessons.length === 0 ? (
          <TouchableOpacity
            style={styles.savedEmpty}
            onPress={() => router.push("/discover")}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Ionicons name="bookmark-outline" size={20} color={Palette.turquoise} />
            <View style={styles.savedEmptyCopy}>
              <Text style={styles.savedEmptyTitle}>Keep a story close</Text>
              <Text style={styles.savedEmptySubtitle}>
                Save a story or lesson, or pin one of your memories.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Palette.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.savedList}>
            {bookmarkedStories.slice(0, 2).map((story) => (
              <SavedRow
                key={`story-${story.id}`}
                title={story.title}
                subtitle={`Story · ${story.relationship}`}
                imageUri={story.imageUrl}
                icon="book-outline"
                onPress={() => openStory(story)}
              />
            ))}
            {savedLessons.slice(0, 2).map((lesson) => (
              <SavedRow
                key={`lesson-${lesson.id}`}
                title={lesson.storyTitle}
                subtitle={`Saved lesson · ${lesson.attribution}`}
                icon="bulb-outline"
                onPress={() =>
                  router.push({
                    pathname: "/stories/[id]",
                    params: { id: lesson.storyId },
                  })
                }
              />
            ))}
            {pinnedItems.slice(0, 2).map((item) => (
              <SavedRow
                key={`memory-${item.id}`}
                title={getItemTitle(item)}
                subtitle={`Pinned memory · ${item.mentorName}`}
                imageUri={getItemImage(item)}
                icon="pin-outline"
                onPress={() => openMemory(item)}
              />
            ))}
          </View>
        )}

        <SectionHeading title="Account & preferences" />
        <View style={styles.accountCard}>
          <AccountRow
            icon="person-circle-outline"
            title="Personal information"
            subtitle="Name, username, photograph and bio"
            onPress={() => router.push("/profile-edit")}
          />
          <AccountRow
            icon="shield-checkmark-outline"
            title="Email & account security"
            subtitle="Manage your password"
            onPress={() => router.push("/forgot-password")}
          />
          <AccountRow
            icon="options-outline"
            title="Notifications & preferences"
            subtitle="Review available app preferences"
            onPress={() => router.push("/settings")}
          />
          <AccountRow
            icon="lock-closed-outline"
            title="Privacy & story visibility"
            subtitle="Your keepsakes are stored on this device"
            onPress={() => router.push("/memory-wall")}
            last
          />
        </View>

        {isLoading && (
          <Text style={styles.loadingNote}>Loading your saved profile data…</Text>
        )}
      </ScrollView>
      <BottomNavigation activeTab="profile" />
    </SafeAreaView>
  );
}

function StatCard({
  count,
  label,
  icon,
  onPress,
}: {
  count: number;
  label: string;
  icon: ProfileActionIcon;
  onPress: () => void;
}) {
  const iconColor =
    label === "Tributes"
      ? Palette.accentPink
      : label === "Memories"
        ? Palette.accentAmber
        : Palette.accentSky;

  return (
    <TouchableOpacity
      style={[styles.statCard, label === "Memories" && styles.statCardFeatured]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${count} ${label}. Open collection.`}
    >
      <Ionicons name={icon} size={17} color={iconColor} />
      <Text style={styles.statNumber}>{count}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={action}
        >
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function SavedRow({
  title,
  subtitle,
  imageUri,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  imageUri?: string;
  icon: ProfileActionIcon;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.savedRow}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.savedThumb} />
      ) : (
        <View style={styles.savedThumbFallback}>
          <Ionicons name={icon} size={19} color={Palette.oceanTeal} />
        </View>
      )}
      <View style={styles.savedRowCopy}>
        <Text style={styles.savedRowTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.savedRowSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Palette.textSecondary} />
    </TouchableOpacity>
  );
}

function AccountRow({
  icon,
  title,
  subtitle,
  onPress,
  last = false,
}: {
  icon: ProfileActionIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.accountRow, last && styles.accountRowLast]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
    >
      <View style={styles.accountIcon}>
        <Ionicons name={icon} size={19} color={Palette.oceanTeal} />
      </View>
      <View style={styles.accountCopy}>
        <Text style={styles.accountTitle}>{title}</Text>
        <Text style={styles.accountSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Palette.textMuted} />
    </TouchableOpacity>
  );
}

function getItemTitle(item: WallItem): string {
  if (item.kind === "lesson") return item.lessonTitle;
  return "title" in item && item.title ? item.title : "Saved memory";
}

function getItemImage(item: WallItem): string | undefined {
  if (item.kind === "tribute") return item.photoUri || undefined;
  if ("imageUri" in item) return item.imageUri;
  return undefined;
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

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.iceWhite },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Palette.cream,
    fontSize: 16,
    fontWeight: "700",
    fontStyle: "italic",
    fontFamily: AppFonts.body,
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 132,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginBottom: 12,
    borderRadius: 13,
    backgroundColor: Palette.turquoiseSoft,
  },
  errorText: { flex: 1, color: Palette.deepTeal, fontSize: 12 },
  identityCard: {
    height: 310,
    position: "relative",
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 3,
  },
  profileCoverImage: {
    ...StyleSheet.absoluteFill,
  },
  profileCoverFallback: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.surfaceElevated,
  },
  profileCoverGradient: {
    ...StyleSheet.absoluteFill,
  },
  editIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(23, 23, 23, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallback: {
    color: Palette.textPrimary,
    fontSize: 42,
    fontWeight: "800",
  },
  profileCoverContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },
  username: { marginTop: 1, color: "#E5E5E5", fontSize: 12 },
  bio: {
    marginTop: 7,
    marginBottom: 12,
    color: Palette.cream,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: AppFonts.body,
    fontStyle: "italic",
    fontWeight: "600",
  },
  editProfileButton: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },
  editProfileText: { color: "#000000", fontSize: 13, fontWeight: "800" },
  sectionHeadingRow: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: Palette.cream,
    fontSize: 17,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  sectionSubtitle: { color: Palette.accentSky, fontSize: 9.5 },
  statsRow: { flexDirection: "row", gap: 7 },
  statCard: {
    flex: 1,
    minHeight: 88,
    paddingHorizontal: 5,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  statCardFeatured: {
    borderColor: "rgba(239, 162, 91, 0.55)",
  },
  statNumber: {
    marginTop: 3,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: AppFonts.body,
  },
  statLabel: {
    marginTop: 1,
    color: Palette.textSecondary,
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  createTributePrompt: {
    minHeight: 38,
    marginTop: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.45)",
    backgroundColor: "#050505",
  },
  createTributePromptText: {
    color: Palette.accentSky,
    fontSize: 10,
    fontWeight: "600",
    flexShrink: 1,
  },
  sectionHeading: {
    marginTop: 25,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionAction: { color: Palette.oceanTeal, fontSize: 12, fontWeight: "800" },
  loader: { marginVertical: 26 },
  horizontalCards: { gap: 12, paddingRight: 6, paddingBottom: 4 },
  tributeCard: {
    width: 226,
    overflow: "hidden",
    borderRadius: 19,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  tributePhoto: { width: "100%", height: 134, backgroundColor: Palette.mintMist },
  tributeCardBody: { padding: 13 },
  tributeRelationship: {
    color: Palette.turquoise,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tributeName: {
    marginTop: 4,
    color: Palette.deepTeal,
    fontSize: 17,
    fontWeight: "800",
  },
  tributeExcerpt: {
    minHeight: 38,
    marginTop: 5,
    color: Palette.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  tributeDate: { marginTop: 8, color: Palette.textMuted, fontSize: 10 },
  emptyCard: {
    alignItems: "center",
    padding: 21,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 10,
    color: Palette.deepTeal,
    fontSize: 17,
    fontWeight: "800",
  },
  emptyCopy: {
    marginTop: 4,
    color: Palette.textSecondary,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: Palette.oceanTeal,
  },
  emptyActionText: { color: Palette.pureWhite, fontSize: 12, fontWeight: "800" },
  savedEmpty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  savedEmptyCopy: { flex: 1 },
  savedEmptyTitle: { color: Palette.deepTeal, fontSize: 13, fontWeight: "800" },
  savedEmptySubtitle: { marginTop: 3, color: Palette.textSecondary, fontSize: 11 },
  savedList: {
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  savedRow: {
    minHeight: 69,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  savedThumb: {
    width: 45,
    height: 45,
    borderRadius: 11,
    backgroundColor: Palette.mintMist,
  },
  savedThumbFallback: {
    width: 45,
    height: 45,
    borderRadius: 11,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
  },
  savedRowCopy: { flex: 1 },
  savedRowTitle: { color: Palette.deepTeal, fontSize: 12, fontWeight: "800" },
  savedRowSubtitle: { marginTop: 3, color: Palette.textSecondary, fontSize: 10 },
  accountCard: {
    paddingHorizontal: 13,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  accountRow: {
    minHeight: 69,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  accountRowLast: { borderBottomWidth: 0 },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.mintMist,
  },
  accountCopy: { flex: 1 },
  accountTitle: { color: Palette.deepTeal, fontSize: 12, fontWeight: "800" },
  accountSubtitle: { marginTop: 3, color: Palette.textSecondary, fontSize: 10 },
  loadingNote: {
    marginTop: 18,
    color: Palette.textSecondary,
    textAlign: "center",
    fontSize: 11,
  },
});
