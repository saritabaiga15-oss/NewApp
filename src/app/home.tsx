import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Image,
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
import { AppFonts, Palette } from "@/constants/theme";

// Modular Reusable Components
import SectionHeader from "../components/home/SectionHeader";
import MentorCard, { MentorData } from "../components/home/MentorCard";
import MemoryCard, { MemoryData } from "../components/home/MemoryCard";
import VoiceNoteCard, { VoiceNoteData } from "../components/home/VoiceNoteCard";
import GratitudeCard, { GratitudePostData } from "../components/home/GratitudeCard";
import AchievementCard, { AchievementData } from "../components/home/AchievementCard";
import AchievementDetailModal from "../components/home/AchievementDetailModal";
import TimelinePreview, { TimelineNode } from "../components/home/TimelinePreview";
import QuickAction from "../components/home/QuickAction";
import BottomNavigation, { NavTab } from "../components/home/BottomNavigation";
import AddMemoryModal from "../components/home/AddMemoryModal";
import VoiceRecorderModal, {
  RecordedVoiceNote,
} from "../components/home/VoiceRecorderModal";
import { memoryService } from "@/services/memoryService";
import { userProfileService } from "@/services/userProfileService";
import type { UserProfile } from "@/services/userProfileService";
import type { WallItem, WallMemory } from "@/types/memoryWall";
import { useResponsive } from "@/hooks/useResponsive";
import { useQrModal } from "@/context/QrModalContext";
import QRCodeSvg from "@/components/web/QRCodeSvg";

