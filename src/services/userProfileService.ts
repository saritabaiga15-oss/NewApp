import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getAuthToken } from "./api";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUri: string;
}

const PROFILE_STORAGE_KEY = "@honour-your-mentor/profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "Mentee",
  username: "mentee",
  email: "",
  bio: "Remembering the mentors and guides who shaped my life.",
  avatarUri:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
};

let profile: UserProfile = { ...DEFAULT_PROFILE };
let initializePromise: Promise<UserProfile> | null = null;
const listeners = new Set<(nextProfile: UserProfile) => void>();

export const userProfileService = {
  getProfile(): UserProfile {
    return { ...profile };
  },

  async initialize(): Promise<UserProfile> {
    if (!initializePromise) {
      initializePromise = (async () => {
        try {
          const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
          if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (isUserProfile(parsed)) {
              // Discard old hardcoded "Sarita Baiga" placeholder if present
              if (parsed.name === "Sarita Baiga" || parsed.email === "sarita@example.com") {
                await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
              } else {
                profile = parsed;
              }
            }
          }
        } catch (error) {
          console.warn("Failed reading local profile cache:", error);
        }

        // Attempt background sync with backend if user has an active session
        try {
          const token = await getAuthToken();
          if (token) {
            await this.syncWithBackend();
          }
        } catch {
          // Non-blocking sync failure
        }

        const nextProfile = this.getProfile();
        listeners.forEach((listener) => listener(nextProfile));
        return nextProfile;
      })();
    }
    return initializePromise;
  },

  async syncWithBackend(): Promise<UserProfile | null> {
    try {
      const res = await api.auth.me();
      if (res?.data) {
        const u = res.data;
        const synced: UserProfile = {
          name: u.name || profile.name || "Mentee",
          username: u.username || u.email?.split("@")[0] || profile.username || "mentee",
          email: u.email || profile.email || "",
          bio: u.bio || profile.bio || "Remembering the mentors and guides who shaped my life.",
          avatarUri: u.avatarUri || profile.avatarUri || DEFAULT_PROFILE.avatarUri,
        };
        await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(synced));
        profile = synced;
        const publishedProfile = this.getProfile();
        listeners.forEach((listener) => listener(publishedProfile));
        return publishedProfile;
      }
    } catch {
      // Offline or unauthenticated
    }
    return null;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const nextProfile: UserProfile = {
      name: (updates.name !== undefined ? updates.name : profile.name).trim() || "Mentee",
      username: (updates.username !== undefined ? updates.username : profile.username).trim().replace(/^@/, ""),
      email: (updates.email !== undefined ? updates.email : profile.email).trim(),
      bio: (updates.bio !== undefined ? updates.bio : profile.bio).trim(),
      avatarUri: (updates.avatarUri !== undefined ? updates.avatarUri : profile.avatarUri).trim(),
    };
    await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    profile = nextProfile;
    const publishedProfile = this.getProfile();
    listeners.forEach((listener) => listener(publishedProfile));
    return publishedProfile;
  },

  subscribe(listener: (nextProfile: UserProfile) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

function isUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.username === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.bio === "string" &&
    typeof candidate.avatarUri === "string"
  );
}
