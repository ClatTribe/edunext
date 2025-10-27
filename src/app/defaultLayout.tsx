"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading: authLoading, username, signOut } = useAuth();
  
  // Redirect to register page if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/register");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 bg-gradient-to-b from-pink-50 to-red-50 border-r border-pink-200"></div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600 flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={username ?? "User"} onSignOut={signOut} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}