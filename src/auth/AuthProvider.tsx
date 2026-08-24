import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/domain';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const friendlyAuthError = (message: string): string => {
  if (message.toLowerCase().includes('invalid login credentials')) return 'The email or password is not correct.';
  if (message.toLowerCase().includes('already registered')) return 'An account with this email already exists.';
  if (message.toLowerCase().includes('password')) return 'Use a password with at least six characters.';
  return 'We could not complete that request. Please try again.';
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProfile = async (user: User | null) => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, region_id, district_name, is_active')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Profile lookup failed', error);
      setAuthError('We could not load your access profile.');
      return;
    }

    setProfile(data as Profile | null);
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      void loadProfile(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      void (async () => {
        await loadProfile(nextSession?.user ?? null);
        if (mounted) setLoading(false);
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    authError,
    signIn: async (email, password) => {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const message = friendlyAuthError(error.message);
        setAuthError(message);
        return { error: message };
      }
      return { error: null };
    },
    signUp: async (name, email, password) => {
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        const message = friendlyAuthError(error.message);
        setAuthError(message);
        return { error: message };
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: name,
          email,
          role: 'viewer',
        });
        if (profileError) {
          console.error('Profile creation failed', profileError);
          return { error: 'Your account was created, but we could not finish your access profile.' };
        }
      }
      return { error: null };
    },
    signOut: async () => {
      await supabase.auth.signOut();
      setProfile(null);
    },
  }), [authError, loading, profile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
