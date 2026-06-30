import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  fetchNerveProfile,
  fetchModuleAccess,
  type NerveUserProfile,
  type NerveModuleAccess,
  type NerveModule,
} from "@/lib/nerveAccess";

export interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
  focus_areas: string[] | null;
  location: string | null;
  linkedin_url: string | null;
  visibility: string | null;
  show_snags: boolean | null;
  allow_connections: boolean | null;
  discoverable: boolean | null;
  preferences: Json;
  subscription_tier: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  subscription_ends_at: string | null;
  lifetime_deep_snags_used: number | null;
  lifetime_post_mortems_used: number | null;
  lifetime_frameworks_used: number | null;
  trial_start_date: string | null;
  trial_expired: boolean | null;
  deep_snags_used: number | null;
  retros_used: number | null;
  waitlist_joined: boolean | null;
  waitlist_joined_at: string | null;
  discount_code: string | null;
  user_type: string | null;
  date_of_birth: string | null;
  birth_time: string | null;
  birth_place: string | null;
  hobbies: string[] | null;
  interests: string[] | null;
  life_goals: string[] | null;
  zodiac_western: string | null;
  zodiac_chinese: string | null;
  zodiac_vedic: string | null;
  life_path_number: number | null;
  profile_completed: boolean | null;
}

export type ProfileUpdates = Partial<Omit<Profile, "id" | "user_id" | "preferences">>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  // Nerve unified access
  nerveProfile: NerveUserProfile | null;
  moduleAccess: NerveModuleAccess[];
  isAdmin: boolean;
  hasModuleAccess: (module: NerveModule) => boolean;
  moduleStatus: (module: NerveModule) => NerveModuleAccess["status"] | null;
  refreshNerveAccess: () => Promise<void>;
  isLoading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
    userType?: string,
    teamName?: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: ProfileUpdates) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nerveProfile, setNerveProfile] = useState<NerveUserProfile | null>(null);
  const [moduleAccess, setModuleAccess] = useState<NerveModuleAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  };

  const loadNerve = useCallback(async (userId: string, authUser?: User | null) => {
    const [np, ma] = await Promise.all([fetchNerveProfile(userId), fetchModuleAccess(userId)]);
    setNerveProfile(np);
    setModuleAccess(ma);

    // Fire-and-forget: notify admin once after email-confirmed signup,
    // even if the user never reaches the intake form.
    if (np && !np.signup_notified_at && authUser?.email_confirmed_at) {
      supabase.functions
        .invoke("nerve-admin-notification", {
          body: { trigger: "signup", user_id: userId },
        })
        .catch((err) => console.warn("nerve-admin-notification (signup) failed", err));
    }
  }, []);

  const refreshNerveAccess = useCallback(async () => {
    if (user) await loadNerve(user.id, user);
  }, [user, loadNerve]);

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          loadNerve(session.user.id, session.user);
        }, 0);
      } else {
        setProfile(null);
        setNerveProfile(null);
        setModuleAccess([]);
      }

      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
        loadNerve(session.user.id, session.user);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadNerve]);

  const signUp = async (
    email: string,
    password: string,
    displayName?: string,
    userType?: string,
    teamName?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
          full_name: displayName,
          company_name: teamName,
          user_type: userType || "individual",
          pending_team_name: userType === "business" ? teamName : undefined,
        },
      },
    });

    if (!error && data.user) {
      setTimeout(async () => {
        await supabase
          .from("profiles")
          .update({ user_type: userType || "individual" })
          .eq("user_id", data.user!.id);
      }, 500);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setNerveProfile(null);
    setModuleAccess([]);
  };

  const updateProfile = async (updates: ProfileUpdates) => {
    if (!user) return { error: new Error("Not authenticated") };
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    if (!error) setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    return { error };
  };

  const hasModuleAccess = (module: NerveModule) =>
    moduleAccess.some((m) => m.module === module && (m.status === "active" || m.status === "trial"));

  const moduleStatus = (module: NerveModule) =>
    moduleAccess.find((m) => m.module === module)?.status ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        nerveProfile,
        moduleAccess,
        isAdmin: !!nerveProfile?.is_admin,
        hasModuleAccess,
        moduleStatus,
        refreshNerveAccess,
        isLoading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
