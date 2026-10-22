import { WALL_ITEMS, WALL_MENTOR_PROFILES } from "@/data/memoryWallData";
import { tributeDraftService } from "./tributeDraftService";
import { WallItem, WallMentorProfile, WallTribute } from "@/types/memoryWall";
import type { TributeRelationship } from "@/types/create";

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

class MemoryService {
  private items: WallItem[] = [...WALL_ITEMS];
  private mentors: WallMentorProfile[] = [...WALL_MENTOR_PROFILES];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.syncKeepsakes();
    tributeDraftService.subscribe(() => {
      this.syncKeepsakes();
      this.notify();
    });
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
        isPinned: existing?.isPinned ?? false,
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
    }
  }

  public deleteMemory(id: string): boolean {
    const existing = this.items.find((item) => item.id === id);
    if (existing?.kind === "tribute") {
      tributeDraftService.removeSavedKeepsake(id);
    }
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
    this.updateMentorCounts();
    this.notify();
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
}

export const memoryService = new MemoryService();
