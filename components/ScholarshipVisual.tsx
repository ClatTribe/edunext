import React, { useState, useEffect } from "react";
import { Search, Bookmark, Calendar, Globe } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Scholarship {
  id: number;
  scholarship_name: string;
  organisation: string;
  deadline: string;
}

export const ScholarshipVisual: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("scholarship")
        .select("id, scholarship_name, organisation, deadline")
        .not("scholarship_name", "is", null)
        .order("deadline", { ascending: true })
        .limit(5);

      if (error) throw error;

      if (data) setScholarships(data);
    } catch (err) {
      console.error("Error fetching scholarships:", err);
    } finally {
      setLoading(false);
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

  // Filter scholarships based on search query
  const filteredScholarships = scholarships.filter((sch) =>
    sch.scholarship_name.toLowerCase().includes(query.toLowerCase()) ||
    sch.organisation.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-slate-100 bg-white">
        <h3 className="text-3xl font-bold text-[#2f61ce] mb-2 tracking-tight">
          Find Scholarships to Fuel Your Dreams
        </h3>
        <p className="text-slate-500 mb-6 text-lg">
          Discover scholarships from top universities and institutions Nationwide
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <button className="bg-[#2f61ce] text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-600 transition-colors">
            <Bookmark size={18} /> All Scholarships
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scholarships by name or organisation..."
            className="w-full border border-slate-200 rounded-lg pl-5 pr-12 py-4 text-slate-700 focus:ring-2 focus:ring-blue-100 focus:border-[#2f61ce] transition-all outline-none text-lg"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors"
            size={24}
          />
        </div>
      </div>

      {/* Scholarships List */}
      <div className="bg-slate-50 flex-1 p-6 overflow-y-auto relative">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2f61ce]"></div>
          </div>
        ) : filteredScholarships.length === 0 ? (
          <p className="text-center text-slate-500 mt-12">No scholarships found.</p>
        ) : (
          <div className="space-y-3">
            {filteredScholarships.map((scholarship) => (
              <div
                key={scholarship.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-3">
                  <h4 className="font-bold text-slate-900 text-base mb-2 leading-tight">
                    {scholarship.scholarship_name || "Scholarship"}
                  </h4>
                  {scholarship.organisation && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Globe size={14} className="flex-shrink-0" />
                      <span className="truncate">{scholarship.organisation}</span>
                    </div>
                  )}
                </div>

                {scholarship.deadline && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 pt-3 border-t border-slate-100">
                    <Calendar size={14} className="flex-shrink-0 text-[#2f61ce]" />
                    <span className="text-xs">
                      <strong>Deadline:</strong> {formatDeadline(scholarship.deadline)}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {/* Fade overlay to indicate scroll */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none"></div>
          </div>
        )}
      </div>
    </div>
  );
};