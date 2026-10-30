import AsyncStorage from "@react-native-async-storage/async-storage";
import { WALL_ITEMS, WALL_MENTOR_PROFILES } from "@/data/memoryWallData";
import { tributeDraftService } from "./tributeDraftService";
import { WallItem, WallMentorProfile, WallTribute } from "@/types/memoryWall";
import type { TributeRelationship } from "@/types/create";
import { api } from "./api";

type Listener = () => void;

function isTributeRelationship(value: string): value is TributeRelationship {
  return [
    "Teacher",
    "Parent",
    "Coach",
    "Friend",
    "Leader",
    "Other",
    "Grandparent",
    "Professor",
    "Colleague",
    "Spiritual Guide",
    "Other Mentor",
    "Literature Teacher",
    "Research Advisor",
    "Engineering Director",
    "Art & Design Coach",
    "Friend & Mentor",
  ].includes(value);
}

function isPinOverrideMap(value: unknown): value is Record<string, boolean> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((isPinned) => typeof isPinned === "boolean")
  );
}

class MemoryService {
  private items: WallItem[] = [...WALL_ITEMS];
  private mentors: WallMentorProfile[] = [...WALL_MENTOR_PROFILES];
  private userItemIds = new Set<string>();
  private pinOverrides = new Map<string, boolean>();
  private listeners: Set<Listener> = new Set();
  private initializePromise: Promise<void> | null = null;
  private persistenceQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.syncKeepsakes();
    tributeDraftService.subscribe(() => {
      this.syncKeepsakes();
      this.notify();
    });
  }

  public initialize(): Promise<void> {
    if (!this.initializePromise) {
      this.initializePromise = AsyncStorage.getItem("@honour-your-mentor/memories")
        .then((stored) => {
          if (!stored) return;
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            if (!parsed.every(isStoredWallItem)) {
              throw new Error("The saved memory collection is invalid.");
            }
            this.loadUserItems(parsed);
          } else if (parsed && typeof parsed === "object") {
            const data = parsed as {
              items?: unknown;
              pinOverrides?: unknown;
            };
            if (
              !Array.isArray(data.items) ||
              !data.items.every(isStoredWallItem) ||
              (data.pinOverrides !== undefined &&
                !isPinOverrideMap(data.pinOverrides))
            ) {
              throw new Error("The saved memory collection is invalid.");
            }
            this.loadUserItems(data.items);
            Object.entries(data.pinOverrides ?? {}).forEach(([id, isPinned]) => {
              this.pinOverrides.set(id, isPinned);
            });
          } else {
            throw new Error("The saved memory collection is invalid.");
          }
          for (const item of this.items) {
            const isPinned = this.pinOverrides.get(item.id);
            if (isPinned !== undefined) item.isPinned = isPinned;
          }
          this.updateMentorCounts();
          this.notify();
          this.syncWithBackend().catch(() => {});
        })
        .catch((error: unknown) => {
          this.initializePromise = null;
          throw error;
        });
    }
    return this.initializePromise;
  }

  /**
   * Synchronizes public tributes and mentor profiles with the Spring Boot + Neon DB backend
   */
  public async syncWithBackend(): Promise<void> {
    try {
      // 1. Fetch public feed tributes from Neon PostgreSQL
      const feedRes = await api.tributes.publicFeed(0, 50);
      if (feedRes?.data?.content && Array.isArray(feedRes.data.content)) {
        for (const dto of feedRes.data.content) {
          const exists = this.items.some((i) => i.id === dto.id);
          if (!exists) {
            const wallItem: WallItem = {
              kind: (dto.kind as any) || "tribute",
              id: dto.id,
              mentorId: dto.mentorId,
              mentorName: dto.mentorName,
              relationship: dto.relationship || "Mentor",
              title: dto.title || `Tribute to ${dto.mentorName}`,
              photoUri: dto.photoUri || "",
              quote: dto.quote || "",
              story: dto.story || dto.excerpt || "",
              excerpt: dto.excerpt || "",
              lessonCarried: dto.lessonCarried || "",
              momentToRemember: dto.momentToRemember || "",
              year: dto.year || "2024",
              emotion: dto.emotion || "Gratitude",
              emotionColor: dto.emotionColor || "#FF9ECF",
              createdAt: dto.createdAt || new Date().toISOString(),
              isPinned: dto.isPinned || false,
              isShared: dto.isShared || false,
            } as any;
            this.items.unshift(wallItem);
          }
        }
      }

      // 2. Fetch mentors list from Backend
      const mentorsRes = await api.mentors.list();
      if (mentorsRes?.data && Array.isArray(mentorsRes.data)) {
        for (const m of mentorsRes.data) {
          const idx = this.mentors.findIndex(
            (p) => p.id === m.id || p.name.toLowerCase() === m.name.toLowerCase()
          );
          const mentorProfile: WallMentorProfile = {
            id: m.id,
            name: m.name,
            relationship: m.relationship || "Mentor",
            avatarUri: m.avatarUri || "",
            description: m.quote || "",
            meaningfulQuote: m.quote || "",
            coverColor: m.coverColor || "#54000E",
            itemCount: m.itemCount || 0,
            latestActivity: m.latestActivity || "Active",
            category: (m.category as any) || "school",
          };
          if (idx >= 0) {
            this.mentors[idx] = mentorProfile;
          } else {
            this.mentors.push(mentorProfile);
          }
        }
      }

      this.updateMentorCounts();
      this.notify();
    } catch {
      // Offline fallback: graceful degradation if server is momentarily unreachable
    }
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error("Error in MemoryService listener:", err);
      }
    });
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Merge any keepsakes created in the Tribute Studio / Preview flow
  public syncKeepsakes(): void {
    const keepsakes = tributeDraftService.getSavedKeepsakes();
    for (const keepsake of keepsakes) {
      let matchingMentor = this.mentors.find(
        (m) => m.name.toLowerCase() === keepsake.mentorName.toLowerCase()
      );
      if (!matchingMentor && keepsake.mentorName.trim()) {
        matchingMentor = {
          id: `mp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: keepsake.mentorName.trim(),
          relationship: keepsake.relationship || "Mentor",
          avatarUri: keepsake.photoUri || "",
          description: "",
          meaningfulQuote: keepsake.quote || undefined,
          itemCount: 0,
          latestActivity: "Just now",
          coverColor: "#54000E",
        };
        this.mentors.push(matchingMentor);
      }

      const existingIndex = this.items.findIndex((item) => item.id === keepsake.id);
      const existing = this.items[existingIndex];
      const tribute: WallTribute = {
        kind: "tribute",
        id: keepsake.id,
        mentorId: matchingMentor?.id,
        mentorName: keepsake.mentorName,
        relationship: keepsake.relationship,
        title: keepsake.customTitle || `A Tribute to ${keepsake.mentorName}`,
        photoUri: keepsake.photoUri,
        quote: keepsake.quote,
        story: keepsake.story,
        templateId: keepsake.templateId,
        frameStyle: keepsake.frameStyle,
        typographyStyle: keepsake.typographyStyle,
        createdAt: keepsake.createdAt || new Date().toISOString().split("T")[0],
        isPinned:
          this.pinOverrides.get(keepsake.id) ?? existing?.isPinned ?? false,
        isShared: (existing as WallTribute | undefined)?.isShared ?? false,
      };

      if (existingIndex >= 0) {
        this.items[existingIndex] = tribute;
      } else {
        this.items.unshift(tribute);
      }
    }
    this.updateMentorCounts();
  }

  private updateMentorCounts(): void {
    this.mentors = this.mentors.map((mentor) => {
      const count = this.items.filter(
        (i) =>
          i.mentorId === mentor.id ||
          i.mentorName.trim().toLowerCase() === mentor.name.trim().toLowerCase()
      ).length;
      return {
        ...mentor,
        itemCount: count,
      };
    });
  }

  public getAllMemories(): WallItem[] {
    this.syncKeepsakes();
    return [...this.items];
  }

  public getUserCreatedItems(): WallItem[] {
    return this.items.filter((item) => this.userItemIds.has(item.id));
  }

  public getUserSavedItems(): WallItem[] {
    return this.items.filter(
      (item) =>
        item.isPinned &&
        (this.userItemIds.has(item.id) || this.pinOverrides.get(item.id) === true)
    );
  }

  public getMemoryById(id: string): WallItem | undefined {
    this.syncKeepsakes();
    return this.items.find((i) => i.id === id);
  }

  public getMemoriesByMentor(mentorIdOrName: string): WallItem[] {
    this.syncKeepsakes();
    const target = decodeURIComponent(mentorIdOrName).trim().toLowerCase();
    return this.items.filter(
      (i) =>
        (i.mentorId && i.mentorId.toLowerCase() === target) ||
        i.mentorName.trim().toLowerCase() === target
    );
  }

  public getAllMentorProfiles(): WallMentorProfile[] {
    this.syncKeepsakes();
    return [...this.mentors];
  }

  public getMentorProfileById(id: string): WallMentorProfile | undefined {
    this.syncKeepsakes();
    if (!id) return undefined;
    const cleanId = decodeURIComponent(id).trim().toLowerCase();
    const found =
      this.mentors.find((m) => m.id.toLowerCase() === cleanId) ||
      this.mentors.find((m) => m.name.trim().toLowerCase() === cleanId);

    if (found) return found;

    // If not found by ID or name directly, check if memories exist with this mentorName
    const matchingMemories = this.items.filter(
      (i) => i.mentorName.trim().toLowerCase() === cleanId
    );
    if (matchingMemories.length > 0) {
      const first = matchingMemories[0];
      let photo = "";
      if ("photoUri" in first && first.photoUri) photo = first.photoUri;
      else if ("imageUri" in first && first.imageUri) photo = first.imageUri;

      const dynamicProfile: WallMentorProfile = {
        id: `mp_${cleanId.replace(/\s+/g, "_")}`,
        name: first.mentorName,
        relationship: first.relationship || "Mentor",
        avatarUri: photo,
        description: "",
        meaningfulQuote: "quote" in first && first.quote ? first.quote : undefined,
        itemCount: matchingMemories.length,
        latestActivity: "Recently",
        coverColor: "#54000E",
      };
      this.mentors.push(dynamicProfile);
      matchingMemories.forEach((m) => {
        m.mentorId = dynamicProfile.id;
      });
      return dynamicProfile;
    }

    return undefined;
  }

  public updateMemory(updatedItem: WallItem): void {
    if (
      updatedItem.kind === "tribute" &&
      tributeDraftService.updateSavedKeepsake(updatedItem.id, {
        customTitle: updatedItem.title,
        story: updatedItem.story || "",
        quote: updatedItem.quote,
      })
    ) {
      return;
    }
    const idx = this.items.findIndex((i) => i.id === updatedItem.id);
    if (idx >= 0) {
      this.items[idx] = updatedItem;
      this.updateMentorCounts();
      this.notify();
      if (this.userItemIds.has(updatedItem.id)) this.persistUserItems();
    }
  }

  public deleteMemory(id: string): boolean {
    const existing = this.items.find((item) => item.id === id);
    if (existing?.kind === "tribute") {
      tributeDraftService.removeSavedKeepsake(id);
    }
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    this.userItemIds.delete(id);
    this.pinOverrides.delete(id);
    if (this.items.length !== initialLen) {
      this.updateMentorCounts();
      this.notify();
      this.persistUserItems();
      api.tributes.delete(id).catch(() => {});
      return true;
    }
    return false;
  }

  public togglePin(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.isPinned = !item.isPinned;
      this.pinOverrides.set(id, item.isPinned);
      this.notify();
      this.persistUserItems();
      api.tributes.togglePin(id).catch(() => {});
    }
  }

  public addMemory(item: WallItem): string {
    const existingIndex = this.items.findIndex((saved) => saved.id === item.id);
    const mentor =
      this.mentors.find((profile) => profile.name.toLowerCase() === item.mentorName.toLowerCase()) ??
      (item.mentorName.trim()
        ? {
            id: `mp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: item.mentorName.trim(),
            relationship: item.relationship || "Mentor",
            avatarUri:
              ("photoUri" in item && item.photoUri) ||
              ("imageUri" in item && item.imageUri) ||
              "",
            description: "",
            itemCount: 0,
            latestActivity: "Just now",
            coverColor: "#54000E",
          }
        : undefined);
    if (mentor && !this.mentors.some((profile) => profile.id === mentor.id)) {
      this.mentors.push(mentor);
    }
    const newItem = { ...item, mentorId: item.mentorId || mentor?.id } as WallItem;
    if (existingIndex >= 0) {
      this.items[existingIndex] = newItem;
    } else {
      this.items.unshift(newItem);
    }
    this.userItemIds.add(newItem.id);
    this.updateMentorCounts();
    this.notify();
    this.persistUserItems();

    // Asynchronously synchronize to Spring Boot + Neon DB backend
    api.tributes
      .create({
        mentorName: newItem.mentorName,
        kind: newItem.kind,
        title: "title" in newItem ? newItem.title : ("lessonTitle" in newItem ? (newItem as any).lessonTitle : newItem.mentorName),
        relationship: newItem.relationship || "Mentor",
        photoUri: "photoUri" in newItem ? (newItem as any).photoUri : ("imageUri" in newItem ? (newItem as any).imageUri : ""),
        quote: "quote" in newItem ? (newItem as any).quote : "",
        story: "story" in newItem ? (newItem as any).story : ("excerpt" in newItem ? (newItem as any).excerpt : ""),
        excerpt: "excerpt" in newItem ? (newItem as any).excerpt : "",
        lessonCarried: "lessonCarried" in newItem ? (newItem as any).lessonCarried : "",
        momentToRemember: "momentToRemember" in newItem ? (newItem as any).momentToRemember : "",
        privacy: "PUBLIC",
        isPinned: newItem.isPinned || false,
      })
      .catch((err) => {
        console.debug("Backend tribute sync queued/offline:", err);
      });

    return newItem.id;
  }

  public addMentor(input: {
    name: string;
    relationship: string;
    description?: string;
    meaningfulQuote?: string;
  }): WallMentorProfile {
    const name = input.name.trim();
    const existing = this.mentors.find(
      (mentor) => mentor.name.trim().toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing;

    const mentor: WallMentorProfile = {
      id: `mp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      relationship: input.relationship.trim() || "Mentor",
      avatarUri: "",
      description: input.description?.trim() || "",
      meaningfulQuote: input.meaningfulQuote?.trim() || undefined,
      itemCount: 0,
      latestActivity: "Just added",
      coverColor: "#54000E",
    };
    this.mentors.unshift(mentor);
    this.notify();

    // Asynchronously synchronize to Spring Boot backend + Neon DB
    api.mentors
      .create({
        name: mentor.name,
        relationship: mentor.relationship,
        quote: mentor.meaningfulQuote,
        category: "school",
      })
      .then((res) => {
        if (res?.data?.id) {
          mentor.id = res.data.id;
        }
      })
      .catch((err) => {
        console.debug("Backend mentor sync error:", err);
      });

    return { ...mentor };
  }

  public updateMentorProfile(
    updated: Partial<WallMentorProfile> & { id: string }
  ): void {
    const idx = this.mentors.findIndex((m) => m.id === updated.id);
    if (idx >= 0) {
      const oldName = this.mentors[idx].name;
      this.mentors[idx] = { ...this.mentors[idx], ...updated };
      // Sync mentorName and relationship across all associated memories
      if (updated.name && updated.name !== oldName) {
        this.items.forEach((item) => {
          if (
            item.mentorId === updated.id ||
            item.mentorName.trim().toLowerCase() === oldName.trim().toLowerCase()
          ) {
            item.mentorName = updated.name!;
            if (updated.relationship) {
              item.relationship = updated.relationship;
            }
          }
        });
      }
      if (updated.name || updated.relationship) {
        tributeDraftService.updateMentorReferences(
          oldName,
          updated.name || oldName,
          updated.relationship && isTributeRelationship(updated.relationship)
            ? updated.relationship
            : undefined
        );
      }
      this.updateMentorCounts();
      this.notify();
    }
  }

  private persistUserItems(): void {
    const userItems = this.items.filter((item) => this.userItemIds.has(item.id));
    const serialized = JSON.stringify({
      items: userItems,
      pinOverrides: Object.fromEntries(this.pinOverrides),
    });
    this.persistenceQueue = this.persistenceQueue
      .catch(() => undefined)
      .then(() =>
        AsyncStorage.setItem("@honour-your-mentor/memories", serialized)
      )
      .catch((error: unknown) => {
        console.error("Unable to persist memories:", error);
      });
  }

  private loadUserItems(userItems: WallItem[]): void {
    this.userItemIds = new Set(userItems.map((item) => item.id));
    for (const item of userItems) {
      const index = this.items.findIndex((saved) => saved.id === item.id);
      if (index >= 0) this.items[index] = item;
      else this.items.unshift(item);
    }
  }
}

function isStoredWallItem(value: unknown): value is WallItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<WallItem>;
  return (
    typeof item.id === "string" &&
    typeof item.mentorName === "string" &&
    typeof item.createdAt === "string" &&
    ["tribute", "memory", "letter", "lesson", "milestone"].includes(
      String(item.kind)
    )
  );
}

export const memoryService = new MemoryService();
