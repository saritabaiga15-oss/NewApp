import { TributeDesignState, TributePayload } from "@/types/create";

let currentPayload: TributePayload | null = null;
let currentDesignState: TributeDesignState | null = null;
const savedKeepsakes: TributeDesignState[] = [];

export const tributeDraftService = {
  // Input payload from Create Tribute Details
  setPayload(payload: TributePayload) {
    currentPayload = payload;
  },

  getPayload(): TributePayload | null {
    return currentPayload;
  },

  clearPayload() {
    currentPayload = null;
  },

  // Active design state in Tribute Design Studio & Preview
  setDesignState(design: TributeDesignState) {
    currentDesignState = design;
  },

  getDesignState(): TributeDesignState | null {
    return currentDesignState;
  },

  // Completed & Saved Keepsakes
  saveCompletedTribute(tribute: TributeDesignState) {
    const existingIndex = savedKeepsakes.findIndex((k) => k.id === tribute.id);
    if (existingIndex >= 0) {
      savedKeepsakes[existingIndex] = tribute;
    } else {
      savedKeepsakes.unshift(tribute);
    }
  },

  getSavedKeepsakes(): TributeDesignState[] {
    return [...savedKeepsakes];
  },
};
