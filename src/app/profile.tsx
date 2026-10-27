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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import BottomNavigation from "@/components/home/BottomNavigation";
import { MaxContentWidth, Palette } from "@/constants/theme";
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
          <View style={styles.identityTopRow}>
            <View>
              <Text style={styles.eyebrow}>A LIFE OF GRATITUDE</Text>
              <Text style={styles.welcomeTitle}>Your story, kept close.</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/profile-edit")}
              style={styles.editIcon}
              accessibilityRole="button"
              accessibilityLabel="Edit profile photo and information"
            >
              <Ionicons name="pencil" size={17} color={Palette.deepTeal} />
            </TouchableOpacity>
          </View>

          <View style={styles.identityRow}>
            <TouchableOpacity
              onPress={() => router.push("/profile-edit")}
              style={styles.avatarButton}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarFallback}>{getInitials(profile.name)}</Text>
                {profile.avatarUri ? (
                  <Image source={{ uri: profile.avatarUri }} style={styles.avatarImage} />
                ) : null}
              </View>
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={13} color={Palette.pureWhite} />
              </View>
            </TouchableOpacity>

            <View style={styles.identityCopy}>
              <Text style={styles.profileName} numberOfLines={2}>
                {profile.name}
              </Text>
              <Text style={styles.username}>@{profile.username}</Text>
              <Text style={styles.bio} numberOfLines={3}>
                {profile.bio}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push("/profile-edit")}
            activeOpacity={0.82}
            accessibilityRole="button"
          >
            <Ionicons name="create-outline" size={17} color={Palette.pureWhite} />
            <Text style={styles.editProfileText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionTitle}>Your keepsakes</Text>
            <Text style={styles.sectionSubtitle}>A little measure of what you carry.</Text>
          </View>
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
  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${count} ${label}. Open collection.`}
    >
      <Ionicons name={icon} size={19} color={Palette.turquoise} />
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
    height: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Palette.deepTeal,
    fontSize: 22,
    fontWeight: "800",
  },
  content: {
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
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
    padding: 18,
    borderRadius: 25,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: Palette.deepTeal,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  identityTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    color: Palette.turquoise,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  welcomeTitle: {
    marginTop: 4,
    color: Palette.deepTeal,
    fontSize: 21,
    fontWeight: "800",
  },
  editIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
  },
  identityRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  avatarButton: { position: "relative", marginRight: 15 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: Palette.turquoise,
    backgroundColor: Palette.mintMist,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarFallback: {
    color: Palette.deepTeal,
    fontSize: 27,
    fontWeight: "800",
  },
  avatarImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 43,
  },
  cameraBadge: {
    position: "absolute",
    right: -1,
    bottom: 0,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: Palette.oceanTeal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.pureWhite,
  },
  identityCopy: { flex: 1 },
  profileName: {
    color: Palette.deepTeal,
    fontSize: 23,
    fontWeight: "800",
  },
  username: { marginTop: 2, color: Palette.textSecondary, fontSize: 12 },
  bio: { marginTop: 7, color: Palette.deepTeal, fontSize: 13, lineHeight: 18 },
  editProfileButton: {
    minHeight: 43,
    marginTop: 17,
    borderRadius: 15,
    backgroundColor: Palette.oceanTeal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editProfileText: { color: Palette.pureWhite, fontSize: 13, fontWeight: "800" },
  sectionHeadingRow: { marginTop: 24, marginBottom: 12 },
  sectionTitle: {
    color: Palette.deepTeal,
    fontSize: 21,
    fontWeight: "800",
  },
  sectionSubtitle: { marginTop: 3, color: Palette.textSecondary, fontSize: 12 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    minHeight: 102,
    paddingHorizontal: 7,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  statNumber: {
    marginTop: 5,
    color: Palette.deepTeal,
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    marginTop: 1,
    color: Palette.textSecondary,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
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
