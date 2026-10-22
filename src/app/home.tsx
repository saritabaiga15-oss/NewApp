import React, { useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Design System Tokens
import { Palette } from "@/constants/theme";

// Modular Reusable Components
import SectionHeader from "../components/home/SectionHeader";
import MentorCard, { MentorData } from "../components/home/MentorCard";
import MemoryCard, { MemoryData } from "../components/home/MemoryCard";
import VoiceNoteCard, { VoiceNoteData } from "../components/home/VoiceNoteCard";
import GratitudeCard, { GratitudePostData } from "../components/home/GratitudeCard";
import AchievementCard, { AchievementData } from "../components/home/AchievementCard";
import TimelinePreview, { TimelineNode } from "../components/home/TimelinePreview";
import QuickAction from "../components/home/QuickAction";
import BottomNavigation, { NavTab } from "../components/home/BottomNavigation";
import AddMemoryModal from "../components/home/AddMemoryModal";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";
import type { UserProfile } from "@/services/userProfileService";
import type { WallItem } from "@/types/memoryWall";

// Mock Data: Mentors
const MENTORS_DATA: MentorData[] = [
  {
    id: "m1",
    name: "Mrs. Anita Sharma",
    role: "Literature Teacher",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    quote: "Believe in your voice before asking the world to listen.",
    memoriesCount: 14,
    yearsKnown: "12 yrs",
    isBookmarked: true,
  },
  {
    id: "m2",
    name: "Dr. David Mitchell",
    role: "Research Advisor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    quote: "True mastery is quiet patience with difficult problems.",
    memoriesCount: 9,
    yearsKnown: "8 yrs",
    isBookmarked: false,
  },
  {
    id: "m3",
    name: "Vikram Rao",
    role: "Engineering Director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    quote: "Build things that outlive your tenure and elevate people.",
    memoriesCount: 18,
    yearsKnown: "6 yrs",
    isBookmarked: true,
  },
  {
    id: "m4",
    name: "Elena Rostova",
    role: "Art & Design Coach",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    quote: "Do not fear the blank page; it is waiting for your courage.",
    memoriesCount: 11,
    yearsKnown: "5 yrs",
    isBookmarked: false,
  },
];

// Mock Data: Memory Wall
const MEMORIES_DATA: MemoryData[] = [
  {
    id: "mem1",
    type: "photo",
    title: "First Day at College",
    mentorName: "Mrs. Anita Sharma",
    date: "Sep 2018",
    content: "You handed me your own annotated anthology of poems and said, 'You belong in every room you enter.'",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    likes: 42,
    tags: ["college", "guidance"],
  },
  {
    id: "mem2",
    type: "gratitude",
    title: "The Lesson in Failure",
    mentorName: "Dr. David Mitchell",
    date: "Nov 2021",
    content: "When our first grant proposal was rejected, you bought coffee and spent three hours explaining why resilience is the actual degree.",
    likes: 67,
  },
  {
    id: "mem3",
    type: "voice",
    title: "Voice Memo Before Defense",
    mentorName: "Vikram Rao",
    date: "May 2023",
    content: "A 45-second voicemail recorded in the cab on the way to the thesis board. Still keeps me grounded.",
    audioDuration: "0:45",
    likes: 29,
  },
  {
    id: "mem4",
    type: "lesson",
    title: "The Discipline of Craft",
    mentorName: "Elena Rostova",
    date: "Feb 2024",
    content: "Critique is not an attack on who you are; it is an invitation to who you can become tomorrow.",
    likes: 88,
  },
];

// Mock Data: Voice Notes
const VOICE_NOTES: VoiceNoteData[] = [
  {
    id: "vn1",
    title: "Advice for my first startup pitch",
    mentorName: "Vikram Rao",
    duration: "1:24",
    date: "12 Oct 2023",
    category: "Career Guidance",
  },
  {
    id: "vn2",
    title: "When you feel like giving up on writing",
    mentorName: "Mrs. Anita Sharma",
    duration: "2:08",
    date: "04 Jan 2024",
    category: "Creative Courage",
  },
  {
    id: "vn3",
    title: "Lab notes on staying curious",
    mentorName: "Dr. David Mitchell",
    duration: "0:56",
    date: "19 Mar 2024",
    category: "Philosophy",
  },
];

// Mock Data: Global Gratitude Feed
const GRATITUDE_POSTS: GratitudePostData[] = [
  {
    id: "gp1",
    authorName: "Rohan Varma",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    mentorName: "Coach Armstrong",
    location: "Bangalore, India",
    message: "10 years ago today, you paid for my running shoes when my family could not. Today I finished my first ultra-marathon.",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&auto=format&fit=crop&q=80",
    likes: 248,
    commentsCount: 34,
    timeAgo: "2h ago",
  },
  {
    id: "gp2",
    authorName: "Maya Lin",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    mentorName: "Prof. Kenneth Clark",
    location: "London, UK",
    message: "Thank you for teaching me that architecture isn't about stone, but about how humans breathe inside space.",
    likes: 182,
    commentsCount: 19,
    timeAgo: "5h ago",
  },
];

// Mock Data: Achievements Inspired
const ACHIEVEMENTS_DATA: AchievementData[] = [
  {
    id: "ach1",
    badgeType: "graduation",
    title: "Master of Science in AI",
    mentorName: "Dr. David Mitchell",
    date: "June 2024",
    story: "Wrote the dedication page to you, who spent Sunday mornings showing me how to write clear equations.",
  },
  {
    id: "ach2",
    badgeType: "award",
    title: "Best Debut Author Award",
    mentorName: "Mrs. Anita Sharma",
    date: "March 2024",
    story: "Every word in that novel passed through the standards you taught in room 204.",
  },
  {
    id: "ach3",
    badgeType: "job",
    title: "Promoted to Principal Engineer",
    mentorName: "Vikram Rao",
    date: "January 2024",
    story: "Remembering how you told me leadership is not a podium, but a shield for your team.",
  },
];

// Mock Data: Timeline Nodes
const TIMELINE_NODES: TimelineNode[] = [
  {
    year: "2016",
    title: "First Meeting",
    subtitle: "Walked into honors literature hesitant to speak",
    mentorName: "Mrs. Anita Sharma",
  },
  {
    year: "2019",
    title: "College Recommendation",
    subtitle: "A letter that opened doors across the country",
    mentorName: "Mrs. Anita Sharma",
    isMilestone: true,
  },
  {
    year: "2021",
    title: "Lab Fellowship",
    subtitle: "First research grant together under Dr. Mitchell",
    mentorName: "Dr. David Mitchell",
  },
  {
    year: "2023",
    title: "First Leadership Role",
    subtitle: "Promoted to tech lead under Vikram's guidance",
    mentorName: "Vikram Rao",
    isMilestone: true,
  },
  {
    year: "2026",
    title: "Mentoring the Next Gen",
    subtitle: "Passing on the fire to two high school interns",
    mentorName: "All Mentors",
    isMilestone: true,
  },
];

function toWallItem(memory: MemoryData): WallItem {
  const mentor = memoryService
    .getAllMentorProfiles()
    .find((profile) => profile.name.toLowerCase() === memory.mentorName.toLowerCase());
  const parsedDate = Date.parse(memory.date);
  const createdAt = Number.isNaN(parsedDate)
    ? new Date().toISOString()
    : new Date(parsedDate).toISOString();
  const base = {
    id: `home-${memory.id}`,
    mentorName: memory.mentorName,
    mentorId: mentor?.id,
    relationship: mentor?.relationship || "Mentor",
    createdAt,
    isPinned: false,
  };

  if (memory.type === "achievement") {
    return {
      ...base,
      kind: "milestone",
      title: memory.title,
      description: memory.content,
      year: memory.date.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
      type: "breakthrough",
      accentColor: Palette.oceanTeal,
    };
  }
  if (memory.type === "lesson") {
    return {
      ...base,
      kind: "lesson",
      lessonTitle: memory.title,
      quote: memory.content,
      story: memory.content,
      category: "Reflection",
    };
  }
  if (memory.type === "tribute") {
    return {
      ...base,
      kind: "tribute",
      title: memory.title,
      photoUri: memory.image || "",
      quote: memory.content,
      story: memory.content,
      templateId: "editorial",
    };
  }

  return {
    ...base,
    kind: "memory",
    title: memory.title,
    excerpt: memory.content,
    story: memory.content,
    imageUri: memory.image,
    year: memory.date.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
    emotion: memory.type === "gratitude" ? "Gratitude" : "Remembered",
    emotionColor: Palette.turquoise,
    quote: memory.type === "gratitude" ? memory.content : undefined,
  };
}

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [mentorsList, setMentorsList] = useState<MentorData[]>(MENTORS_DATA);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(() => userProfileService.getProfile());
  const [reflectionInput, setReflectionInput] = useState("");
  const [hasSubmittedReflection, setHasSubmittedReflection] = useState(false);

  React.useEffect(
    () => userProfileService.subscribe((nextProfile) => setProfile(nextProfile)),
    []
  );

  // Smooth entrance fade
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 650,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleBookmarkToggle = (id: string) => {
    setMentorsList((prev) =>
      prev.map((mentor) =>
        mentor.id === id
          ? { ...mentor, isBookmarked: !mentor.isBookmarked }
          : mentor
      )
    );
  };

  const handleOpenMentor = (mentor: MentorData) => {
    const profile =
      memoryService
        .getAllMentorProfiles()
        .find((item) => item.name.toLowerCase() === mentor.name.toLowerCase()) ??
      memoryService.addMentor({
        name: mentor.name,
        relationship: mentor.role,
      });
    router.push({
      pathname: "/mentor-profile/[id]",
      params: { id: profile.id },
    });
  };

  const handleOpenHomeMemory = (memory: MemoryData) => {
    const fallbackItem = toWallItem(memory);
    const itemId = memoryService.getMemoryById(fallbackItem.id)
      ? fallbackItem.id
      : memoryService.addMemory(fallbackItem);
    router.push({
      pathname: "/memory-detail/[id]",
      params: { id: itemId },
    });
  };

  const handleCreateFromModal = (option: string) => {
    if (option === "tribute") {
      router.push("/create-tribute");
      return;
    }
    if (option === "memory" || option === "letter" || option === "lesson") {
      router.push({ pathname: "/create", params: { type: option } });
    }
  };

  const handleSaveReflection = () => {
    const text = reflectionInput.trim();
    if (!text) {
      Alert.alert("Reflection required", "Write a few words before saving your reflection.");
      return;
    }
    memoryService.addMemory({
      kind: "lesson",
      id: `reflection-${Date.now()}`,
      mentorName: "My Mentor",
      relationship: "Mentor",
      lessonTitle: "Today's Reflection",
      quote: text,
      story: text,
      category: "Daily Reflection",
      createdAt: new Date().toISOString(),
      isPinned: false,
    });
    setHasSubmittedReflection(true);
  };

  const filteredMemories = useMemo(() => {
    if (selectedTag === "all") return MEMORIES_DATA;
    return MEMORIES_DATA.filter((m) => m.type === selectedTag);
  }, [selectedTag]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Pure Cloud Canvas */}
      <View style={styles.paperCanvas} />

      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ======================================================== */}
          {/* 1. TOP HEADER                                            */}
          {/* ======================================================== */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greetingText}>
                Good morning, {profile.name.split(" ")[0]}
              </Text>
              <Text style={styles.subGreetingText}>
                Keep the people who shaped you close.
              </Text>
            </View>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() =>
                  Alert.alert("Notifications", "You’re all caught up on your memories.")
                }
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons name="notifications-outline" size={21} color={Palette.deepTeal} />
                <View style={styles.notifBadgeDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.profileAvatarBtn}
                activeOpacity={0.8}
                onPress={() => router.push("/profile")}
                accessibilityRole="button"
                accessibilityLabel="Open your profile"
              >
                <Image
                  source={{ uri: profile.avatarUri }}
                  style={styles.profileAvatar}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ======================================================== */}
          {/* 2. HERO / EMOTIONAL INTRO (Royal Crimson Gradient)       */}
          {/* ======================================================== */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={["#3D000A", "#5E0B1B", "#7E1528"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              {/* Luminous Warm Light Spot */}
              <View style={styles.heroAmbientLight} />

              <View style={styles.heroBadgeRow}>
                <View style={styles.heroBadge}>
                  <Ionicons name="sparkles" size={13} color={Palette.turquoise} />
                  <Text style={styles.heroBadgeText}>A Living Wall of Gratitude</Text>
                </View>
              </View>

              <Text style={styles.heroQuoteHeadline}>
                Someone believed in you.{"\n"}
                Now it&apos;s your turn to remember them.
              </Text>

              <Text style={styles.heroSupportingText}>
                Celebrate the mentors, teachers, and guides who helped you become who you are.
              </Text>

              {/* Floating Pure White Memory Note */}
              <View style={styles.floatingMemoryNote}>
                <View style={styles.pinDot} />
                <Text style={styles.floatingNoteQuote}>
                  &ldquo;Because of you, I did not quit when the path got steep.&rdquo;
                </Text>
                <Text style={styles.floatingNoteAuthor}>— Memory added 3 days ago</Text>
              </View>
            </LinearGradient>
          </View>

          {/* ======================================================== */}
          {/* 12. QUICK ACTIONS BAR                                    */}
          {/* ======================================================== */}
          <View style={styles.quickActionsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              <QuickAction
                icon="person-add"
                label="Add Mentor"
                color={Palette.oceanTeal}
                onPress={() => router.push("/create-mentor")}
              />
              <QuickAction
                icon="add-circle"
                label="Add Memory"
                color={Palette.turquoise}
                badge="+"
                onPress={() => setIsAddModalOpen(true)}
              />
              <QuickAction
                icon="heart"
                label="Write Tribute"
                color={Palette.turquoise}
                onPress={() => router.push("/create-tribute")}
              />
              <QuickAction
                icon="mic"
                label="Voice Note"
                color={Palette.oceanTeal}
                onPress={() =>
                  Alert.alert(
                    "Voice notes",
                    "Audio recording is not available yet. You can preserve the moment as a written memory.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Write memory",
                        onPress: () =>
                          router.push({ pathname: "/create", params: { type: "memory" } }),
                      },
                    ]
                  )
                }
              />
              <QuickAction
                icon="time"
                label="Timeline"
                color={Palette.oceanTeal}
                onPress={() => router.push("/memory-wall")}
              />
            </ScrollView>
          </View>

          {/* ======================================================== */}
          {/* 3. YOUR MENTORS SECTION                                  */}
          {/* ======================================================== */}
          <SectionHeader
            title="People Who Shaped You"
            subtitle="The teachers, leaders, and lights in your journey"
            actionLabel="View All"
            onActionPress={() => router.push("/memory-wall")}
            badge={`${mentorsList.length} Mentors`}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mentorsScroll}
          >
            {mentorsList.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onBookmarkToggle={handleBookmarkToggle}
                onPress={() => handleOpenMentor(mentor)}
              />
            ))}
          </ScrollView>

          {/* ======================================================== */}
          {/* 6. A LESSON I CARRY (Mint Mist Fresh Card)                */}
          {/* ======================================================== */}
          <View style={styles.lessonSection}>
            <View style={styles.lessonCard}>
              <View style={styles.lessonWaxSeal}>
                <Ionicons name="bookmark" size={16} color={Palette.turquoise} />
              </View>

              <Text style={styles.lessonHeaderLabel}>A LESSON I CARRY</Text>

              <Text style={styles.lessonQuoteText}>
                &ldquo;Your mentor may leave the room, but their lessons never have to.&rdquo;
              </Text>

              <View style={styles.lessonAuthorRow}>
                <View style={styles.tealDividerLine} />
                <Text style={styles.lessonAuthor}>
                  — From Mr. Daniel, Professor of Philosophy
                </Text>
              </View>
            </View>
          </View>

          {/* ======================================================== */}
          {/* 4. MEMORY WALL                                           */}
          {/* ======================================================== */}
          <SectionHeader
            title="Your Memory Wall"
            subtitle="Little moments. Lifelong impact."
            badge="Living Wall"
          />

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[
              { id: "all", label: "All Memories" },
              { id: "photo", label: "📷 Photos" },
              { id: "gratitude", label: "💬 Gratitude" },
              { id: "voice", label: "🎙 Audio" },
              { id: "achievement", label: "🏆 Milestones" },
              { id: "lesson", label: "📖 Lessons" },
            ].map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setSelectedTag(f.id)}
                activeOpacity={0.7}
                style={[
                  styles.filterPill,
                  selectedTag === f.id && styles.filterPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedTag === f.id && styles.filterTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Staggered Memory Cards */}
          <View style={styles.memoryWallContainer}>
            {filteredMemories.map((mem) => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                onPress={() => handleOpenHomeMemory(mem)}
              />
            ))}
          </View>

          {/* ======================================================== */}
          {/* 5. ADD A MEMORY FEATURED CALLOUT (Golden Amber CTA)      */}
          {/* ======================================================== */}
          <View style={styles.addCalloutWrapper}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addCalloutBtn}
            >
              <LinearGradient
                colors={["#B84E0E", "#D6671A", "#EC8F3E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCalloutGradient}
              >
                <View style={styles.addCalloutIconWrap}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.addCalloutTextWrap}>
                  <Text style={styles.addCalloutTitle}>Add to Your Memory Wall</Text>
                  <Text style={styles.addCalloutSub}>
                    Record a voice note, photo, or handwritten lesson
                  </Text>
                </View>
                <Ionicons name="add-circle" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ======================================================== */}
          {/* 7. MENTOR TIMELINE PREVIEW                               */}
          {/* ======================================================== */}
          <TimelinePreview
            nodes={TIMELINE_NODES}
            onViewFullPress={() => router.push("/memory-wall")}
          />

          {/* ======================================================== */}
          {/* 11. DAILY GRATITUDE PROMPT (Mint Mist Surface)           */}
          {/* ======================================================== */}
          <View style={styles.promptSection}>
            <View style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Ionicons name="bulb-outline" size={18} color={Palette.oceanTeal} />
                <Text style={styles.promptTag}>TODAY&apos;S REFLECTION</Text>
              </View>

              <Text style={styles.promptQuestion}>
                &ldquo;What is one lesson from your mentor that you still use today?&rdquo;
              </Text>

              {hasSubmittedReflection ? (
                <View style={styles.promptSuccessBox}>
                  <Ionicons name="checkmark-circle" size={18} color={Palette.oceanTeal} />
                  <Text style={styles.promptSuccessText}>
                    Reflection saved to your memory album!
                  </Text>
                </View>
              ) : (
                <View style={styles.promptInputRow}>
                  <TextInput
                    value={reflectionInput}
                    onChangeText={setReflectionInput}
                    placeholder="Write your answer..."
                    placeholderTextColor={Palette.textMuted}
                    style={styles.promptInput}
                  />
                  <TouchableOpacity
                    onPress={handleSaveReflection}
                    activeOpacity={0.8}
                    style={styles.promptSubmitBtn}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* ======================================================== */}
          {/* 9. VOICE OF GRATITUDE                                    */}
          {/* ======================================================== */}
          <SectionHeader
            title="Words They Should Hear"
            subtitle="Spoken gratitude and audio keepsakes"
            badge="Voice Vault"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.voiceScroll}
          >
            {VOICE_NOTES.map((vn) => (
              <VoiceNoteCard key={vn.id} voiceNote={vn} />
            ))}
          </ScrollView>

          {/* ======================================================== */}
          {/* 10. ACHIEVEMENTS INSPIRED BY THEM                        */}
          {/* ======================================================== */}
          <SectionHeader
            title="Achievements Inspired By Them"
            subtitle="Milestones made possible by their faith in you"
            badge="Milestones"
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {ACHIEVEMENTS_DATA.map((ach) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  onPress={() => {
                    const id = `home-${ach.id}`;
                    const existing = memoryService.getMemoryById(id);
                    const mentor = memoryService
                      .getAllMentorProfiles()
                      .find(
                        (item) => item.name.toLowerCase() === ach.mentorName.toLowerCase()
                      );
                    const itemId =
                      existing?.id ||
                      memoryService.addMemory({
                        kind: "milestone",
                        id,
                        mentorName: ach.mentorName,
                        mentorId: mentor?.id,
                        relationship: mentor?.relationship || "Mentor",
                        title: ach.title,
                        description: ach.story,
                        year: ach.date.match(/\d{4}/)?.[0] || new Date().getFullYear().toString(),
                        type: "breakthrough",
                        accentColor: Palette.oceanTeal,
                        createdAt: new Date().toISOString(),
                        isPinned: false,
                      });
                    router.push({
                      pathname: "/memory-detail/[id]",
                      params: { id: itemId },
                    });
                  }}
                />
            ))}
          </ScrollView>

          {/* ======================================================== */}
          {/* 8. GRATITUDE FROM AROUND THE WORLD                       */}
          {/* ======================================================== */}
          <SectionHeader
            title="Gratitude From Around the World"
            subtitle="Heartfelt stories shared by the global community"
            badge="Community"
          />

          {GRATITUDE_POSTS.map((post) => (
            <GratitudeCard
              key={post.id}
              post={post}
              onPress={() =>
                Alert.alert(
                  `Honouring ${post.mentorName}`,
                  `${post.authorName} · ${post.location}\n\n${post.message}`
                )
              }
            />
          ))}

          {/* Extra Bottom Padding for floating nav */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </Animated.View>

      {/* Floating Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        onCreatePress={() => setIsAddModalOpen(true)}
      />

      {/* Add Memory Modal Action Sheet */}
      <AddMemoryModal
        visible={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectOption={(optionKey) => {
          handleCreateFromModal(optionKey);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.iceWhite, // Ice White base background
  },
  paperCanvas: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.iceWhite,
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
  },

  /* 1. Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  greetingText: {
    fontSize: 23,
    fontWeight: "800",
    color: Palette.deepTeal, // Deep Teal heading
    letterSpacing: -0.4,
  },
  subGreetingText: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 3,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Palette.pureWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
    position: "relative",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  notifBadgeDot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Palette.turquoise, // Turquoise notification dot
  },
  profileAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: Palette.oceanTeal, // Ocean Teal ring
    overflow: "hidden",
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
  },

  /* 2. Hero Section */
  heroSection: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#3D000A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 22,
  },
  heroGradient: {
    padding: 22,
    position: "relative",
  },
  heroAmbientLight: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(236, 143, 62, 0.16)",
  },
  heroBadgeRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(252, 238, 228, 0.16)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(236, 143, 62, 0.45)",
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFF8F0",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  heroQuoteHeadline: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFF8F0",
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  heroSupportingText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: "rgba(255, 248, 240, 0.92)",
    marginTop: 8,
    marginBottom: 18,
  },
  floatingMemoryNote: {
    backgroundColor: Palette.pureWhite, // Pure White card
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    position: "relative",
    shadowColor: Palette.deepTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  pinDot: {
    position: "absolute",
    top: 6,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.turquoise, // Turquoise pin detail
  },
  floatingNoteQuote: {
    fontSize: 13,
    fontStyle: "italic",
    color: Palette.deepTeal,
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  floatingNoteAuthor: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 6,
    textAlign: "right",
  },

  /* Quick Actions Bar */
  quickActionsContainer: {
    marginBottom: 10,
  },
  quickActionsScroll: {
    paddingHorizontal: 20,
  },

  mentorsScroll: {
    paddingLeft: 20,
    paddingRight: 6,
    marginBottom: 10,
  },

  /* 6. A Lesson I Carry (Mint Mist) */
  lessonSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  lessonCard: {
    borderRadius: 22,
    padding: 22,
    backgroundColor: Palette.mintMist, // Mint Mist card
    borderWidth: 1.2,
    borderColor: "rgba(84, 0, 14, 0.2)",
    position: "relative",
    shadowColor: Palette.oceanTeal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonWaxSeal: {
    position: "absolute",
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.pureWhite,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Palette.turquoise,
  },
  lessonHeaderLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: Palette.oceanTeal,
    marginBottom: 10,
  },
  lessonQuoteText: {
    fontSize: 17,
    lineHeight: 26,
    color: Palette.deepTeal, // Deep Teal quote
    fontStyle: "italic",
    fontFamily: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "serif",
    }),
  },
  lessonAuthorRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tealDividerLine: {
    width: 20,
    height: 2,
    backgroundColor: Palette.turquoise, // Turquoise line
  },
  lessonAuthor: {
    fontSize: 12.5,
    color: Palette.oceanTeal,
    fontWeight: "800",
  },

  /* Filter Row */
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Palette.pureWhite, // Pure White card
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: Palette.oceanTeal, // Ocean Teal active pill
    borderColor: Palette.oceanTeal,
  },
  filterText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: Palette.deepTeal,
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  /* Memory Wall Cards */
  memoryWallContainer: {
    paddingHorizontal: 20,
  },

  /* 5. Add Memory Callout (Ocean Teal Button) */
  addCalloutWrapper: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  addCalloutBtn: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#B84E0E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  addCalloutGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  addCalloutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  addCalloutTextWrap: {
    flex: 1,
  },
  addCalloutTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  addCalloutSub: {
    fontSize: 12,
    color: "rgba(255, 248, 240, 0.95)",
    marginTop: 2,
  },

  /* 11. Daily Prompt (Mint Mist Surface) */
  promptSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  promptCard: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: Palette.mintMist, // Mint Mist reflection card
    borderWidth: 1.2,
    borderColor: "rgba(84, 0, 14, 0.2)",
  },
  promptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  promptTag: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 1,
  },
  promptQuestion: {
    fontSize: 15,
    lineHeight: 22,
    color: Palette.deepTeal,
    fontStyle: "italic",
    marginBottom: 14,
  },
  promptInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Palette.pureWhite,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1.2,
    borderColor: Palette.borderSubtle,
  },
  promptInput: {
    flex: 1,
    color: Palette.deepTeal,
    fontSize: 13.5,
    paddingVertical: 8,
  },
  promptSubmitBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.oceanTeal, // Ocean Teal submit button
    justifyContent: "center",
    alignItems: "center",
  },
  promptSuccessBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(84, 0, 14, 0.12)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(84, 0, 14, 0.25)",
  },
  promptSuccessText: {
    color: Palette.oceanTeal,
    fontSize: 13,
    fontWeight: "700",
  },

  /* Voice & Achievements Scroll */
  voiceScroll: {
    paddingLeft: 20,
    paddingRight: 6,
  },
  achievementsScroll: {
    paddingLeft: 20,
    paddingRight: 6,
  },
});