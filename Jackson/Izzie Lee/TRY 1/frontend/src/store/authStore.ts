import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SocialAccount {
  platform: "instagram" | "snapchat";
  username: string;
  connectedAt: string;
  mutualCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  location: string;
  bio: string;
  university: string;
  year: string;
  gender: string;
  greekOrg: string;
  clubs: string;
  openToHosting: boolean;
  socials: SocialAccount[];
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  connectSocial: (account: SocialAccount) => void;
  disconnectSocial: (platform: "instagram" | "snapchat") => void;
  setAvatar: (url: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user: null,
      isLoggedIn: false,

      login: async (email, _password) => {
        // Mock auth — swap with Supabase auth in production
        await new Promise((r) => setTimeout(r, 800));
        set({
          isLoggedIn: true,
          user: {
            id: "demo-" + Date.now(),
            name: email.split("@")[0],
            email,
            avatarUrl: null,
            location: "",
            bio: "",
            university: "",
            year: "",
            gender: "",
            greekOrg: "",
            clubs: "",
            openToHosting: false,
            socials: [],
          },
        });
      },

      signup: async (name, email, _password) => {
        await new Promise((r) => setTimeout(r, 1000));
        set({
          isLoggedIn: true,
          user: {
            id: "demo-" + Date.now(),
            name,
            email,
            avatarUrl: null,
            location: "",
            bio: "",
            university: "",
            year: "",
            gender: "",
            greekOrg: "",
            clubs: "",
            openToHosting: false,
            socials: [],
          },
        });
      },

      logout: () => set({ user: null, isLoggedIn: false }),

      updateProfile: (updates) =>
        set((s) => ({
          user: s.user ? { ...s.user, ...updates } : null,
        })),

      connectSocial: (account) =>
        set((s) => {
          if (!s.user) return s;
          const filtered = s.user.socials.filter(
            (x) => x.platform !== account.platform
          );
          return { user: { ...s.user, socials: [...filtered, account] } };
        }),

      disconnectSocial: (platform) =>
        set((s) => {
          if (!s.user) return s;
          return {
            user: {
              ...s.user,
              socials: s.user.socials.filter((x) => x.platform !== platform),
            },
          };
        }),

      setAvatar: (url) =>
        set((s) => ({
          user: s.user ? { ...s.user, avatarUrl: url } : null,
        })),
    }),
    { name: "crashly-auth" }
  )
);