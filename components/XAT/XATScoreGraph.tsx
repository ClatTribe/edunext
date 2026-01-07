"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "../../lib/supabase";

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface GraphData {
  range: string;
  students: number;
  displayValue: number;
}

export default function XATScoreGraph() {
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchScoreData();
  }, []);

  const fetchScoreData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("xat_results")
        .select("valr_correct, valr_wrong, dm_correct, dm_wrong, qa_correct, qa_wrong, valr_skipped, dm_skipped, qa_skipped");

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("No data available");
        setLoading(false);
        return;
      }

      // Calculate scores and categorize
      const scoreRanges = {
        "0-10": 0,
        "10-20": 0,
        "20-25": 0,
        "25-30": 0,
        "30-35": 0,
        "35-40": 0,
        "40+": 0,
      };

      data.forEach((entry) => {
        // Calculate VALR score
        const valrScore = entry.valr_correct - (entry.valr_wrong * 0.25);
        // Calculate DM score
        const dmScore = entry.dm_correct - (entry.dm_wrong * 0.25);
        // Calculate QA score
        const qaScore = entry.qa_correct - (entry.qa_wrong * 0.25);
        
        // Calculate raw Part 1 score
        const rawScore = valrScore + dmScore + qaScore;
        
        // Calculate penalty
        const totalNA = entry.valr_skipped + entry.dm_skipped + entry.qa_skipped;
        const penaltyCount = Math.max(0, totalNA - 8);
        const penaltyScore = penaltyCount * 0.1;
        
        // Final score
        const finalScore = rawScore - penaltyScore;

        // Categorize into ranges
        if (finalScore >= 0 && finalScore < 10) scoreRanges["0-10"]++;
        else if (finalScore >= 10 && finalScore < 20) scoreRanges["10-20"]++;
        else if (finalScore >= 20 && finalScore < 25) scoreRanges["20-25"]++;
        else if (finalScore >= 25 && finalScore < 30) scoreRanges["25-30"]++;
        else if (finalScore >= 30 && finalScore < 35) scoreRanges["30-35"]++;
        else if (finalScore >= 35 && finalScore < 40) scoreRanges["35-40"]++;
        else if (finalScore >= 40) scoreRanges["40+"]++;
      });

      // Convert to graph data format with x3 multiplication
      // Ensure all ranges appear even if they have 0 students
      const formattedData: GraphData[] = [
        { range: "0-10", students: scoreRanges["0-10"], displayValue: scoreRanges["0-10"] * 3 },
        { range: "10-20", students: scoreRanges["10-20"], displayValue: scoreRanges["10-20"] * 3 },
        { range: "20-25", students: scoreRanges["20-25"], displayValue: scoreRanges["20-25"] * 3 },
        { range: "25-30", students: scoreRanges["25-30"], displayValue: scoreRanges["25-30"] * 3 },
        { range: "30-35", students: scoreRanges["30-35"], displayValue: scoreRanges["30-35"] * 3 },
        { range: "35-40", students: scoreRanges["35-40"], displayValue: scoreRanges["35-40"] * 3 },
        { range: "40+", students: scoreRanges["40+"], displayValue: scoreRanges["40+"] * 3 },
      ];

      setGraphData(formattedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching score data:", err);
      setError("Failed to load data");
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: secondaryBg, border: `1px solid ${accentColor}` }}>
          <p className="text-white font-semibold mb-1">Range: {payload[0].payload.range}</p>
          <p style={{ color: accentColor }} className="font-bold">Students: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-48 mx-auto mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">📊 Overall Score Distribution</h2>
        {/* <p className="text-slate-400 text-sm">
          Total entries: {graphData.reduce((sum, item) => sum + item.students, 0)}
        </p> */}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="range" 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'Score Range', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
            interval={0}
          />
          <YAxis 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Number of Students', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            formatter={() => 'Students'}
          />
          <Bar 
            dataKey="displayValue" 
            fill={accentColor}
            radius={[8, 8, 0, 0]}
            name="Students"
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
        <p className="text-slate-400 text-xs">
          ℹ️ Note: Hover over bars to see detailed student distribution across score ranges.
        </p>
      </div>
    </div>
  );
}