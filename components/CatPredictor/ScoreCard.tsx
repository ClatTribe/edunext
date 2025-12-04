import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  percentile: number;
  colorClass: string;
  icon: React.ReactNode;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, percentile, colorClass, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
          {icon}
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm text-gray-400 mb-1">Score</p>
          <p className="text-2xl font-bold text-gray-900">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 mb-1">Percentile</p>
          <p className={`text-2xl font-bold ${colorClass.replace('bg-', 'text-')}`}>{percentile}</p>
        </div>
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
        <div 
          className={`h-1.5 rounded-full ${colorClass.replace('bg-', 'bg-')}`} 
          style={{ width: `${Math.max(5, percentile)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreCard;
