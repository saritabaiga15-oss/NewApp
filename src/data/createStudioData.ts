import { CreationOptionItem, InspirationPrompt } from "@/types/create";
import { Palette } from "@/constants/theme";

export const CREATION_OPTIONS: CreationOptionItem[] = [
  {
    id: "tribute",
    title: "Appreciation",
    subtitle: "Celebrate their impact.",
    purpose: "Create a beautiful recognition card for someone who made a difference.",
    icon: "heart",
    accentColor: Palette.oceanTeal,
    secondaryColor: Palette.turquoise,
    badgeLabel: "RECOGNITION",
    vibe: "Gratitude & Celebration",
  },
  {
    id: "memory",
    title: "Write a Memo",
    subtitle: "Keep a moment forever.",
    purpose: "Preserve a meaningful moment with your mentor in a personal memory journal.",
    icon: "camera",
    accentColor: Palette.turquoise,
    secondaryColor: Palette.oceanTeal,
    badgeLabel: "JOURNAL",
    vibe: "Personal Memory",
  },
  {
    id: "letter",
    title: "Open Letter",
    subtitle: "Write from the heart.",
    purpose: "Write a handwritten-style letter expressing gratitude and meaningful thoughts.",
    icon: "mail-open-outline",
    accentColor: "#9E2A2B",
    secondaryColor: Palette.turquoise,
    badgeLabel: "PERSONAL",
    vibe: "Unsent Words",
  },
  {
    id: "lesson",
    title: "Write a Note",
    subtitle: "Make it uniquely yours.",
    purpose: "Create a personal note on artistic stationery with expressive details.",
    icon: "color-palette-outline",
    accentColor: Palette.accentLavender,
    secondaryColor: Palette.accentPink,
    badgeLabel: "STATIONERY",
    vibe: "Artistic & Thoughtful",
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
