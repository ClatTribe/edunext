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
  const { user } = useAuth();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when component mounts
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchUserName();
    } else if (!user) {
      setIsLoading(false);
    }
  }, [user]);

  const fetchUserName = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Try to get name from Supabase profile
      const { data, error } = await supabase
        .from('admit_profiles')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && data.name) {
        setUserName(data.name);
      } else {
        // Fallback to auth metadata or email
        const fallbackName = 
          user?.user_metadata?.full_name || 
          user?.email?.split('@')[0] || 
          'User';
        setUserName(fallbackName);
      }
    } catch (err) {
      console.error("Error fetching username:", err);
      // Use fallback on error
      const fallbackName = 
        user?.user_metadata?.full_name || 
        user?.email?.split('@')[0] || 
        'User';
      setUserName(fallbackName);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage if you're using it
      if (typeof window !== "undefined") {
        localStorage.clear();
      }
      
      // Redirect to login
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
      // Still redirect even if error occurs
      router.push("/auth/login");
    }
  };

  // Show minimal loading state
  if (isLoading) {
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={userName} onSignOut={handleSignOut} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}