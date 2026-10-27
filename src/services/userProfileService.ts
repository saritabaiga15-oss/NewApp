import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  bio: string;
  avatarUri: string;
}

const PROFILE_STORAGE_KEY = "@honour-your-mentor/profile";

const DEFAULT_PROFILE: UserProfile = {
  name: "Sarita Baiga",
  username: "saritabaiga",
  email: "sarita@example.com",
  bio: "Remembering the people who helped me grow.",
  avatarUri:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
};

let profile: UserProfile = { ...DEFAULT_PROFILE };
let initializePromise: Promise<UserProfile> | null = null;
const listeners = new Set<(nextProfile: UserProfile) => void>();

export const userProfileService = {
  getProfile(): UserProfile {
    return { ...profile };
  },

  initialize(): Promise<UserProfile> {
    if (!initializePromise) {
      initializePromise = AsyncStorage.getItem(PROFILE_STORAGE_KEY)
        .then((stored) => {
          if (!stored) return this.getProfile();
          const parsed: unknown = JSON.parse(stored);
          if (!isUserProfile(parsed)) {
            throw new Error("The saved profile data is invalid.");
          }
          profile = parsed;
          const nextProfile = this.getProfile();
          listeners.forEach((listener) => listener(nextProfile));
          return nextProfile;
        })
        .catch((error: unknown) => {
          initializePromise = null;
          throw error;
        });
    }
    return initializePromise;
  },

  async updateProfile(updates: Pick<UserProfile, "name" | "username" | "email" | "bio" | "avatarUri">): Promise<UserProfile> {
    const nextProfile: UserProfile = {
      name: updates.name.trim(),
      username: updates.username.trim().replace(/^@/, ""),
      email: updates.email.trim(),
      bio: updates.bio.trim(),
      avatarUri: updates.avatarUri.trim(),
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