// Mock Data: Mentors
const MENTORS_DATA: MentorData[] = [
  {
    id: "m1",
    name: "Mrs. Anita Sharma",
    role: "Literature Teacher",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80",
    quote: "Believe in your voice before asking the world to listen.",
    memoriesCount: 14,
    yearsKnown: "3 years together",
    isBookmarked: true,
    trait: "Patient guide",
    traitIcon: "flask-outline",
    lessonCarried: "She stayed after class until fractions finally clicked.",
    coverColor: Palette.accentSky,
  },
  {
    id: "m2",
    name: "Dr. David Mitchell",
    role: "Research Advisor",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    quote: "True mastery is quiet patience with difficult problems.",
    memoriesCount: 9,
    yearsKnown: "2 years together",
    isBookmarked: false,
    trait: "Honest compass",
    traitIcon: "compass-outline",
    lessonCarried: "Critique is an invitation to who you can become tomorrow.",
    coverColor: Palette.accentLavender,
  },
  {
    id: "m3",
    name: "Vikram Rao",
    role: "Engineering Director",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    quote: "Build things that outlive your tenure and elevate people.",
    memoriesCount: 18,
    yearsKnown: "6 years together",
    isBookmarked: true,
    trait: "Master craftsman",
    traitIcon: "construct-outline",
    lessonCarried: "Build things that outlive your tenure and elevate people around you.",
    coverColor: Palette.accentMint,
  },
  {
    id: "m4",
    name: "Elena Rostova",
    role: "Art & Design Coach",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    quote: "Do not fear the blank page; it is waiting for your courage.",
    memoriesCount: 11,
    yearsKnown: "5 years together",
    isBookmarked: false,
    trait: "Creative clarity",
    traitIcon: "sparkles-outline",
    lessonCarried: "Forgive yourself for the first five ugly drafts to find the single true stroke.",
    coverColor: Palette.accentPink,
  },
  {
    id: "m5",
    name: "Priya Nair",
    role: "Design Lead",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80",
    quote: "Trust your taste and ship the idea anyway.",
    memoriesCount: 7,
    yearsKnown: "4 years together",
    isBookmarked: false,
    trait: "Creative visionary",
    traitIcon: "color-palette-outline",
    lessonCarried: "She told me to trust my taste and ship the idea anyway.",
    coverColor: Palette.accentCoral,
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

const MEMORY_WALL_FILTERS = [
  { id: "all", label: "All Memories", icon: "sparkles-outline", color: Palette.accentSky },
  { id: "photo", label: "Photos", icon: "camera-outline", color: Palette.accentLavender },
  { id: "gratitude", label: "Gratitude", icon: "chatbubble-ellipses-outline", color: Palette.accentPink },
  { id: "voice", label: "Audio", icon: "mic-outline", color: Palette.accentPeach },
  { id: "achievement", label: "Milestones", icon: "trophy-outline", color: Palette.accentMint },
  { id: "lesson", label: "Lessons", icon: "book-outline", color: Palette.accentAmber },
] as const;

interface MemoryFilterPillProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isActive: boolean;
  onPress: () => void;
}

function MemoryFilterPill({
  label,
  icon,
  color,
  isActive,
  onPress,
}: MemoryFilterPillProps) {
  const scale = React.useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1.04 : 1,
      speed: 24,
      bounciness: 5,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        accessibilityRole="button"
        accessibilityLabel={`${label} filter`}
        accessibilityState={{ selected: isActive }}
      >
        <Ionicons
          name={icon}
          size={14}
          color={isActive ? "#000000" : color}
        />
        <Text
          style={[
            styles.filterText,
            { color: isActive ? "#000000" : color },
            isActive && styles.filterTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function formatAudioDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

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
    mentorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Research Advisor",
    date: "June 2024",
    location: "Stanford Memorial Auditorium",
    category: "Academic Milestone",
    highlightStat: "Honors with Distinction",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80",
    story: "Wrote the dedication page to you, who spent Sunday mornings showing me how to write clear equations and never let me settle for half-baked thinking.",
    variant: "cinematic",
  },
  {
    id: "ach2",
    badgeType: "award",
    title: "Best Debut Author Award",
    mentorName: "Mrs. Anita Sharma",
    mentorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Literature Teacher",
    date: "March 2024",
    location: "National Book Guild Gala",
    category: "Literary Honor",
    highlightStat: "1st Place Gold Medal",
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80",
    story: "Every word in that novel passed through the standards you taught in room 204. You made me believe my voice was worth preserving.",
    variant: "editorial",
  },
  {
    id: "ach3",
    badgeType: "job",
    title: "Promoted to Principal Engineer",
    mentorName: "Vikram Rao",
    mentorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Engineering Director",
    date: "January 2024",
    location: "Cloud Systems Summit",
    category: "Leadership Breakthrough",
    highlightStat: "Tech Lead & Architect",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
    story: "Remembering how you told me leadership is not a podium, but a shield for your team. This milestone belongs to your patient mentorship.",
    variant: "luxe",
  },
  {
    id: "ach4",
    badgeType: "certificate",
    title: "Design Fellowship Grant",
    mentorName: "Elena Rostova",
    mentorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Art & Design Coach",
    date: "November 2023",
    location: "Metropolitan Design Institute",
    category: "Creative Grant",
    highlightStat: "Fellowship Winner",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    story: "When I was terrified of blank canvases, you placed the brush in my hand. Today our exhibition opened to hundreds of young artists.",
    variant: "polaroid",
  },
  {
    id: "ach5",
    badgeType: "competition",
    title: "Global AI Hackathon Champion",
    mentorName: "Dr. David Mitchell",
    mentorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    mentorRole: "Research Advisor",
    date: "August 2023",
    location: "TechHub International, SF",
    category: "Innovation Victory",
    highlightStat: "Grand Prize Winner",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
    story: "We stayed up until dawn debugging the model. Your quiet reassurance that resilience beats talent carried our team to victory.",
    variant: "showcase",
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
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [selectedAchievementModal, setSelectedAchievementModal] = useState<AchievementData | null>(null);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [wallItems, setWallItems] = useState<WallItem[]>(() =>
    memoryService.getAllMemories()
  );
  const [profile, setProfile] = useState<UserProfile>(() => userProfileService.getProfile());
  const [homeSearch, setHomeSearch] = useState("");
  const { isWeb } = useResponsive();
  const { openQrModal } = useQrModal();
  const [reflectionInput, setReflectionInput] = useState("");
  const [hasSubmittedReflection, setHasSubmittedReflection] = useState(false);

  React.useEffect(
    () => userProfileService.subscribe((nextProfile) => setProfile(nextProfile)),
    []
  );

  React.useEffect(
    () => memoryService.subscribe(() => setWallItems(memoryService.getAllMemories())),
    []
  );

  const recordedVoiceNotes = useMemo<VoiceNoteData[]>(
    () =>
      wallItems
        .filter(
          (item): item is WallMemory & { audioUri: string } =>
            item.kind === "memory" && typeof item.audioUri === "string"
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          mentorName: item.mentorName,
          duration: formatAudioDuration(item.audioDuration ?? 0),
          date: new Date(item.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          category: "Voice Memory",
          audioUri: item.audioUri,
          durationSeconds: item.audioDuration,
        })),
    [wallItems]
  );

  const voiceNotes = useMemo(
    () => [...recordedVoiceNotes, ...VOICE_NOTES],
    [recordedVoiceNotes]
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

  const handleSaveVoiceRecording = (recording: RecordedVoiceNote) => {
    const now = new Date();
    const itemId = memoryService.addMemory({
      kind: "memory",
      id: `voice-${Date.now()}`,
      mentorName: recording.mentorName,
      relationship: "Mentor",
      title: recording.title,
      excerpt: `Voice memory recorded on ${now.toLocaleDateString()}.`,
      story: `A voice memory recorded on ${now.toLocaleDateString()}.`,
      audioUri: recording.uri,
      audioDuration: recording.durationSeconds,
      year: String(now.getFullYear()),
      emotion: "Gratitude",
      emotionColor: Palette.oceanTeal,
      createdAt: now.toISOString(),
      isPinned: false,
    });
    setIsVoiceRecorderOpen(false);
    router.push({ pathname: "/memory-detail/[id]", params: { id: itemId } });
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

  const filteredMentors = useMemo(() => {
    const query = homeSearch.trim().toLowerCase();
    if (!query) return mentorsList;
    return mentorsList.filter((mentor) =>
      [mentor.name, mentor.role, mentor.quote]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [homeSearch, mentorsList]);

  const featuredMentor = mentorsList[0];
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Pure Cloud Canvas */}
      <View style={styles.paperCanvas} />

      <Animated.View style={[styles.mainContainer, { opacity: fadeAnim }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.welcomeRow}>
            <View style={styles.welcomeCopy}>
              <Text style={styles.welcomeTitle}>
                Good morning,{"\n"}
                {profile.name.split(" ")[0]}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Keep the people who shaped you close.
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.75}
                onPress={() =>
                  Alert.alert(
                    "Notifications",
                    "You’re all caught up on your memories."
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color={Palette.textPrimary}
                />
                <View style={styles.notificationDot} />
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

          <View style={styles.homeSearch}>
            <Ionicons
              name="search-outline"
              size={17}
              color={Palette.textSecondary}
            />
            <TextInput
              value={homeSearch}
              onChangeText={setHomeSearch}
              placeholder="Search mentors, stories, lessons"
              placeholderTextColor={Palette.textSecondary}
              style={styles.homeSearchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityRole="search"
              accessibilityLabel="Search mentors, stories, and lessons"
            />
            {homeSearch.length > 0 && (
              <TouchableOpacity
                onPress={() => setHomeSearch("")}
                accessibilityRole="button"
                accessibilityLabel="Clear search"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Palette.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          
          {/* Responsive QR Code Hero Card on Web */}
          {isWeb && (
            <View style={styles.webQrHeroCard}>
              <View style={styles.webQrHeroLeft}>
                <View style={styles.webQrBadge}>
                  <Ionicons name="phone-portrait-outline" size={13} color={Palette.oceanTeal} />
                  <Text style={styles.webQrBadgeText}>MOBILE APP & PWA READY</Text>
                </View>
                <Text style={styles.webQrHeroTitle}>Experience Honour Your Mentor on your phone</Text>
                <Text style={styles.webQrHeroDesc}>
                  Scan this QR code with your mobile camera to access your tributes, receive birthday reminders, and install as an app.
                </Text>
                <View style={styles.webQrHeroActionRow}>
                  <TouchableOpacity
                    style={styles.webQrHeroBtn}
                    onPress={() => openQrModal("https://onodem.com")}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="qr-code" size={15} color="#FFFFFF" />
                    <Text style={styles.webQrHeroBtnText}>Scan QR Code</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.webQrHeroSecondaryBtn}
                    onPress={() => openQrModal("https://onodem.com")}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="camera-outline" size={15} color={Palette.oceanTeal} />
                    <Text style={styles.webQrHeroSecondaryBtnText}>Camera Scanner</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.webQrHeroRight}
                onPress={() => openQrModal("https://onodem.com")}
                activeOpacity={0.9}
              >
                <QRCodeSvg value="https://onodem.com" size={114} color={Palette.oceanTeal} />
                <Text style={styles.webQrScanLabel}>Click to scan / enlarge</Text>
              </TouchableOpacity>
            </View>
          )}

          {featuredMentor && (
            <View style={styles.featuredStory}>
              <Image
                source={{ uri: featuredMentor.avatar }}
                style={styles.featuredStoryImage}
                resizeMode="cover"
                accessibilityLabel={`Portrait of ${featuredMentor.name}`}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.28)", "rgba(0,0,0,0.96)"]}
                locations={[0, 0.38, 1]}
                style={styles.featuredStoryOverlay}
              />
              <View style={styles.featuredStoryContent}>
                <View style={styles.featuredStoryBadge}>
                  <Text style={styles.featuredStoryBadgeText}>Featured story</Text>
                </View>
                <Text style={styles.featuredStoryQuote} numberOfLines={3}>
                  &ldquo;{featuredMentor.quote}&rdquo;
                </Text>
                <Text style={styles.featuredStoryMentor} numberOfLines={1}>
                  {featuredMentor.name} · {featuredMentor.role}
                </Text>
                <TouchableOpacity
                  style={styles.watchStoryButton}
                  activeOpacity={0.85}
                  onPress={() => handleOpenMentor(featuredMentor)}
                  accessibilityRole="button"
                  accessibilityLabel={`Watch ${featuredMentor.name}'s story`}
                >
                  <Text style={styles.watchStoryText}>Watch story</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={Palette.textOnPrimary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* PEOPLE WHO SHAPED YOU                                   */}
          {/* ======================================================== */}
          <View style={styles.mentorsDarkSection}>
            <View style={styles.mentorSectionHeader}>
              <Text style={styles.mentorSectionTitle}>People who made a difference</Text>
              <TouchableOpacity
                onPress={() => router.push("/memory-wall")}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityLabel="See all mentors"
              >
                <Text style={styles.mentorSectionAction}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mentorsScroll}
              decelerationRate="fast"
              snapToInterval={244}
              snapToAlignment="start"
            >
              {filteredMentors.map((mentor, idx) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  index={idx}
                  cardWidth={230}
                  onBookmarkToggle={handleBookmarkToggle}
                  onPress={() => handleOpenMentor(mentor)}
                />
              ))}
              {filteredMentors.length === 0 && (
                <Text style={styles.noMentorsText}>
                  No mentors match “{homeSearch.trim()}”.
                </Text>
              )}
            </ScrollView>
          </View>

          <View style={styles.quickActionsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionsScroll}
            >
              <QuickAction
                icon="person-add"
                label="Add Mentor"
                color={Palette.accentSky}
                onPress={() => router.push("/create-mentor")}
              />
              <QuickAction
                icon="add-circle"
                label="Add Memory"
                color={Palette.accentMint}
                badge="+"
                onPress={() => setIsAddModalOpen(true)}
              />
              <QuickAction
                icon="heart"
                label="Appreciation"
                color={Palette.accentCoral}
                onPress={() => router.push("/create-tribute")}
              />
              <QuickAction
                icon="mic"
                label="Voice Note"
                color={Palette.accentAmber}
                onPress={() => setIsVoiceRecorderOpen(true)}
              />
              <QuickAction
                icon="time"
                label="Timeline"
                color={Palette.accentSky}
                onPress={() => router.push("/memory-wall")}
              />
            </ScrollView>
          </View>

          {/* ======================================================== */}
          {/* 6. A LESSON I CARRY                                      */}
          {/* ======================================================== */}
          <View style={styles.lessonSection}>
            <View style={styles.lessonCard}>
              <View style={styles.lessonWaxSeal}>
                <Ionicons name="bookmark" size={16} color={Palette.accentAmber} />
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
            isDark
          />

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {MEMORY_WALL_FILTERS.map((filter) => (
              <MemoryFilterPill
                key={filter.id}
                label={filter.label}
                icon={filter.icon}
                color={filter.color}
                isActive={selectedTag === filter.id}
                onPress={() => setSelectedTag(filter.id)}
              />
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
          {/* 5. ADD A MEMORY FEATURED CALLOUT                         */}
          {/* ======================================================== */}
          <View style={styles.addCalloutWrapper}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setIsAddModalOpen(true)}
              style={styles.addCalloutBtn}
            >
              <LinearGradient
                colors={["#1C1C1C", "#141414", "#0F0F0F"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCalloutGradient}
              >
                <View style={styles.addCalloutIconWrap}>
                  <Ionicons name="sparkles" size={20} color={Palette.accentAmber} />
                </View>
                <View style={styles.addCalloutTextWrap}>
                  <Text style={styles.addCalloutTitle}>Add to Your Memory Wall</Text>
                  <Text style={styles.addCalloutSub}>
                    Record a voice note, photo, or handwritten lesson
                  </Text>
                </View>
                <Ionicons name="add-circle" size={28} color={Palette.accentMint} />
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
          {/* 11. DAILY GRATITUDE PROMPT                               */}
          {/* ======================================================== */}
          <View style={styles.promptSection}>
            <View style={styles.promptCard}>
              <View style={styles.promptHeader}>
                <Ionicons name="bulb-outline" size={18} color={Palette.accentAmber} />
                <Text style={styles.promptTag}>TODAY&apos;S REFLECTION</Text>
              </View>

              <Text style={styles.promptQuestion}>
                &ldquo;What is one lesson from your mentor that you still use today?&rdquo;
              </Text>

              {hasSubmittedReflection ? (
                <View style={styles.promptSuccessBox}>
                  <Ionicons name="checkmark-circle" size={18} color={Palette.accentMint} />
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
                    placeholderTextColor="#737373"
                    style={styles.promptInput}
                  />
                  <TouchableOpacity
                    onPress={handleSaveReflection}
                    activeOpacity={0.8}
                    style={styles.promptSubmitBtn}
                  >
                    <Ionicons name="arrow-forward" size={16} color="#000000" />
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
            isDark
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.voiceScroll}
          >
            {voiceNotes.map((vn) => (
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
            isDark
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsScroll}
          >
            {ACHIEVEMENTS_DATA.map((ach, idx) => (
                <AchievementCard
                  key={ach.id}
                  achievement={ach}
                  index={idx}
                  onPress={() => {
                    setSelectedAchievementModal(ach);
                    setIsAchievementModalOpen(true);

                    // Sync to memoryService so memory details are ready
                    const id = `home-${ach.id}`;
                    const existing = memoryService.getMemoryById(id);
                    const mentor = memoryService
                      .getAllMentorProfiles()
                      .find(
                        (item) => item.name.toLowerCase() === ach.mentorName.toLowerCase()
                      );
                    if (!existing) {
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
                        imageUri: ach.image,
                        createdAt: new Date().toISOString(),
                        isPinned: false,
                      });
                    }
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
            isDark
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
      <VoiceRecorderModal
        visible={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onSave={handleSaveVoiceRecording}
      />
      <AchievementDetailModal
        visible={isAchievementModalOpen}
        achievement={selectedAchievementModal}
        onClose={() => setIsAchievementModalOpen(false)}
        onViewMentor={(mentorName) => {
          setIsAchievementModalOpen(false);
          const found = mentorsList.find(
            (m) => m.name.toLowerCase() === mentorName.toLowerCase()
          );
          if (found) {
            handleOpenMentor(found);
          } else {
            router.push("/memory-wall");
          }
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

  welcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  welcomeCopy: {
    flex: 1,
    paddingRight: 10,
  },
  welcomeTitle: {
    color: Palette.textPrimary,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
    fontWeight: "800",
  },
  welcomeSubtitle: {
    color: Palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.surfaceCard,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Palette.accentSky,
  },
  profileAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    overflow: "hidden",
    marginLeft: 12,
  },
  profileAvatar: {
    width: "100%",
    height: "100%",
  },
  homeSearch: {
    height: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    backgroundColor: Palette.surfaceElevated,
    borderRadius: 17,
    marginBottom: 13,
  },
  homeSearchInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 12,
    color: Palette.textPrimary,
  },
  featuredStory: {
    height: 332,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 23,
    overflow: "hidden",
    backgroundColor: Palette.surfaceCard,
  },
  featuredStoryImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  featuredStoryOverlay: {
    ...StyleSheet.absoluteFill,
  },
  featuredStoryContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    alignItems: "flex-start",
  },
  featuredStoryBadge: {
    backgroundColor: Palette.accentPink,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 10,
  },
  featuredStoryBadgeText: {
    color: Palette.textOnPrimary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  featuredStoryQuote: {
    color: Palette.textPrimary,
    fontSize: 23,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: AppFonts.displaySans,
    marginBottom: 5,
  },
  featuredStoryMentor: {
    fontSize: 10,
    color: Palette.textSecondary,
  },
  watchStoryButton: {
    minHeight: 39,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 13,
    borderRadius: 22,
    backgroundColor: Palette.textPrimary,
  },
  watchStoryText: {
    color: Palette.textOnPrimary,
    fontSize: 11,
    fontWeight: "800",
  },
  mentorSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 17,
    marginBottom: 12,
  },
  mentorSectionTitle: {
    color: Palette.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  mentorSectionAction: {
    color: Palette.accentSky,
    fontSize: 10,
    fontWeight: "700",
  },
  noMentorsText: {
    color: Palette.textSecondary,
    fontSize: 13,
    paddingHorizontal: 20,
  },

  /* Quick Actions Bar */
  quickActionsContainer: {
    marginBottom: 10,
  },
  quickActionsScroll: {
    paddingHorizontal: 20,
  },

  mentorsDarkSection: {
    marginBottom: 8,
  },
  mentorsScroll: {
    paddingLeft: 20,
    paddingRight: 6,
    marginBottom: 4,
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
    borderColor: "#303030",
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
    color: Palette.deepTeal,
    fontStyle: "italic",
    fontFamily: AppFonts.body,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Palette.pureWhite,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  filterPillActive: {
    backgroundColor: Palette.oceanTeal,
    borderColor: Palette.oceanTeal,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.deepTeal,
  },
  filterTextActive: {
    color: "#000000",
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
    borderColor: "#303030",
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
    backgroundColor: "rgba(143, 211, 255, 0.12)",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(143, 211, 255, 0.25)",
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
  webQrHeroCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    flexWrap: "wrap",
  },
  webQrHeroLeft: {
    flex: 1,
    minWidth: 240,
  },
  webQrBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  webQrBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: Palette.oceanTeal,
    letterSpacing: 0.8,
  },
  webQrHeroTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Palette.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  webQrHeroDesc: {
    fontSize: 12.5,
    color: Palette.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  webQrHeroActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  webQrHeroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.oceanTeal,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  webQrHeroBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },
  webQrHeroSecondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.mintMist,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFE3DC",
  },
  webQrHeroSecondaryBtnText: {
    color: Palette.oceanTeal,
    fontSize: 12.5,
    fontWeight: "700",
  },
  webQrHeroRight: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  webQrScanLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textMuted,
    marginTop: 6,
  },

  achievementsScroll: {
    paddingLeft: 20,
    paddingRight: 6,
  },
});