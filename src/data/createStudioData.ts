import { CreationOptionItem, InspirationPrompt } from "@/types/create";
import { Palette } from "@/constants/theme";

export const CREATION_OPTIONS: CreationOptionItem[] = [
  {
    id: "tribute",
    title: "A Tribute",
    subtitle: "Celebrate someone special.",
    purpose: "Create a heartfelt tribute to a person who made a difference.",
    icon: "heart",
    accentColor: Palette.oceanTeal,
    secondaryColor: Palette.turquoise,
    badgeLabel: "HONOUR",
    vibe: "Tribute & Celebration",
  },
  {
    id: "memory",
    title: "A Memory",
    subtitle: "Keep a moment alive.",
    purpose: "Preserve a meaningful experience, photograph, or milestone.",
    icon: "camera",
    accentColor: Palette.turquoise,
    secondaryColor: Palette.oceanTeal,
    badgeLabel: "SNAPSHOT",
    vibe: "Living Keepsake",
  },
  {
    id: "letter",
    title: "A Letter",
    subtitle: "Say what matters.",
    purpose: "Write a personal letter expressing gratitude and appreciation.",
    icon: "mail-open-outline",
    accentColor: "#9E2A2B",
    secondaryColor: Palette.turquoise,
    badgeLabel: "PERSONAL",
    vibe: "Unsent Words",
  },
  {
    id: "lesson",
    title: "A Life Lesson",
    subtitle: "Save their wisdom.",
    purpose: "Capture valuable advice, meaningful quotes, and lessons learned from someone important.",
    icon: "bulb-outline",
    accentColor: "#B8621B",
    secondaryColor: Palette.oceanTeal,
    badgeLabel: "WISDOM",
    vibe: "Guiding Principles",
  },
];

export const INSPIRATION_PROMPTS: InspirationPrompt[] = [
  {
    id: "p1",
    question: "Who helped you become the person you are today?",
    supportingText: "Start with one person, one moment, or one thing you will never forget.",
    categoryTag: "Roots & Foundations",
    suggestedType: "tribute",
    accentTone: Palette.turquoise,
  },
  {
    id: "p2",
    question: "What words of encouragement stayed with you during a difficult season?",
    supportingText: "Recall the voice that gave you the courage to stand tall and keep going.",
    categoryTag: "Quiet Strength",
    suggestedType: "letter",
    accentTone: Palette.oceanTeal,
  },
  {
    id: "p3",
    question: "Which quiet sacrifice made by a mentor changed your trajectory?",
    supportingText: "Some acts of love were never announced, yet they reshaped your future.",
    categoryTag: "Unspoken Grace",
    suggestedType: "memory",
    accentTone: "#9E2A2B",
  },
  {
    id: "p4",
    question: "What hard-learned truth was passed down to you like an heirloom?",
    supportingText: "Capture the guidance before time softens its clarity.",
    categoryTag: "Timeless Wisdom",
    suggestedType: "lesson",
    accentTone: "#B8621B",
  },
  {
    id: "p5",
    question: "What would you say if you could send a letter across the years?",
    supportingText: "Speak what is in your heart without hesitation or second thoughts.",
    categoryTag: "Heartfelt Words",
    suggestedType: "letter",
    accentTone: Palette.turquoise,
  },
];

export const MENTOR_RELATIONSHIPS = [
  "Teacher",
  "Parent",
  "Grandparent",
  "Coach",
  "Friend",
  "Professor",
  "Colleague",
  "Spiritual Guide",
  "Other Mentor",
  "Literature Teacher",
  "Research Advisor",
  "Engineering Director",
  "Art & Design Coach",
  "Friend & Mentor",
];

export const EMOTIONAL_TAGS = [
  "Endless Gratitude",
  "Tough Love",
  "Quiet Believer",
  "Life-Changing Advice",
  "Second Chance",
  "Sacrifice & Care",
];
