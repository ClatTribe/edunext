"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Heart,
  DollarSign,
  Calendar,
  Award,
  GraduationCap,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "../contexts/AuthContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Scholarship {
  id: number;
  university: string;
  title: string;
  description: string;
  amount: string;
  level: string;
  field: string;
  deadline: string;
  eligibility: string;
  urgent: boolean;
  verified: boolean;
}

const ScholarshipFinder: React.FC = () => {
  const { user } = useAuth();
  const [scholarship, setscholarship] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedscholarship, setSavedscholarship] = useState<number[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");

  useEffect(() => {
    fetchscholarship();
    if (user) fetchSavedscholarship();
  }, [showVerifiedOnly, searchQuery, selectedLevel, user]);

  const fetchscholarship = async () => {
    try {
      setLoading(true);
      let query = supabase.from("scholarship").select("*");

      if (showVerifiedOnly) query = query.eq("verified", true);
      if (searchQuery)
        query = query.or(
          `title.ilike.%${searchQuery}%,university.ilike.%${searchQuery}%`
        );
      if (selectedLevel) query = query.eq("level", selectedLevel);

      const { data, error } = await query.order("deadline", { ascending: true });
      if (error) throw error;
      setscholarship(data || []);
    } catch (err) {
      console.error("Error fetching scholarship:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedscholarship = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("saved_scholarship")
        .select("scholarship_id")
        .eq("user_id", user.id);
      if (error) throw error;
      setSavedscholarship(data?.map((i) => i.scholarship_id) || []);
    } catch (err) {
      console.error("Error fetching saved scholarship:", err);
    }
  };

  const toggleSaveScholarship = async (scholarshipId: number) => {
    if (!user) {
      alert("Please login to save scholarship");
      return;
    }

    const isSaved = savedscholarship.includes(scholarshipId);
    try {
      if (isSaved) {
        const { error } = await supabase
          .from("saved_scholarship")
          .delete()
          .eq("user_id", user.id)
          .eq("scholarship_id", scholarshipId);
        if (error) throw error;
        setSavedscholarship((prev) => prev.filter((id) => id !== scholarshipId));
      } else {
        const { error } = await supabase
          .from("saved_scholarship")
          .insert({ user_id: user.id, scholarship_id: scholarshipId });
        if (error) throw error;
        setSavedscholarship((prev) => [...prev, scholarshipId]);
      }
    } catch (err) {
      console.error("Error toggling scholarship save:", err);
    }
  };

  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 bg-white p-6">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">
            Find scholarship to Fuel Your Dreams
          </h1>
          <p className="text-gray-600">
            Discover scholarship with full tuition, stipends, and research
            funding.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50">
          <Heart className="text-red-600" size={18} />
          <span>Saved ({savedscholarship.length})</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative">
          <select
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            <option>Undergraduate</option>
            <option>Graduate</option>
            <option>PhD</option>
          </select>
          <ChevronDown className="absolute right-2 top-3 h-4 w-4 pointer-events-none" />
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search for scholarship"
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          Loading scholarship...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {scholarship.map((s) => (
            <div
              key={s.id}
              className="border border-gray-200 rounded-xl shadow-sm p-6 relative"
            >
              {s.urgent && (
                <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                  URGENT
                </span>
              )}

              <div className="mb-4 text-center">
                <h3 className="font-semibold text-lg">{s.university}</h3>
                <p className="text-gray-700 font-bold">{s.title}</p>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {s.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                  {s.amount}
                </span>
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                  {s.level}
                </span>
                <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                  {s.field}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-red-600" />
                  <span className="text-sm">
                    <strong>Deadline:</strong> {formatDeadline(s.deadline)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-green-700">
                  <Award size={16} />
                  <span className="text-sm font-semibold">
                    {s.eligibility}
                  </span>
                </div>
              </div>

              <button
                onClick={() => toggleSaveScholarship(s.id)}
                className={`mt-5 w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition ${
                  savedscholarship.includes(s.id)
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }`}
              >
                <Heart
                  size={18}
                  fill={savedscholarship.includes(s.id) ? "currentColor" : "none"}
                />
                {savedscholarship.includes(s.id)
                  ? "Saved"
                  : "Apply Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipFinder;
