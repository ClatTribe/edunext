"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../../lib/supabase";

const accentColor = "#F59E0B";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface GraphData {
  range: string;
  students: number;
}

export default function JEEScoreGraph() {
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalStudents, setTotalStudents] = useState(0);
  const [fetchProgress, setFetchProgress] = useState(0);

  useEffect(() => {
    fetchScoreData();
    
    // Optional: Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchScoreData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      setError("");
      
      let allData: any[] = [];
      let from = 0;
      const batchSize = 1000; // Supabase default max per request
      let hasMore = true;
      let totalFetched = 0;

      console.log("🔄 Starting to fetch all JEE results data...");

      // Fetch ALL data in batches - no limit
      while (hasMore) {
        const { data, error, count } = await supabase
          .from("jee_results")
          .select("total_score", { count: "exact" })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error("❌ Supabase error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }

        allData = [...allData, ...data];
        totalFetched += data.length;
        
        // Update progress for user feedback
        if (count) {
          setFetchProgress(Math.round((totalFetched / count) * 100));
        }

        console.log(`📦 Fetched batch: ${data.length} records | Total so far: ${totalFetched}`);

        // If we got less than batchSize, we've reached the end
        if (data.length < batchSize) {
          hasMore = false;
          console.log(`✅ Finished fetching! Total records: ${totalFetched}`);
        } else {
          from += batchSize;
        }
      }

      if (allData.length === 0) {
        setError("No data available in the database");
        setLoading(false);
        return;
      }

      console.log(`📊 Processing ${allData.length} student records...`);

      // Initialize score ranges
      const scoreRanges = {
        "0-50": 0,
        "50-100": 0,
        "100-150": 0,
        "150-200": 0,
        "200-250": 0,
        "250-300": 0,
      };

      // Categorize students into score ranges
      allData.forEach((entry) => {
        const score = entry.total_score;

        if (score >= 0 && score < 50) scoreRanges["0-50"]++;
        else if (score >= 50 && score < 100) scoreRanges["50-100"]++;
        else if (score >= 100 && score < 150) scoreRanges["100-150"]++;
        else if (score >= 150 && score < 200) scoreRanges["150-200"]++;
        else if (score >= 200 && score < 250) scoreRanges["200-250"]++;
        else if (score >= 250 && score <= 300) scoreRanges["250-300"]++;
      });

      // Convert to graph data format
      const formattedData: GraphData[] = [
        { range: "0-50", students: scoreRanges["0-50"] },
        { range: "50-100", students: scoreRanges["50-100"] },
        { range: "100-150", students: scoreRanges["100-150"] },
        { range: "150-200", students: scoreRanges["150-200"] },
        { range: "200-250", students: scoreRanges["200-250"] },
        { range: "250-300", students: scoreRanges["250-300"] },
      ];

      console.log("📈 Distribution:", scoreRanges);

      setGraphData(formattedData);
      setTotalStudents(allData.length);
      setFetchProgress(100);
      setLoading(false);
    } catch (err) {
      console.error("💥 Error fetching score data:", err);
      setError("Failed to load data from database");
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = totalStudents > 0 
        ? ((payload[0].value / totalStudents) * 100).toFixed(1)
        : "0";
      
      return (
        <div className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: secondaryBg, border: `1px solid ${accentColor}` }}>
          <p className="text-white font-semibold mb-1">Score Range: {payload[0].payload.range}</p>
          <p style={{ color: accentColor }} className="font-bold">Students: {payload[0].value.toLocaleString()}</p>
          <p className="text-slate-400 text-sm">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-64 mx-auto mb-4"></div>
          <div className="h-64 bg-slate-700 rounded mb-4"></div>
          {fetchProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${fetchProgress}%`, backgroundColor: accentColor }}
                ></div>
              </div>
              <p className="text-slate-400 text-sm mt-2">Loading data... {fetchProgress}%</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchScoreData}
          className="px-4 py-2 rounded-lg text-white"
          style={{ backgroundColor: accentColor }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">📊 JEE Main Score Distribution</h2>
          <p className="text-slate-400 text-sm">
            Total Students: <span className="text-white font-semibold">{totalStudents.toLocaleString()}</span>
          </p>
        </div>
        <button 
          onClick={fetchScoreData}
          className="px-3 py-1.5 rounded-lg text-white text-sm hover:opacity-80 transition-opacity"
          style={{ backgroundColor: accentColor }}
          title="Refresh data"
        >
          🔄 Refresh
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="range" 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Score Range (out of 300)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
            interval={0}
            height={60}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            formatter={() => 'Students'}
          />
          <Bar 
            dataKey="students" 
            fill={accentColor}
            radius={[8, 8, 0, 0]}
            name="Students"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { range: "250-300 marks", label: "Excellent", color: "green-400", percentile: "~99.5+ %ile" },
          { range: "200-250 marks", label: "Very Good", color: "green-400", percentile: "~98+ %ile" },
          { range: "150-200 marks", label: "Good", color: "blue-400", percentile: "~90+ %ile" },
          { range: "100-150 marks", label: "Average", color: "yellow-400", percentile: "~70+ %ile" },
          { range: "50-100 marks", label: "Below Avg", color: "orange-400", percentile: "~40+ %ile" },
          { range: "0-50 marks", label: "Needs Work", color: "red-400", percentile: "~10+ %ile" },
        ].map((item, idx) => (
          <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-xs mb-1">{item.range}</p>
            <p className="text-white font-bold">{item.label}</p>
            <p className={`text-xs text-${item.color}`}>{item.percentile}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-400 text-xs">
          ℹ️ Data automatically refreshes every 30 seconds. Click the refresh button for manual updates. Percentile estimates are approximate based on previous year trends.
        </p>
      </div>
    </div>
  );
}