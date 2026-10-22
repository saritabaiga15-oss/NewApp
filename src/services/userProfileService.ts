export interface UserProfile {
  name: string;
  email: string;
  avatarUri: string;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Sarita Baiga",
  email: "sarita@example.com",
  avatarUri:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
};

let profile: UserProfile = { ...DEFAULT_PROFILE };
const listeners = new Set<(nextProfile: UserProfile) => void>();

export const userProfileService = {
  getProfile(): UserProfile {
    return { ...profile };
  },

  updateProfile(updates: Pick<UserProfile, "name" | "email">): UserProfile {
    profile = {
      ...profile,
      name: updates.name.trim(),
      email: updates.email.trim(),
    };
    const nextProfile = { ...profile };
    listeners.forEach((listener) => listener(nextProfile));
    return nextProfile;
  },

  subscribe(listener: (nextProfile: UserProfile) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
