"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: 'student' | 'mentor' | null;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'mentor') => Promise<{ error: any }>;
  signIn: (email: string, password: string, role: 'student' | 'mentor') => Promise<{ error: any }>;
  signInWithGoogle: (role: 'student' | 'mentor') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'mentor' | null>(null);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      // Check mentor_profiles first
      const { data: mentorProfile, error: mentorError } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (mentorError && mentorError.code !== 'PGRST116') {
        console.error('Error checking mentor profile:', mentorError);
      }

      if (mentorProfile) {
        setUserRole('mentor');
        return;
      }

      // Check profiles (student)
      const { data: studentProfile, error: studentError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (studentError && studentError.code !== 'PGRST116') {
        console.error('Error checking student profile:', studentError);
      }

      if (studentProfile) {
        setUserRole('student');
        return;
      }

      console.warn('No profile found for user:', userId);
      setUserRole(null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    // Initialize session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen to auth changes (with proper typings)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔐 Auth state changed:', event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'mentor') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      if (data.user) {
        setUserRole(role);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign up exception:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string, role: 'student' | 'mentor') => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.user) {
        const table = role === 'mentor' ? 'mentor_profiles' : 'profiles';
        const { data: profile, error: profileError } = await supabase
          .from(table)
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
        }

        if (!profile) {
          await supabase.auth.signOut();
          return {
            error: {
              message: `This account is not registered as a ${role}. Please select the correct role.`,
            },
          };
        }

        setUserRole(role);
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in exception:', error);
      return { error };
    }
  };

  const signInWithGoogle = async (role: 'student' | 'mentor') => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingUserRole', role);
        console.log('✅ Stored role in localStorage:', role);
      }

      const redirectURL =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`;

      console.log('🔗 OAuth Redirect URL:', redirectURL);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectURL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google sign-in error:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingUserRole');
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Google sign-in exception:', error);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingUserRole');
      }
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserRole(null);
      setUser(null);
      setSession(null);

      if (typeof window !== 'undefined') {
        localStorage.removeItem('pendingUserRole');
      }

      console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        userRole,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
