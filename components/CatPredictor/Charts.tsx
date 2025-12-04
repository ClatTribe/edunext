import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Tooltip
} from 'recharts';

interface RadarProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
  }[];
}

export const PercentileRadar: React.FC<RadarProps> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Percentile"
            dataKey="A"
            stroke="#6366f1"
            strokeWidth={3}
            fill="#818cf8"
            fillOpacity={0.6}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface GaugeProps {
  percentile: number;
}

export const OverallGauge: React.FC<GaugeProps> = ({ percentile }) => {
  const data = [
    {
      name: 'Percentile',
      uv: percentile,
      fill: '#4f46e5',
    },
    {
      name: 'Max',
      uv: 100,
      fill: '#f3f4f6', 
    }
  ];

  return (
    <div className="w-full h-48 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="60%" 
          outerRadius="100%" 
          barSize={20} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <RadialBar
            background={{ fill: '#e5e7eb' }}
            dataKey="uv"
            cornerRadius={30}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-0 text-center mt-4">
         <span className="text-gray-400 text-sm block">Overall</span>
        <span className="text-4xl font-bold text-gray-900">{percentile}</span>
        <span className="text-sm font-medium text-gray-500">%ile</span>
      </div>
    </div>
  );
};
