

export type WallCategory =
  | "all"
  | "tributes"
  | "memories"
  | "letters"
  | "lessons"
  | "milestones";

export type WallItemType = "tribute" | "memory" | "letter" | "lesson" | "milestone";

export type MilestoneType =
  | "first-meeting"
  | "graduation"
  | "breakthrough"
  | "farewell"
  | "reunion"
  | "life-change";

// ───────────────────────────────────────────────────────────────
// Wall Items
// ───────────────────────────────────────────────────────────────

export interface WallTribute {
  kind: "tribute";
  id: string;
  mentorName: string;
  mentorId?: string;
  relationship: string;
  photoUri: string;
  additionalImages?: string[];
  quote: string;
  title?: string;
  story?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  createdAt: string;
  templateId: string;
  frameStyle?: string;
  typographyStyle?: string;
  isPinned?: boolean;
  isShared?: boolean;
}

export interface WallMemory {
  kind: "memory";
  id: string;
  title: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  excerpt: string;
  story?: string;
  imageUri?: string;
  additionalImages?: string[];
  year: string;
  emotion: string;
  emotionColor: string;
  quote?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WallLetter {
  kind: "letter";
  id: string;
  title: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  preview: string;
  letterBody?: string;
  salutation?: string;
  signoff?: string;
  wordCount: number;
  mood: string;
  quote?: string;
  imageUri?: string;
  additionalImages?: string[];
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WallLesson {
  kind: "lesson";
  id: string;
  lessonTitle: string;
  quote: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  category: string;
  story?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  imageUri?: string;
  additionalImages?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export interface WallMilestone {
  kind: "milestone";
  id: string;
  title: string;
  description: string;
  story?: string;
  mentorName: string;
  mentorId?: string;
  relationship?: string;
  year: string;
  type: MilestoneType;
  accentColor: string;
  quote?: string;
  lessonCarried?: string;
  momentToRemember?: string;
  achievements?: string[];
  imageUri?: string;
  additionalImages?: string[];
  createdAt: string;
  isPinned?: boolean;
}

export type WallItem =
  | WallTribute
  | WallMemory
  | WallLetter
  | WallLesson
  | WallMilestone;

// ───────────────────────────────────────────────────────────────
// Mentor Profile (grouped view)
// ───────────────────────────────────────────────────────────────

export interface WallMentorProfile {
  id: string;
  name: string;
  relationship: string;
  avatarUri: string;
  description?: string;
  meaningfulQuote?: string;
  itemCount: number;
  latestActivity: string;
  coverColor: string;
}

// ───────────────────────────────────────────────────────────────
// Filter Tabs
// ───────────────────────────────────────────────────────────────

export interface WallFilterTab {
  key: WallCategory;
  label: string;
  icon: string;
  count: number;
}

