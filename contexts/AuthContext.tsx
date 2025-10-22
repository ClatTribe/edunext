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
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role if session exists
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
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
      // Check if user exists in profiles (student)
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (studentProfile) {
        setUserRole('student');
        return;
      }

      // Check if user exists in mentor_profiles
      const { data: mentorProfile } = await supabase
        .from('mentor_profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (mentorProfile) {
        setUserRole('mentor');
        return;
      }

      setUserRole(null);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'mentor') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (!error && data.user) {
      // Insert user profile based on role
      const profileData = {
        id: data.user.id,
        full_name: fullName,
        email: email,
      };

      if (role === 'student') {
        await supabase.from('profiles').insert(profileData);
      } else {
        await supabase.from('mentor_profiles').insert(profileData);
      }
      
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
      const table = role === 'student' ? 'profiles' : 'mentor_profiles';
      const { data: profile } = await supabase
        .from(table)
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        return { error: { message: `This account is not registered as a ${role}. Please select the correct role.` } };
      }

      setUserRole(role);
    }

    return { error };
  };

  const signInWithGoogle = async (role: 'student' | 'mentor') => {
    // Store role in localStorage temporarily for callback
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingUserRole', role);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
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