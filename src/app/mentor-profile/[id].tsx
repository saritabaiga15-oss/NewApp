import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Design System Tokens
import { BottomTabInset, Palette } from "@/constants/theme";

// Shared Navigation
import BottomNavigation from "@/components/home/BottomNavigation";

// Types & Services
import { memoryService } from "@/services/memoryService";
import { WallItem, WallMentorProfile } from "@/types/memoryWall";

export default function MentorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [mentor, setMentor] = useState<WallMentorProfile | undefined>(() =>
    id ? memoryService.getMentorProfileById(id) : undefined
  );
  const [memories, setMemories] = useState<WallItem[]>(() =>
    mentor ? memoryService.getMemoriesByMentor(mentor.id) : []
  );

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Edit Mentor Form State
  const [editName, setEditName] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editQuote, setEditQuote] = useState("");

  // Subscribe to service updates
  React.useEffect(() => {
    if (!id) return;
    const sync = () => {
      const updatedMentor = memoryService.getMentorProfileById(id);
      setMentor(updatedMentor);
      if (updatedMentor) {
        setMemories(memoryService.getMemoriesByMentor(updatedMentor.id));
      }
    };
    sync();
    const unsubscribe = memoryService.subscribe(sync);
    return () => {
      unsubscribe();
    };
  }, [id]);

  // Meaningful quote
  const meaningfulQuote = useMemo(() => {
    if (!mentor) return null;
    if (mentor.meaningfulQuote) return mentor.meaningfulQuote;
    const itemWithQuote = memories.find((m) => "quote" in m && m.quote);
    if (itemWithQuote && "quote" in itemWithQuote) {
      return itemWithQuote.quote;
    }
    return null;
  }, [mentor, memories]);

  // Featured memory: "A Moment That Stayed" (most prominent or latest tribute/memory)
  const featuredMemory = useMemo(() => {
    if (memories.length === 0) return null;
    // Prefer tribute or memory with photo
    const withPhoto = memories.find(
      (m) => ("photoUri" in m && m.photoUri) || ("imageUri" in m && m.imageUri)
    );
    return withPhoto || memories[0];
  }, [memories]);

  // Chronologically sorted timeline items (excluding or including all with dates)
  const timelineItems = useMemo(() => {
    return [...memories].sort((a, b) => {
      // Sort newest to oldest
      const dateA = a.createdAt || ("year" in a ? a.year : "0");
      const dateB = b.createdAt || ("year" in b ? b.year : "0");
      return dateB.localeCompare(dateA);
    });
  }, [memories]);

  // Saved lessons, quotations, or advice
  const lessons = useMemo(() => {
    const list: { id: string; title: string; quote: string; type: string }[] = [];
    memories.forEach((m) => {
      if (m.kind === "lesson") {
        list.push({
          id: m.id,
          title: m.lessonTitle,
          quote: m.quote,
          type: m.category || "Life Philosophy",
        });
      } else if (m.lessonCarried) {
        list.push({
          id: m.id,
          title: ("title" in m && m.title) ? m.title : "Lesson Carried",
          quote: m.lessonCarried,
          type: "A Lesson I Carry",
        });
      }
    });
    return list;
  }, [memories]);

  // Missing Mentor State
  if (!mentor) {
    return (
      <SafeAreaView style={styles.safeMissing} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor={Palette.iceWhite} />
        <View style={styles.missingContainer}>
          <View style={styles.missingIconCircle}>
            <Ionicons name="person-circle-outline" size={48} color={Palette.textSecondary} />
          </View>
          <Text style={styles.missingTitle}>Mentor Profile Not Found</Text>
          <Text style={styles.missingSubtitle}>
            This mentor profile could not be located in your collection.
          </Text>
          <TouchableOpacity
            style={styles.missingReturnBtn}
            onPress={() => router.replace("/memory-wall")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Return to Memory Wall"
          >
            <Ionicons name="arrow-back" size={18} color={Palette.pureWhite} />
            <Text style={styles.missingReturnText}>Return to Memory Wall</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Navigation handlers
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/memory-wall");
    }
  };

  const handleOpenMemory = (memoryId: string) => {
    router.push({
      pathname: "/memory-detail/[id]",
      params: { id: memoryId },
    });
  };

  const handleAddMemory = () => {
    setIsMenuVisible(false);
    // Prefill mentor identity and relationship in Create Tribute flow
    router.push({
      pathname: "/create-tribute",
      params: {
        mentorName: mentor.name,
        relationship: mentor.relationship,
      },
    });
  };

  const handleShareProfile = async () => {
    try {
      let msg = `A tribute to my mentor, ${mentor.name} (${mentor.relationship}).\n\n`;
      if (mentor.description) {
        msg += `${mentor.description}\n\n`;
      }
      if (meaningfulQuote) {
        msg += `“${meaningfulQuote}”\n\n`;
      }
      msg += `Preserving ${memories.length} meaningful memories on Honour Your Mentor.`;

      await Share.share({
        title: `In Honour of ${mentor.name}`,
        message: msg,
      });
    } catch {
      Alert.alert("Share", "Unable to share profile at this time.");
    }
  };

  const handleOpenEditModal = () => {
    setIsMenuVisible(false);
    setEditName(mentor.name);
    setEditRelationship(mentor.relationship);
    setEditDescription(mentor.description || "");
    setEditQuote(mentor.meaningfulQuote || "");
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editName.trim()) {
      Alert.alert("Required", "Mentor name is required.");
      return;
    }

    memoryService.updateMentorProfile({
      id: mentor.id,
      name: editName.trim(),
      relationship: editRelationship.trim() || "Mentor",
      description: editDescription.trim(),
      meaningfulQuote: editQuote.trim(),
    });

    setIsEditModalVisible(false);
    Alert.alert("Profile Updated", "Mentor details have been preserved.");
  };

  const getTimelinePhoto = (item: WallItem): string | null => {
    if ("photoUri" in item && item.photoUri) return item.photoUri;
    if ("imageUri" in item && item.imageUri) return item.imageUri;
    return null;
  };

  const getTimelineTitle = (item: WallItem): string => {
    if ("title" in item && item.title) return item.title;
    if ("lessonTitle" in item && item.lessonTitle) return item.lessonTitle;
    return "Memory Keepsake";
  };

  const getTimelineExcerpt = (item: WallItem): string => {
    if (item.kind === "letter") return item.preview || "";
    if ("excerpt" in item && item.excerpt) return item.excerpt;
    if ("description" in item && item.description) return item.description;
    if ("quote" in item && item.quote) return `“${item.quote}”`;
    if ("story" in item && item.story) return item.story.slice(0, 120) + "...";
    return "";
  };

  const getTimelineBadge = (kind: WallItem["kind"]) => {
    switch (kind) {
      case "tribute":
        return { label: "Tribute", icon: "heart", color: Palette.oceanTeal };
      case "memory":
        return { label: "Memory", icon: "images", color: Palette.turquoise };
      case "letter":
        return { label: "Letter", icon: "mail", color: "#8B4513" };
      case "lesson":
        return { label: "Lesson", icon: "bulb", color: "#9E2A2B" };
      case "milestone":
        return { label: "Milestone", icon: "flag", color: "#54000E" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.deepTeal} />

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={styles.navIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back to Memory Wall"
        >
          <Ionicons name="chevron-back" size={22} color={Palette.pureWhite} />
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navMentorName} numberOfLines={1}>
            {mentor.name}
          </Text>
          <Text style={styles.navRelationship} numberOfLines={1}>
            {mentor.relationship} · {memories.length} {memories.length === 1 ? "Memory" : "Memories"}
          </Text>
        </View>

        <View style={styles.navActionsRow}>
          <TouchableOpacity
            onPress={handleShareProfile}
            activeOpacity={0.7}
            style={styles.navIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Share mentor profile"
          >
            <Ionicons name="share-outline" size={20} color={Palette.pureWhite} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsMenuVisible((prev) => !prev)}
            activeOpacity={0.7}
            style={styles.navIconBtn}
            accessibilityRole="button"
            accessibilityLabel="More actions"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={Palette.pureWhite} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dropdown Menu */}
      {isMenuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleAddMemory}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={18} color={Palette.turquoise} />
            <Text style={styles.menuItemText}>Add Memory for {mentor.name.split(" ")[0]}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleOpenEditModal}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={Palette.textPrimary} />
            <Text style={styles.menuItemText}>Edit Mentor Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleShareProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color={Palette.textPrimary} />
            <Text style={styles.menuItemText}>Share Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + 70 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Mentor Profile Header (Scrapbook Archive Aesthetic) ── */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.portraitContainer}>
            {mentor.avatarUri ? (
              <Image source={{ uri: mentor.avatarUri }} style={styles.portraitImage} resizeMode="cover" />
            ) : (
              <View style={[styles.portraitPlaceholder, { backgroundColor: mentor.coverColor || Palette.oceanTeal }]}>
                <Text style={styles.portraitInitial}>{mentor.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.portraitPinBadge}>
              <Ionicons name="heart" size={14} color={Palette.pureWhite} />
            </View>
          </View>

          <Text style={styles.mentorNameText}>{mentor.name}</Text>

          <View style={styles.relationshipPill}>
            <Text style={styles.relationshipPillText}>{mentor.relationship}</Text>
            <Text style={styles.pillDot}>•</Text>
            <Text style={styles.memoryCountText}>
              {memories.length} {memories.length === 1 ? "Saved Memory" : "Saved Memories"}
            </Text>
          </View>

          {mentor.description ? (
            <Text style={styles.mentorDescriptionText}>{mentor.description}</Text>
          ) : null}

          {/* Meaningful Quote */}
          {meaningfulQuote && (
            <View style={styles.headerQuoteBanner}>
              <Ionicons name="chatbubble-ellipses-outline" size={16} color={Palette.turquoise} />
              <Text style={styles.headerQuoteText} numberOfLines={3}>
                “{meaningfulQuote}”
              </Text>
            </View>
          )}

          {/* Action Nudge */}
          <TouchableOpacity
            style={styles.addMemoryButton}
            onPress={handleAddMemory}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Add a memory for ${mentor.name}`}
          >
            <Ionicons name="add" size={18} color={Palette.pureWhite} />
            <Text style={styles.addMemoryBtnText}>Add a Memory for {mentor.name.split(" ")[0]}</Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. Empty State (When Mentor has 0 memories) ── */}
        {memories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="journal-outline" size={38} color={Palette.turquoise} />
            </View>
            <Text style={styles.emptyTitle}>A Blank Page Waiting for Your Words</Text>
            <Text style={styles.emptySubtitle}>
              You haven&apos;t preserved any memories for {mentor.name} yet. Capture a lesson, tribute, or moment you carry from them.
            </Text>
            <TouchableOpacity
              style={styles.emptyCreateBtn}
              onPress={handleAddMemory}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={18} color={Palette.pureWhite} />
              <Text style={styles.emptyCreateBtnText}>Create First Memory</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── 3. Featured Memory: "A Moment That Stayed" ── */}
            {featuredMemory && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="sparkles" size={16} color={Palette.turquoise} />
                  <Text style={styles.sectionTitle}>A Moment That Stayed</Text>
                </View>

                <TouchableOpacity
                  style={styles.featuredCard}
                  activeOpacity={0.85}
                  onPress={() => handleOpenMemory(featuredMemory.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Open featured memory: ${getTimelineTitle(featuredMemory)}`}
                >
                  {getTimelinePhoto(featuredMemory) && (
                    <View style={styles.featuredPhotoWrap}>
                      <Image
                        source={{ uri: getTimelinePhoto(featuredMemory)! }}
                        style={styles.featuredPhoto}
                        resizeMode="cover"
                      />
                      <View style={styles.featuredBadge}>
                        <Text style={styles.featuredBadgeText}>Featured</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.featuredContent}>
                    <Text style={styles.featuredTitle}>{getTimelineTitle(featuredMemory)}</Text>
                    <Text style={styles.featuredExcerpt} numberOfLines={3}>
                      {getTimelineExcerpt(featuredMemory)}
                    </Text>

                    <View style={styles.featuredFooter}>
                      <Text style={styles.featuredReadText}>Read Full Keepsake</Text>
                      <Ionicons name="arrow-forward" size={14} color={Palette.turquoise} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* ── 4. Vertical Memory Timeline: "Our Story" ── */}
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="time-outline" size={18} color={Palette.turquoise} />
                <Text style={styles.sectionTitle}>Our Story & Timeline</Text>
              </View>

              <View style={styles.timelineSpineContainer}>
                {timelineItems.map((entry, index) => {
                  const photo = getTimelinePhoto(entry);
                  const title = getTimelineTitle(entry);
                  const excerpt = getTimelineExcerpt(entry);
                  const badge = getTimelineBadge(entry.kind);
                  const isLast = index === timelineItems.length - 1;
                  const dateLabel =
                    entry.createdAt
                      ? new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })
                      : "year" in entry
                      ? entry.year
                      : null;

                  return (
                    <View key={entry.id} style={styles.timelineRow}>
                      {/* Left Spine with Node */}
                      <View style={styles.spineColumn}>
                        <View style={[styles.timelineNode, { borderColor: badge.color }]}>
                          <View style={[styles.timelineNodeInner, { backgroundColor: badge.color }]} />
                        </View>
                        {!isLast && <View style={styles.spineLine} />}
                      </View>

                      {/* Right Timeline Card */}
                      <TouchableOpacity
                        style={styles.timelineCard}
                        onPress={() => handleOpenMemory(entry.id)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel={`Open timeline entry: ${title}`}
                      >
                        <View style={styles.timelineCardHeader}>
                          <View style={[styles.timelineTypeBadge, { backgroundColor: badge.color }]}>
                            <Ionicons name={badge.icon as any} size={11} color={Palette.pureWhite} />
                            <Text style={styles.timelineTypeBadgeText}>{badge.label}</Text>
                          </View>
                          {dateLabel && <Text style={styles.timelineDateText}>{dateLabel}</Text>}
                        </View>

                        <Text style={styles.timelineCardTitle}>{title}</Text>

                        {photo && (
                          <View style={styles.timelinePhotoFrame}>
                            <Image source={{ uri: photo }} style={styles.timelineCardPhoto} resizeMode="cover" />
                          </View>
                        )}

                        {excerpt ? (
                          <Text style={styles.timelineCardExcerpt} numberOfLines={3}>
                            {excerpt}
                          </Text>
                        ) : null}

                        <View style={styles.timelineCardActionRow}>
                          <Text style={styles.timelineCardActionText}>Open Memory</Text>
                          <Ionicons name="chevron-forward" size={13} color={Palette.turquoise} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ── 5. Lessons & Meaningful Words (Only when available) ── */}
            {lessons.length > 0 && (
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="bulb-outline" size={18} color={Palette.turquoise} />
                  <Text style={styles.sectionTitle}>Lessons I Carry</Text>
                </View>

                <View style={styles.lessonsContainer}>
                  {lessons.map((lessonItem, idx) => (
                    <TouchableOpacity
                      key={`lesson-${idx}`}
                      style={styles.lessonCard}
                      onPress={() => handleOpenMemory(lessonItem.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.lessonCardTop}>
                        <View style={styles.lessonTagBadge}>
                          <Text style={styles.lessonTagText}>{lessonItem.type}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color={Palette.textMuted} />
                      </View>
                      <Text style={styles.lessonTitleText}>{lessonItem.title}</Text>
                      <Text style={styles.lessonQuoteText}>“{lessonItem.quote}”</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Edit Mentor Details Modal ── */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.editModalContainer} edges={["top", "bottom"]}>
          <View style={styles.editModalHeader}>
            <TouchableOpacity
              onPress={() => setIsEditModalVisible(false)}
              style={styles.editModalCancel}
            >
              <Text style={styles.editModalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.editModalTitle}>Edit Mentor Profile</Text>
            <TouchableOpacity onPress={handleSaveEdit} style={styles.editModalSave}>
              <Text style={styles.editModalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editModalScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.editLabel}>Mentor Name</Text>
            <TextInput
              style={styles.editInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Mentor Full Name"
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={styles.editLabel}>Relationship</Text>
            <TextInput
              style={styles.editInput}
              value={editRelationship}
              onChangeText={setEditRelationship}
              placeholder="Teacher, Parent, Coach, etc."
              placeholderTextColor={Palette.textMuted}
            />

            <Text style={styles.editLabel}>Personal Description / Note</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              placeholder="What this person means to you..."
              placeholderTextColor={Palette.textMuted}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.editLabel}>Guiding Quote (Optional)</Text>
            <TextInput
              style={[styles.editInput, styles.editTextAreaShort]}
              value={editQuote}
              onChangeText={setEditQuote}
              placeholder="A quote or motto from this mentor..."
              placeholderTextColor={Palette.textMuted}
              multiline
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Persistent Bottom Navigation */}
      <BottomNavigation activeTab="saved" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.deepTeal,
  },
  safeMissing: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  missingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  missingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  missingTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 10,
    textAlign: "center",
  },
  missingSubtitle: {
    fontSize: 14,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  missingReturnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  missingReturnText: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.pureWhite,
  },

  // Navigation Bar
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Palette.deepTeal,
  },
  navIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  navTitleContainer: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: "center",
  },
  navMentorName: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  navRelationship: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
    marginTop: 1,
  },
  navActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Dropdown Menu
  menuDropdown: {
    position: "absolute",
    top: 54,
    right: 16,
    zIndex: 999,
    width: 210,
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: Palette.textPrimary,
    fontWeight: "600",
  },

  // Scroll Content
  scroll: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // 1. Profile Header
  profileHeaderCard: {
    backgroundColor: Palette.pureWhite,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  portraitContainer: {
    position: "relative",
    marginBottom: 14,
  },
  portraitImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Palette.turquoise,
  },
  portraitPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Palette.turquoise,
  },
  portraitInitial: {
    fontSize: 36,
    fontWeight: "800",
    color: Palette.pureWhite,
  },
  portraitPinBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.deepTeal,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Palette.pureWhite,
  },
  mentorNameText: {
    fontSize: 22,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 6,
    textAlign: "center",
  },
  relationshipPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    marginBottom: 14,
  },
  relationshipPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.deepTeal,
  },
  pillDot: {
    fontSize: 12,
    color: Palette.turquoise,
  },
  memoryCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: Palette.textSecondary,
  },
  mentorDescriptionText: {
    fontSize: 14,
    color: Palette.textPrimary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  headerQuoteBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(236,143,62,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: Palette.turquoise,
    gap: 8,
    marginBottom: 18,
    width: "100%",
  },
  headerQuoteText: {
    flex: 1,
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.deepTeal,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
  },
  addMemoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Palette.oceanTeal,
    width: "100%",
    paddingVertical: 13,
    borderRadius: 12,
  },
  addMemoryBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.pureWhite,
  },

  // Empty State
  emptyContainer: {
    backgroundColor: Palette.pureWhite,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(236,143,62,0.3)",
    borderStyle: "dashed",
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Palette.mintMist,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Palette.turquoise,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyCreateBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.pureWhite,
  },

  // Sections
  sectionWrap: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
  },

  // Featured Card
  featuredCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  featuredPhotoWrap: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  featuredPhoto: {
    width: "100%",
    height: "100%",
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.pureWhite,
    textTransform: "uppercase",
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 6,
  },
  featuredExcerpt: {
    fontSize: 14,
    lineHeight: 21,
    color: Palette.textPrimary,
    marginBottom: 12,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  featuredReadText: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.turquoise,
  },

  // Timeline Spine
  timelineSpineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  spineColumn: {
    alignItems: "center",
    width: 28,
  },
  timelineNode: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: Palette.pureWhite,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  timelineNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  spineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "rgba(177, 167, 166, 0.45)",
    marginVertical: 4,
  },
  timelineCard: {
    flex: 1,
    marginLeft: 12,
    backgroundColor: Palette.pureWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  timelineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  timelineTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  timelineTypeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.pureWhite,
    textTransform: "uppercase",
  },
  timelineDateText: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  timelineCardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 6,
  },
  timelinePhotoFrame: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 8,
    backgroundColor: "#eee",
  },
  timelineCardPhoto: {
    width: "100%",
    height: "100%",
  },
  timelineCardExcerpt: {
    fontSize: 13,
    lineHeight: 19,
    color: Palette.textPrimary,
    marginBottom: 10,
  },
  timelineCardActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timelineCardActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.turquoise,
  },

  // Lessons
  lessonsContainer: {
    gap: 12,
  },
  lessonCard: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    borderLeftWidth: 4,
    borderLeftColor: Palette.turquoise,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  lessonTagBadge: {
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  lessonTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.deepTeal,
    textTransform: "uppercase",
  },
  lessonTitleText: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.deepTeal,
    marginBottom: 4,
  },
  lessonQuoteText: {
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.textPrimary,
    lineHeight: 19,
    fontFamily: Platform.select({ ios: "Georgia", default: "serif" }),
  },

  // Edit Modal
  editModalContainer: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  editModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
    backgroundColor: Palette.pureWhite,
  },
  editModalCancel: {
    padding: 6,
  },
  editModalCancelText: {
    fontSize: 15,
    color: Palette.textSecondary,
    fontWeight: "600",
  },
  editModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.deepTeal,
  },
  editModalSave: {
    padding: 6,
  },
  editModalSaveText: {
    fontSize: 15,
    color: Palette.turquoise,
    fontWeight: "800",
  },
  editModalScroll: {
    flex: 1,
    padding: 20,
  },
  editLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.deepTeal,
    marginBottom: 6,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editInput: {
    backgroundColor: Palette.pureWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  editTextAreaShort: {
    minHeight: 70,
  },
  editTextArea: {
    minHeight: 120,
  },
});
