import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const ensuredUserIdRef = useRef<string | null>(null);

  const ensureUserRecords = async (u: User) => {
    if (!u?.id) return;
    if (ensuredUserIdRef.current === u.id) return;

    ensuredUserIdRef.current = u.id;

    try {
      console.log("[Auth] Ensuring profiles rows exist for user", u.id);

      // Ensure public profile exists
      const { data: existingProfile, error: profileSelectError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", u.id)
        .maybeSingle();

      if (profileSelectError) throw profileSelectError;

      if (!existingProfile) {
        const { error: profileInsertError } = await supabase.from("profiles").insert({
          user_id: u.id,
          full_name: (u.user_metadata as { full_name?: string } | null)?.full_name ?? null,
        });
        if (profileInsertError) throw profileInsertError;
      }

      // Ensure private profile exists (for settings page + future features)
      const { data: existingPrivate, error: privateSelectError } = await supabase
        .from("profiles_private")
        .select("id")
        .eq("user_id", u.id)
        .maybeSingle();

      if (privateSelectError) throw privateSelectError;

      if (!existingPrivate) {
        const { error: privateInsertError } = await supabase.from("profiles_private").insert({
          user_id: u.id,
          email: u.email ?? null,
        });
        if (privateInsertError) throw privateInsertError;
      }

      console.log("[Auth] Profiles ensured for user", u.id);
    } catch (e) {
      // Keep silent for users; this is a background safety net.
      console.error("[Auth] Failed to ensure user records", e);
      // Allow retry later
      ensuredUserIdRef.current = null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        void ensureUserRecords(session.user);
      } else {
        ensuredUserIdRef.current = null;
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        void ensureUserRecords(session.user);
      } else {
        ensuredUserIdRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: { first_name?: string; last_name?: string }) => {
    const redirectUrl = `${window.location.origin}/`;

    const fullName = [metadata?.first_name, metadata?.last_name].filter(Boolean).join(" ") || null;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: metadata?.first_name || null,
          last_name: metadata?.last_name || null,
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    ensuredUserIdRef.current = null;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
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

