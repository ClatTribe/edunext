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

export default function JEEScoreGraph() {
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
        .from("jee_results")
        .select("physics_correct, physics_wrong, chemistry_correct, chemistry_wrong, mathematics_correct, mathematics_wrong");

      if (error) throw error;

      if (!data || data.length === 0) {
        setError("No data available");
        setLoading(false);
        return;
      }

      // Calculate scores and categorize
      const scoreRanges = {
        "0-40": 0,
        "40-80": 0,
        "80-120": 0,
        "120-160": 0,
        "160-200": 0,
        "200-240": 0,
        "240-280": 0,
        "280+": 0,
      };

      data.forEach((entry) => {
        // JEE Main scoring: +4 for correct, -1 for wrong
        const physicsScore = (entry.physics_correct * 4) - (entry.physics_wrong * 1);
        const chemistryScore = (entry.chemistry_correct * 4) - (entry.chemistry_wrong * 1);
        const mathematicsScore = (entry.mathematics_correct * 4) - (entry.mathematics_wrong * 1);
        
        // Total score
        const totalScore = physicsScore + chemistryScore + mathematicsScore;

        // Categorize into ranges
        if (totalScore >= 0 && totalScore < 40) scoreRanges["0-40"]++;
        else if (totalScore >= 40 && totalScore < 80) scoreRanges["40-80"]++;
        else if (totalScore >= 80 && totalScore < 120) scoreRanges["80-120"]++;
        else if (totalScore >= 120 && totalScore < 160) scoreRanges["120-160"]++;
        else if (totalScore >= 160 && totalScore < 200) scoreRanges["160-200"]++;
        else if (totalScore >= 200 && totalScore < 240) scoreRanges["200-240"]++;
        else if (totalScore >= 240 && totalScore < 280) scoreRanges["240-280"]++;
        else if (totalScore >= 280) scoreRanges["280+"]++;
      });

      // Convert to graph data format with x3 multiplication for better visualization
      // Ensure all ranges appear even if they have 0 students
      const formattedData: GraphData[] = [
        { range: "0-40", students: scoreRanges["0-40"], displayValue: scoreRanges["0-40"] * 3 },
        { range: "40-80", students: scoreRanges["40-80"], displayValue: scoreRanges["40-80"] * 3 },
        { range: "80-120", students: scoreRanges["80-120"], displayValue: scoreRanges["80-120"] * 3 },
        { range: "120-160", students: scoreRanges["120-160"], displayValue: scoreRanges["120-160"] * 3 },
        { range: "160-200", students: scoreRanges["160-200"], displayValue: scoreRanges["160-200"] * 3 },
        { range: "200-240", students: scoreRanges["200-240"], displayValue: scoreRanges["200-240"] * 3 },
        { range: "240-280", students: scoreRanges["240-280"], displayValue: scoreRanges["240-280"] * 3 },
        { range: "280+", students: scoreRanges["280+"], displayValue: scoreRanges["280+"] * 3 },
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
          <p className="text-white font-semibold mb-1">Score Range: {payload[0].payload.range}</p>
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
        <h2 className="text-2xl font-bold text-white mb-2">📊 JEE Main Score Distribution</h2>
        <p className="text-slate-400 text-sm">
          Total entries: {graphData.reduce((sum, item) => sum + item.students, 0)}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="range" 
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'Score Range (out of 300)', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={60}
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

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-xs mb-1">280+ marks</p>
          <p className="text-white font-bold">Top 0.1%</p>
          <p className="text-xs text-green-400">~99.9 %ile</p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-xs mb-1">240-280 marks</p>
          <p className="text-white font-bold">Top 1%</p>
          <p className="text-xs text-green-400">~99+ %ile</p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-xs mb-1">200-240 marks</p>
          <p className="text-white font-bold">Top 5%</p>
          <p className="text-xs text-blue-400">~95+ %ile</p>
        </div>
        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-slate-400 text-xs mb-1">160-200 marks</p>
          <p className="text-white font-bold">Top 15%</p>
          <p className="text-xs text-blue-400">~85+ %ile</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-400 text-xs">
          ℹ️ Note: Hover over bars to see detailed student distribution. Percentile estimates are approximate and based on previous year trends.
        </p>
      </div>
    </div>
  );
}