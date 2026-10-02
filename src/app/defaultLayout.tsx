"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import ContactButton from "../../components/ContactButton";
import { useAuth } from "../../contexts/AuthContext";
import { useMemo } from "react";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const username = useMemo(() => {
      return user?.user_metadata?.full_name?.split(' ')[0] ||
             user?.email?.split('@')[0] ||
             'User';
    }, [ user]);
    

  // Color scheme matching the Sidebar and Dashboard
  const primaryBg = '#0a0f1e'; // Very dark navy blue

  // SEO: never replace page content with a spinner while auth resolves.
  // The old early return served "Loading..." as the server HTML for every page
  // using this layout (forms & deadlines, news, magazine, predictors), so Google
  // saw no content. Pages that need a user handle their own auth state.
  void authLoading;

  return (
    <div 
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: primaryBg }}
    >
      <Sidebar userName={username ?? "User"} onSignOut={signOut} />
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