"use client";
import React, { useState, useEffect } from 'react';
import { 
  Heart, GraduationCap, Award, Trash2, MapPin, IndianRupee, 
  BookOpen, FileText, Globe, ExternalLink, AlertCircle, 
  CheckCircle, X, Clock, Calendar, Sparkles 
} from 'lucide-react';
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../contexts/AuthContext";
import DefaultLayout from "../defaultLayout";

interface Course {
  id: number;
  Rank: string | null;
  "College Name": string | null;
  Location: string | null;
  City: string | null;
  State: string | null;
  Approvals: string | null;
  "CD Score": string | null;
  "Course Fees": string | null;
  "Average Package": string | null;
  "Highest Package": string | null;
  "Placement %": string | null;
  "Placement Score": string | null;
  "User Rating": string | null;
  "User Reviews": string | null;
  Ranking: string | null;
  Specialization: string | null;
  "Application Link": string | null;
}

interface Scholarship {
  id: number;
  scholarship_name: string;
  organisation: string;
  eligibility: string;
  benefit: string;
  deadline: string;
  link: string;
}

interface ShortlistItem {
  id: number;
  user_id: string;
  item_type: "course" | "scholarship";
  course_id: number | null;
  scholarship_id: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  course?: Course;
  scholarship?: Scholarship;
}

// Color scheme matching the admit finder page
const accentColor = '#6366f1'; // Indigo accent
const primaryBg = '#0a0f1e'; // Very dark navy blue
const secondaryBg = '#111827'; // Slightly lighter navy
const borderColor = 'rgba(99, 102, 241, 0.15)'; // Indigo border with opacity

