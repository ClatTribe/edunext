"use client";
import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  BookOpen,
  IndianRupee,
  Users,
  Building2,
  GraduationCap,
  LogOut,
  ThumbsUp,
  Menu,
  X,
  FileCheck,
  TrendingUp,
  SearchCheck,
  Calculator,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  userName: string;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ userName, onSignOut }) => {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Color scheme matching the TrustSection component
  const accentColor = '#F59E0B';
  const primaryBg = '#050818'; // Very dark navy blue
  const secondaryBg = '#0F172B'; // Slightly lighter navy
  const borderColor = 'rgba(245, 158, 11, 0.15)';

  const navItems = {
    main: [
      { icon: Home, label: "Home", path: "/home" },
      { icon: User, label: "Profile", path: "/profile" },
    ],
    explore: [
      { icon: BookOpen, label: "Find Colleges", path: "/find-colleges" },
      { icon: Sparkles, label: "Medha AI", path: "/medha-ai" },
      { icon: Users, label: "Previous Year Students", path: "/previous-year-students" },
      { icon: IndianRupee, label: "Find Scholarships", path: "/find-scholarships" },
      { icon: Building2, label: "Your Shortlist", path: "/your-shortlist" },
      { icon: Building2, label: "Battle Mode", path: "/battle-mode" },
    ],
    applications: [
      { icon: BookOpen, label: "Application Builder", path: "/application-builder" },
      { icon: GraduationCap, label: "Document Upload", path: "/document" },
    ],
  };

  const toolOptions = [
    {
      icon: TrendingUp,
      label: "CAT Percentile Predictor",
      path: "/cat-percentile-predictor",
    },
