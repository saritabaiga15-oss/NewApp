import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import { userProfileService } from "./userProfileService";

export interface CommentItem {
  id: string;
  targetId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  isOwner?: boolean;
  isEdited?: boolean;
  parentId?: string;
  replyToName?: string;
}

const STORAGE_KEY = "@honour-your-mentor/comments";
const HIDDEN_STORAGE_KEY = "@honour-your-mentor/hidden_comments";

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: "comment-1",
    targetId: "tribute-1",
    authorName: "Marcus Vance",
    authorUsername: "marcusv",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    text: "This resonates so deeply. Anita Sharma had a similar way of pushing our cohort beyond comfort zones.",
    createdAt: "2h ago",
    likes: 5,
    isLiked: false,
    isOwner: false,
  },
  {
    id: "comment-2",
    targetId: "tribute-1",
    authorName: "Dr. David Mitchell",
    authorUsername: "dmitchell",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    text: "Grateful to see the tradition of mindful guidance carried forward. Wonderful reflection.",
    createdAt: "4h ago",
    likes: 12,
    isLiked: false,
    isOwner: false,
  },
  {
    id: "comment-3",
    targetId: "tribute-1",
    authorName: "Elena Rostova",
    authorUsername: "elenar",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    text: "Beautiful keepsake! Saving this to my daily inspiration list.",
    createdAt: "1d ago",
    likes: 3,
    isLiked: false,
    isOwner: false,
  },
];

class CommentService {
  private comments: CommentItem[] = [...DEFAULT_COMMENTS];
  private listeners: Array<() => void> = [];
  private initialized = false;
  private hiddenCommentIds = new Set<string>();

  async initialize() {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.comments = JSON.parse(stored);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.comments));
      }

      const storedHidden = await AsyncStorage.getItem(HIDDEN_STORAGE_KEY);
      if (storedHidden) {
        const parsedHidden: string[] = JSON.parse(storedHidden);
        this.hiddenCommentIds = new Set(parsedHidden);
      }
    } catch {
      // fallback to memory
    }
    this.initialized = true;
  }

  private async persist() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.comments));
    } catch {
      // non-fatal
    }
    this.notify();
  }

  private async persistHidden() {
    try {
      await AsyncStorage.setItem(
        HIDDEN_STORAGE_KEY,
        JSON.stringify(Array.from(this.hiddenCommentIds))
      );
    } catch {
      // non-fatal
    }
    this.notify();
  }

  getComments(targetId?: string): CommentItem[] {
    if (!targetId || targetId === "default") {
      return this.comments.filter((c) => !this.hiddenCommentIds.has(c.id));
    }
    const specific = this.comments.filter((c) => c.targetId === targetId);
    const active = specific.length > 0 ? specific : this.comments;
    return active.filter((c) => !this.hiddenCommentIds.has(c.id));
  }

  addComment(params: {
    targetId?: string;
    text: string;
    parentId?: string;
    replyToName?: string;
  }): CommentItem {
    const userProfile = userProfileService.getProfile();
    const currentName = userProfile.name && userProfile.name !== "Mentee" ? userProfile.name : "You";
    const currentUsername = userProfile.username || "user";
    const currentAvatar = userProfile.avatarUri || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80";

    const newComment: CommentItem = {
      id: `comment-${Date.now()}`,
      targetId: params.targetId || "default",
      authorName: currentName,
      authorUsername: currentUsername,
      authorAvatar: currentAvatar,
      text: params.text.trim(),
      createdAt: "Just now",
      likes: 0,
      isLiked: false,
      isOwner: true,
      parentId: params.parentId,
      replyToName: params.replyToName,
    };
    this.comments = [newComment, ...this.comments];
    this.persist();

    // Async backend synchronization
    if (params.targetId && !params.targetId.startsWith("demo-")) {
      api.engagement.addComment(params.targetId, params.text.trim()).catch(() => {});
    }

    return newComment;
  }

  editComment(id: string, newText: string): boolean {
    const idx = this.comments.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.comments[idx] = {
        ...this.comments[idx],
        text: newText.trim(),
        isEdited: true,
      };
      this.persist();
      return true;
    }
    return false;
  }

  deleteComment(id: string): boolean {
    const prevLen = this.comments.length;
    this.comments = this.comments.filter((c) => c.id !== id && c.parentId !== id);
    if (this.comments.length !== prevLen) {
      this.persist();
      // Sync delete with backend
      api.engagement.deleteComment(id).catch(() => {});
      return true;
    }
    return false;
  }

  toggleLike(id: string): boolean {
    const idx = this.comments.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const current = this.comments[idx];
      const isLiked = !current.isLiked;
      this.comments[idx] = {
        ...current,
        isLiked,
        likes: isLiked ? current.likes + 1 : Math.max(0, current.likes - 1),
      };
      this.persist();

      // Sync with backend
      api.engagement.toggleCommentLike(id).catch(() => {});
      return true;
    }
    return false;
  }

  hideComment(id: string): boolean {
    this.hiddenCommentIds.add(id);
    this.persistHidden();
    // Sync with backend
    api.engagement.hideComment(id).catch(() => {});
    return true;
  }

  reportComment(id: string, _reason: string): boolean {
    return true;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const commentService = new CommentService();