const ShortlistBuilder: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"courses" | "scholarships">("courses");
  const [shortlistItems, setShortlistItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchShortlistItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShortlistItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: shortlistData, error: shortlistError } = await supabase
        .from("shortlist_builder")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (shortlistError) throw shortlistError;

      const itemsWithDetails = await Promise.all(
        (shortlistData || []).map(async (item) => {
          if (item.item_type === "course" && item.course_id) {
            const { data: courseData } = await supabase
              .from("courses")
              .select("*")
              .eq("id", item.course_id)
              .single();

            return { ...item, course: courseData };
          } else if (item.item_type === "scholarship" && item.scholarship_id) {
            const { data: scholarshipData } = await supabase
              .from("scholarship")
              .select("*")
              .eq("id", item.scholarship_id)
              .single();

            return { ...item, scholarship: scholarshipData };
          }
          return item;
        })
      );

      setShortlistItems(itemsWithDetails);
    } catch (err) {
      console.error("Error fetching shortlist:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch shortlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromShortlist = async (itemId: number) => {
    if (!confirm("Are you sure you want to remove this item from your shortlist?")) return;

    try {
      const { error } = await supabase
        .from("shortlist_builder")
        .delete()
        .eq("id", itemId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setShortlistItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    }
  };

  const updateStatus = async (itemId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("shortlist_builder")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setShortlistItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus, updated_at: new Date().toISOString() } : item
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  const updateNotes = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from("shortlist_builder")
        .update({ notes: noteText, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .eq("user_id", user?.id);

      if (error) throw error;

      setShortlistItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, notes: noteText, updated_at: new Date().toISOString() } : item
        )
      );

      setEditingNotes(null);
      setNoteText("");
    } catch (err) {
      console.error("Error updating notes:", err);
      alert("Failed to update notes. Please try again.");
    }
  };

  const formatDeadline = (dateString: string) => {
    if (!dateString || dateString === "") return "Check website";

    if (
      dateString.toLowerCase().includes("varies") ||
      dateString.toLowerCase().includes("rolling") ||
      dateString.toLowerCase().includes("typically")
    ) {
      return dateString;
    }

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      interested: { color: "bg-blue-500/20 text-blue-400 border border-blue-500/30", icon: <Heart size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Interested" },
      applied: { color: "bg-purple-500/20 text-purple-400 border border-purple-500/30", icon: <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Applied" },
      accepted: { color: "bg-green-500/20 text-green-400 border border-green-500/30", icon: <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Accepted" },
      rejected: { color: "bg-red-500/20 text-red-400 border border-red-500/30", icon: <X size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Rejected" },
      pending: { color: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30", icon: <Clock size={12} className="sm:w-3.5 sm:h-3.5" />, label: "Pending" },
    };

    const config = statusConfig[status] || statusConfig.interested;

    return (
      <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const filteredItems = shortlistItems.filter((item) => {
    if (activeTab === "courses" && item.item_type !== "course") return false;
    if (activeTab === "scholarships" && item.item_type !== "scholarship") return false;
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    return true;
  });

  const courseCount = shortlistItems.filter((item) => item.item_type === "course").length;
  const scholarshipCount = shortlistItems.filter((item) => item.item_type === "scholarship").length;

  if (!user) {
    return (
      <DefaultLayout>
        <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl shadow-sm p-8 sm:p-12 text-center backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
              <AlertCircle className="mx-auto mb-4" style={{ color: '#ef4444' }} size={40} />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-sm sm:text-base text-slate-400">Please login to view your shortlist</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex-1 min-h-screen p-3 sm:p-4 md:p-6 mt-[72px] sm:mt-0" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3" style={{ color: accentColor }}>
              <Heart size={28} className="sm:w-9 sm:h-9" />
              My Shortlist
            </h1>
            <p className="text-sm sm:text-base text-slate-400">Manage your saved Colleges and Scholarships in one place</p>
          </div>

          <div className="rounded-xl shadow-sm p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 backdrop-blur-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
            {/* Tab and Filter Section */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Tabs */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveTab("courses")}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all"
                  style={activeTab === "courses"
                    ? { backgroundColor: accentColor, color: 'white', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }
                    : { backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#cbd5e1', border: `1px solid ${borderColor}` }
                  }
                >
                  <GraduationCap size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Colleges</span>
                  <span
                    className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs`}
                    style={activeTab === "courses" 
                      ? { backgroundColor: 'white', color: accentColor } 
                      : { backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }
                    }
                  >
                    {courseCount}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("scholarships")}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-xs sm:text-sm md:text-base transition-all"
                  style={activeTab === "scholarships"
                    ? { backgroundColor: accentColor, color: 'white', boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)' }
                    : { backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#cbd5e1', border: `1px solid ${borderColor}` }
                  }
                >
                  <Award size={16} className="sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">Scholarships</span>
                  <span
                    className={`ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs`}
                    style={activeTab === "scholarships" 
                      ? { backgroundColor: 'white', color: accentColor } 
                      : { backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }
                    }
                  >
                    {scholarshipCount}
                  </span>
                </button>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <label className="text-xs sm:text-sm font-medium text-slate-300">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-white"
                  style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                >
                  <option value="all" style={{ backgroundColor: secondaryBg }}>All</option>
                  <option value="interested" style={{ backgroundColor: secondaryBg }}>Interested</option>
                  <option value="applied" style={{ backgroundColor: secondaryBg }}>Applied</option>
                  <option value="accepted" style={{ backgroundColor: secondaryBg }}>Accepted</option>
                  <option value="rejected" style={{ backgroundColor: secondaryBg }}>Rejected</option>
                  <option value="pending" style={{ backgroundColor: secondaryBg }}>Pending</option>
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertCircle className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} size={20} />
                <p className="text-xs sm:text-sm" style={{ color: '#fca5a5' }}>{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2" style={{ borderColor: accentColor }}></div>
                  <p className="text-sm sm:text-base text-slate-400">Loading your shortlist...</p>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Heart size={40} className="sm:w-12 sm:h-12 mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  No {activeTab} in your shortlist yet
                </h3>
                <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6 px-4">
                  Start exploring and save items you are interested in
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <a
                    href="/find-colleges"
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    <GraduationCap size={18} className="sm:w-5 sm:h-5" />
                    Browse Colleges
                  </a>
                  <a
                    href="/find-scholarships"
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition"
                    style={{ backgroundColor: accentColor, color: 'white' }}
                  >
                    <Award size={18} className="sm:w-5 sm:h-5" />
                    Browse Scholarships
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow backdrop-blur-xl"
                    style={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', border: `1px solid ${borderColor}` }}
                  >
                    {item.item_type === "course" && item.course ? (
                      <>
                        {/* Course Header */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2 sm:mb-3">
                              <div className="text-white font-bold text-base sm:text-lg md:text-xl mb-2 break-words">
                                {item.course["College Name"] || "College Name Not Available"}
                              </div>
                              {item.course["Specialization"] && (
                                <div className="inline-block text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold break-words" style={{ backgroundColor: accentColor }}>
                                  {item.course["Specialization"]}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              {getStatusBadge(item.status)}
                              {item.course["State"] && (
                                <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex items-center gap-1" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                  <MapPin size={12} className="flex-shrink-0" />
                                  <span className="truncate">{item.course["State"]}</span>
                                </span>
                              )}
                              {item.course["City"] && (
                                <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-medium truncate" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                  {item.course["City"]}
                                </span>
                              )}
                              {item.course["Ranking"] && (
                                <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex items-center gap-1" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                  <Sparkles size={12} className="flex-shrink-0" />
                                  <span className="hidden sm:inline">Rank:</span> {item.course["Ranking"]}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromShortlist(item.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Course Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b" style={{ borderColor: borderColor }}>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                              <IndianRupee size={12} className="flex-shrink-0" />
                              <span>Fees</span>
                            </div>
                            <p className="font-medium text-slate-200 text-xs sm:text-sm break-words">
                              {item.course["Course Fees"] || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                              <IndianRupee size={12} className="flex-shrink-0" />
                              <span>Avg Package</span>
                            </div>
                            <p className="font-medium text-slate-200 text-xs sm:text-sm break-words">
                              {item.course["Average Package"] || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                              <Award size={12} className="flex-shrink-0" />
                              <span>Highest</span>
                            </div>
                            <p className="font-medium text-slate-200 text-xs sm:text-sm break-words">
                              {item.course["Highest Package"] || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                              <BookOpen size={12} className="flex-shrink-0" />
                              <span>Placement</span>
                            </div>
                            <p className="font-medium text-slate-200 text-xs sm:text-sm">
                              {item.course["Placement %"] || "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* User Rating */}
                        {item.course["User Rating"] && (
                          <div className="mb-3 sm:mb-4 rounded-lg p-2 sm:p-3" style={{ backgroundColor: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                            <p className="text-xs font-medium text-yellow-400 mb-1">User Rating</p>
                            <p className="text-xs sm:text-sm text-slate-300">{item.course["User Rating"]}</p>
                          </div>
                        )}

                        {/* Status Selector */}
                        <div className="mb-3 sm:mb-4">
                          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                            Application Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-white"
                            style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                          >
                            <option value="interested" style={{ backgroundColor: secondaryBg }}>Interested</option>
                            <option value="applied" style={{ backgroundColor: secondaryBg }}>Applied</option>
                            <option value="accepted" style={{ backgroundColor: secondaryBg }}>Accepted</option>
                            <option value="rejected" style={{ backgroundColor: secondaryBg }}>Rejected</option>
                            <option value="pending" style={{ backgroundColor: secondaryBg }}>Pending</option>
                          </select>
                        </div>

                        {/* Notes Section */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1">
                              <FileText size={12} className="sm:w-3.5 sm:h-3.5" />
                              Notes
                            </label>
                            {editingNotes !== item.id && (
                              <button
                                onClick={() => {
                                  setEditingNotes(item.id);
                                  setNoteText(item.notes || "");
                                }}
                                className="text-xs font-medium" style={{ color: accentColor }}
                              >
                                {item.notes ? "Edit" : "Add Note"}
                              </button>
                            )}
                          </div>
                          {editingNotes === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-white"
                                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateNotes(item.id)}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium transition"
                                  style={{ backgroundColor: accentColor }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNoteText("");
                                  }}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-slate-300 rounded-lg text-xs sm:text-sm font-medium transition"
                                  style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-400 rounded-lg p-2 sm:p-3 break-words" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                              {item.notes || "No notes added yet"}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          {item.course["Application Link"] && (
                            <a
                              href={
                                item.course["Application Link"].startsWith("http")
                                  ? item.course["Application Link"]
                                  : `https://${item.course["Application Link"]}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg text-xs sm:text-sm font-medium transition"
                              style={{ backgroundColor: accentColor }}
                            >
                              <Globe size={14} className="sm:w-4 sm:h-4" />
                              View Details
                            </a>
                          )}
                          <span className="text-xs text-slate-400">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : item.item_type === "scholarship" && item.scholarship ? (
                      <>
                        {/* Scholarship Header */}
                        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <Award className="flex-shrink-0 mt-1" style={{ color: accentColor }} size={20} />
                              <div className="min-w-0">
                                <h3 className="font-bold text-base sm:text-lg text-white mb-1 break-words">
                                  {item.scholarship.scholarship_name}
                                </h3>
                                <p className="text-slate-400 text-xs sm:text-sm font-medium break-words">
                                  {item.scholarship.organisation}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                              {getStatusBadge(item.status)}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromShortlist(item.id)}
                            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                            title="Remove from shortlist"
                          >
                            <Trash2 size={18} className="sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Deadline */}
                        <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b" style={{ borderColor: borderColor }}>
                          <div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                              <Calendar size={12} className="flex-shrink-0" />
                              <span>Deadline</span>
                            </div>
                            <p className="font-medium text-slate-200 text-xs sm:text-sm break-words">
                              {formatDeadline(item.scholarship.deadline)}
                            </p>
                          </div>
                        </div>

                        {/* Eligibility */}
                        {item.scholarship.eligibility && (
                          <div className="mb-3 sm:mb-4 rounded-lg p-2 sm:p-3" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <p className="text-xs font-medium text-blue-400 mb-1">Eligibility</p>
                            <p className="text-xs sm:text-sm text-slate-300 break-words">{item.scholarship.eligibility}</p>
                          </div>
                        )}

                        {/* Benefits */}
                        {item.scholarship.benefit && (
                          <div className="mb-3 sm:mb-4 rounded-lg p-2 sm:p-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                            <p className="text-xs font-medium text-green-400 mb-1">Benefits</p>
                            <p className="text-xs sm:text-sm text-green-300 break-words">{item.scholarship.benefit}</p>
                          </div>
                        )}

                        {/* Status Selector */}
                        <div className="mb-3 sm:mb-4">
                          <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                            Application Status
                          </label>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-white"
                            style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                          >
                            <option value="interested" style={{ backgroundColor: secondaryBg }}>Interested</option>
                            <option value="applied" style={{ backgroundColor: secondaryBg }}>Applied</option>
                            <option value="accepted" style={{ backgroundColor: secondaryBg }}>Accepted</option>
                            <option value="rejected" style={{ backgroundColor: secondaryBg }}>Rejected</option>
                            <option value="pending" style={{ backgroundColor: secondaryBg }}>Pending</option>
                          </select>
                        </div>

                        {/* Notes Section */}
                        <div className="mb-3 sm:mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1">
                              <FileText size={12} className="sm:w-3.5 sm:h-3.5" />
                              Notes
                            </label>
                            {editingNotes !== item.id && (
                              <button
                                onClick={() => {
                                  setEditingNotes(item.id);
                                  setNoteText(item.notes || "");
                                }}
                                className="text-xs font-medium" style={{ color: accentColor }}
                              >
                                {item.notes ? "Edit" : "Add Note"}
                              </button>
                            )}
                          </div>
                          {editingNotes === item.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add your notes here..."
                                className="w-full px-3 sm:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-xs sm:text-sm text-white"
                                style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `1px solid ${borderColor}` }}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => updateNotes(item.id)}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium transition"
                                  style={{ backgroundColor: accentColor }}
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingNotes(null);
                                    setNoteText("");
                                  }}
                                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-slate-300 rounded-lg text-xs sm:text-sm font-medium transition"
                                  style={{ backgroundColor: 'rgba(148, 163, 184, 0.2)' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-slate-400 rounded-lg p-2 sm:p-3 break-words" style={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
                              {item.notes || "No notes added yet"}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                          {item.scholarship.link && (
                            <a
                              href={item.scholarship.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-white rounded-lg text-xs sm:text-sm font-medium transition"
                              style={{ backgroundColor: accentColor }}
                            >
                              <ExternalLink size={14} className="sm:w-4 sm:h-4" />
                              Apply Now
                            </a>
                          )}
                          <span className="text-xs text-slate-400">
                            Added {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ShortlistBuilder;