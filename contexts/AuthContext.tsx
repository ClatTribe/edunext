"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Check mentor_profiles first
      const { data: mentorProfile } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (mentorProfile) {
        setUserRole('mentor');
        return;
      }

      // Check profiles (student)
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (studentProfile) {
        setUserRole('student');
        return;
      }

      setUserRole(null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'mentor') => {
    // The database trigger will handle profile creation automatically
    // We just pass the role in metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role, // This is used by the database trigger
        },
      },
    });

    if (!error && data.user) {
      setUserRole(role);
    }

    return { error };
  };

  const signIn = async (email: string, password: string, role: 'student' | 'mentor') => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      // Verify user has the correct role
      const table = role === 'mentor' ? 'mentor_profiles' : 'profiles';
      const { data: profile } = await supabase
        .from(table)
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.auth.signOut();
        return { 
          error: { 
            message: `This account is not registered as a ${role}. Please select the correct role.` 
          } 
        };
      }

      setUserRole(role);
    }

    return { error };
  };

  const signInWithGoogle = async (role: 'student' | 'mentor') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingUserRole', role);
      console.log('✅ Stored role:', role);
    }

    const redirectURL = `${window.location.origin}/auth/callback`;
    console.log('🔗 Redirect URL:', redirectURL);

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
      localStorage.removeItem('pendingUserRole');
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signUp, signIn, signInWithGoogle, signOut }}>
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