"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ContactButton from "../../components/ContactButton";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useMemo } from "react";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading} = useAuth();
  const username = useMemo(() => {
      return user?.user_metadata?.full_name?.split(' ')[0] || 
             user?.email?.split('@')[0] || 
             'User';
    }, [ user]);
const logout = async () => {
      const { error } = await supabase.auth.signOut();
      if (error) console.log(error);
    };
    

  // Color scheme matching the Sidebar and Dashboard
  const accentColor = '#6366f1'; // Indigo accent
  const primaryBg = '#0a0f1e'; // Very dark navy blue
  const secondaryBg = '#111827'; // Slightly lighter navy

  if (authLoading) {
    return (
      <div className="flex h-screen" style={{ backgroundColor: primaryBg }}>
        <div 
          className="w-64 border-r"
          style={{ 
            background: `linear-gradient(to bottom, ${primaryBg}, ${secondaryBg})`,
            borderColor: 'rgba(99, 102, 241, 0.15)'
          }}
        ></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2" style={{ color: accentColor }}>
            <div 
              className="animate-spin rounded-full h-6 w-6 border-b-2"
              style={{ borderColor: accentColor }}
            ></div>
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: primaryBg }}
    >
      <Sidebar userName={username ?? "User"} onSignOut={logout} />
      <div 
        className="flex-1 overflow-auto"
        style={{ backgroundColor: primaryBg }}
      >
        {children}
      </div>
      <ContactButton />
    </div>
  );
}