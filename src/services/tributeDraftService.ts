import {
  TributeDesignState,
  TributeDraft,
  TributePayload,
  TributeRelationship,
} from "@/types/create";

let currentPayload: TributePayload | null = null;
let currentDesignState: TributeDesignState | null = null;
const savedKeepsakes: TributeDesignState[] = [];
const tributeDrafts: TributeDraft[] = [];
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const copyDesign = (design: TributeDesignState): TributeDesignState => ({
  ...design,
  decorations: [...design.decorations],
});

export const tributeDraftService = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Input payload from Create Tribute Details
  setPayload(payload: TributePayload) {
    currentPayload = { ...payload };
  },

  getPayload(): TributePayload | null {
    return currentPayload;
  },

  clearPayload() {
    currentPayload = null;
  },

  // Active design state in Tribute Design Studio & Preview
  setDesignState(design: TributeDesignState) {
    currentDesignState = copyDesign(design);
  },

  getDesignState(): TributeDesignState | null {
    return currentDesignState;
  },

  // Completed & Saved Keepsakes
  saveCompletedTribute(tribute: TributeDesignState) {
    const existingIndex = savedKeepsakes.findIndex((k) => k.id === tribute.id);
    if (existingIndex >= 0) {
      savedKeepsakes[existingIndex] = copyDesign(tribute);
    } else {
      savedKeepsakes.unshift(copyDesign(tribute));
    }
    const draftIndex = tributeDrafts.findIndex((draft) => draft.id === tribute.id);
    if (draftIndex >= 0) tributeDrafts.splice(draftIndex, 1);
    notify();
  },

  getSavedKeepsakes(): TributeDesignState[] {
    return savedKeepsakes.map(copyDesign);
  },

  getSavedKeepsakeById(id: string): TributeDesignState | undefined {
    const keepsake = savedKeepsakes.find((item) => item.id === id);
    return keepsake ? copyDesign(keepsake) : undefined;
  },

  updateSavedKeepsake(
    id: string,
    updates: Partial<Pick<TributeDesignState, "customTitle" | "story" | "quote">>
  ): boolean {
    const index = savedKeepsakes.findIndex((item) => item.id === id);
    if (index < 0) return false;
    savedKeepsakes[index] = { ...savedKeepsakes[index], ...updates };
    notify();
    return true;
  },

  updateMentorReferences(
    previousName: string,
    name: string,
    relationship?: TributeRelationship
  ): void {
    const previous = previousName.trim().toLowerCase();
    let changed = false;
    const updatePayload = (payload: TributePayload): TributePayload => {
      if (payload.mentorName.trim().toLowerCase() !== previous) return payload;
      changed = true;
      return {
        ...payload,
        mentorName: name,
        relationship: relationship || payload.relationship,
      };
    };
    const updateDesign = (
      design: TributeDesignState | null
    ): TributeDesignState | null => {
      if (!design || design.mentorName.trim().toLowerCase() !== previous) return design;
      changed = true;
      return {
        ...design,
        mentorName: name,
        relationship: relationship || design.relationship,
      };
    };

    if (currentPayload) currentPayload = updatePayload(currentPayload);
    if (currentDesignState) currentDesignState = updateDesign(currentDesignState);
    for (const keepsake of savedKeepsakes) {
      const updated = updateDesign(keepsake);
      if (updated) Object.assign(keepsake, updated);
    }
    for (const draft of tributeDrafts) {
      draft.payload = updatePayload(draft.payload);
      draft.designState = updateDesign(draft.designState);
    }
    if (changed) notify();
  },

  removeSavedKeepsake(id: string): boolean {
    const index = savedKeepsakes.findIndex((item) => item.id === id);
    if (index < 0) return false;
    savedKeepsakes.splice(index, 1);
    notify();
    return true;
  },

  saveDraft(payload: TributePayload, designState?: TributeDesignState | null): TributeDraft {
    const draft: TributeDraft = {
      id: payload.id,
      payload: { ...payload },
      designState: designState ? copyDesign(designState) : null,
      updatedAt: new Date().toISOString(),
    };
    const index = tributeDrafts.findIndex((item) => item.id === draft.id);
    if (index >= 0) {
      tributeDrafts[index] = draft;
    } else {
      tributeDrafts.unshift(draft);
    }
    notify();
    return { ...draft, payload: { ...draft.payload } };
  },

  getDrafts(): TributeDraft[] {
    return tributeDrafts.map((draft) => ({
      ...draft,
      payload: { ...draft.payload },
      designState: draft.designState ? copyDesign(draft.designState) : null,
    }));
  },

  getDraftById(id: string): TributeDraft | undefined {
    const draft = tributeDrafts.find((item) => item.id === id);
    return draft
      ? {
          ...draft,
          payload: { ...draft.payload },
          designState: draft.designState ? copyDesign(draft.designState) : null,
        }
      : undefined;
  },

  removeDraft(id: string): boolean {
    const index = tributeDrafts.findIndex((item) => item.id === id);
    if (index < 0) return false;
    tributeDrafts.splice(index, 1);
    notify();
    return true;
  },
};
