import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Design Tokens
import { BottomTabInset, Palette } from "@/constants/theme";

// Components
import BottomNavigation from "@/components/home/BottomNavigation";
import {
  FilterTabs,
  LetterWallCard,
  LessonWallCard,
  MemoryWallCard,
  MentorRoll,
  MilestoneWallCard,
  TributeWallCard,
  WallEmptyState,
  WallHeader,
} from "@/components/MemoryWall";

// Services & Data
import { memoryService } from "@/services/memoryService";
import { WALL_FILTER_TABS } from "@/data/memoryWallData";

// Types
import { WallCategory, WallItem, WallMentorProfile } from "@/types/memoryWall";

export default function MemoryWallScreen() {
  const [activeFilter, setActiveFilter] = useState<WallCategory>("all");
  const [items, setItems] = useState<WallItem[]>(() => memoryService.getAllMemories());
  const [mentors, setMentors] = useState<WallMentorProfile[]>(() =>
    memoryService.getAllMentorProfiles()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Subscribe to memoryService updates
  React.useEffect(() => {
    const sync = () => {
      setItems(memoryService.getAllMemories());
      setMentors(memoryService.getAllMentorProfiles());
    };
    sync();
    const unsubscribe = memoryService.subscribe(sync);
    return () => {
      unsubscribe();
    };
  }, []);

  // ─── Derived lists ────────────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeFilter !== "all") {
      const map: Record<WallCategory, WallItem["kind"]> = {
        all: "tribute",
        tributes: "tribute",
        memories: "memory",
        letters: "letter",
        lessons: "lesson",
        milestones: "milestone",
      };
      result = result.filter((i) => i.kind === map[activeFilter]);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((i) => {
        const title = ("title" in i && i.title) ? i.title : ("lessonTitle" in i && i.lessonTitle) ? i.lessonTitle : "";
        const quote = ("quote" in i && i.quote) ? i.quote : "";
        const mentor = i.mentorName || "";
        return (
          title.toLowerCase().includes(q) ||
          quote.toLowerCase().includes(q) ||
          mentor.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  const pinnedCount = useMemo(() => items.filter((i) => i.isPinned).length, [items]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handlePinToggle = useCallback((id: string) => {
    memoryService.togglePin(id);
  }, []);

  const handleItemPress = useCallback((item: WallItem) => {
    router.push({
      pathname: "/memory-detail/[id]",
      params: { id: item.id },
    });
  }, []);

  const handleMentorPress = useCallback((mentor: WallMentorProfile) => {
    router.push({
      pathname: "/mentor-profile/[id]",
      params: { id: mentor.id },
    });
  }, []);

  const handleSearchPress = useCallback(() => {
    setIsSearching((prev) => !prev);
    if (isSearching) {
      setSearchQuery("");
    }
  }, [isSearching]);

  const handleSortPress = useCallback(() => {
    Alert.alert("Sort Memories", "Choose display order:", [
      {
        text: "Newest First",
        onPress: () =>
          setItems((prev) =>
            [...prev].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          ),
      },
      {
        text: "Oldest First",
        onPress: () =>
          setItems((prev) =>
            [...prev].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, []);

  // ─── Render item ──────────────────────────────────────────────────────────
  const renderItem = (item: WallItem) => {
    switch (item.kind) {
      case "tribute":
        return (
          <TributeWallCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onPinPress={handlePinToggle}
          />
        );
      case "memory":
        return (
          <MemoryWallCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onPinPress={handlePinToggle}
          />
        );
      case "letter":
        return (
          <LetterWallCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onPinPress={handlePinToggle}
          />
        );
      case "lesson":
        return (
          <LessonWallCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onPinPress={handlePinToggle}
          />
        );
      case "milestone":
        return (
          <MilestoneWallCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            onPinPress={handlePinToggle}
          />
        );
    }
  };

  // ─── Section label ────────────────────────────────────────────────────────
  const sectionLabel = useMemo(() => {
    const tab = WALL_FILTER_TABS.find((t) => t.key === activeFilter);
    return tab?.label ?? "All";
  }, [activeFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={Palette.deepTeal} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <WallHeader
          totalItems={items.length}
          pinnedCount={pinnedCount}
          onSearchPress={handleSearchPress}
          onSortPress={handleSortPress}
        />

        {/* Optional Search Bar */}
        {isSearching && (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={18} color={Palette.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by mentor, title, or quote..."
              placeholderTextColor={Palette.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={Palette.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Mentor profiles row */}
        <MentorRoll
          mentors={mentors}
          onMentorPress={handleMentorPress}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Filter tabs (sticky feel via placement) */}
        <FilterTabs
          tabs={WALL_FILTER_TABS}
          active={activeFilter}
          onSelect={setActiveFilter}
        />

        {/* Section heading */}
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionHeadText}>{sectionLabel}</Text>
          <Text style={styles.sectionCount}>{filteredItems.length} items</Text>
        </View>

        {/* Items feed */}
        {filteredItems.length === 0 ? (
          <WallEmptyState />
        ) : (
          filteredItems.map(renderItem)
        )}

        {/* Bottom create nudge */}
        {filteredItems.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/create")}
            activeOpacity={0.8}
            style={styles.addNudge}
            accessibilityRole="button"
            accessibilityLabel="Add a new memory"
          >
            <Ionicons name="add-circle" size={18} color={Palette.turquoise} />
            <Text style={styles.addNudgeText}>Add another memory</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Bottom navigation */}
      <BottomNavigation activeTab="saved" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Palette.deepTeal,
  },
  scroll: {
    flex: 1,
    backgroundColor: Palette.iceWhite,
  },
  content: {
    flexGrow: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.borderSubtle,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  sectionHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  sectionHeadText: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  sectionCount: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "500",
  },
  addNudge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(236,143,62,0.35)",
    borderStyle: "dashed",
    backgroundColor: "rgba(236,143,62,0.04)",
  },
  addNudgeText: {
    fontSize: 14,
    color: Palette.turquoise,
    fontWeight: "700",
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Palette.pureWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.textPrimary,
    padding: 0,
  },
});
