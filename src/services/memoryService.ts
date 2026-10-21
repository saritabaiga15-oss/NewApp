import { WALL_ITEMS, WALL_MENTOR_PROFILES } from "@/data/memoryWallData";
import { tributeDraftService } from "./tributeDraftService";
import { WallItem, WallMentorProfile, WallTribute } from "@/types/memoryWall";

type Listener = () => void;

class MemoryService {
  private items: WallItem[] = [...WALL_ITEMS];
  private mentors: WallMentorProfile[] = [...WALL_MENTOR_PROFILES];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.syncKeepsakes();
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
      const existing = this.items.find((i) => i.id === keepsake.id);
      if (!existing) {
        const matchingMentor = this.mentors.find(
          (m) => m.name.toLowerCase() === keepsake.mentorName.toLowerCase()
        );
        const newTribute: WallTribute = {
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
          isPinned: false,
          isShared: false,
        };
        this.items.unshift(newTribute);
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

  public getMemoryById(id: string): WallItem | undefined {
    this.syncKeepsakes();
    return this.items.find((i) => i.id === id);
  }

  public getMemoriesByMentor(mentorIdOrName: string): WallItem[] {
    this.syncKeepsakes();
    const target = mentorIdOrName.trim().toLowerCase();
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
    return (
      this.mentors.find((m) => m.id === id) ||
      this.mentors.find((m) => m.name.trim().toLowerCase() === id.trim().toLowerCase())
    );
  }

  public updateMemory(updatedItem: WallItem): void {
    const idx = this.items.findIndex((i) => i.id === updatedItem.id);
    if (idx >= 0) {
      this.items[idx] = updatedItem;
      this.updateMentorCounts();
      this.notify();
    }
  }

  public deleteMemory(id: string): boolean {
    const initialLen = this.items.length;
    this.items = this.items.filter((i) => i.id !== id);
    if (this.items.length !== initialLen) {
      this.updateMentorCounts();
      this.notify();
      return true;
    }
    return false;
  }

  public togglePin(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.isPinned = !item.isPinned;
      this.notify();
    }
  }

  public updateMentorProfile(
    updated: Partial<WallMentorProfile> & { id: string }
  ): void {
    const idx = this.mentors.findIndex((m) => m.id === updated.id);
    if (idx >= 0) {
      this.mentors[idx] = { ...this.mentors[idx], ...updated };
      this.notify();
    }
  }
}

export const memoryService = new MemoryService();
