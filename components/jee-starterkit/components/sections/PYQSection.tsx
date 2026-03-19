import React from 'react';
import { Download, ChevronRight, FileText } from 'lucide-react';

interface PYQData {
  year: number;
  driveLink: string;
  description: string;
}

export const PYQSection: React.FC = () => {
  const pyqData: PYQData[] = [
    {
      year: 2025,
      driveLink: 'https://drive.google.com/file/d/1VAsVg2CdRgEmaNk7tfXXb1K3flG5LgQ5/view?usp=drive_link',
      description: 'Latest JEE Main 2025 Shift 1 - January 22. Fresh paper with solutions and detailed analysis.'
    },
    {
      year: 2024,
      driveLink: 'https://drive.google.com/file/d/1L-a-yhn6y__oR1DiiKpKso_lDJzVlC33/view?usp=drive_link',
      description: 'JEE Main 2024 Shift 1 - January 27. Complete paper with answer key and step-by-step solutions.'
    },
    {
      year: 2023,
      driveLink: 'https://drive.google.com/file/d/1bWhFsNtZ4R2vf2P38HHtkDjbOOUQb2-M/view?usp=drive_link',
      description: 'JEE Main 2023 Shift 1 - January 24. Official questions with detailed explanations for all sections.'
    },
    {
      year: 2022,
      driveLink: 'https://drive.google.com/file/d/1mv5CpIZ230Fju5rweOhuI8C8ZqG5nk46/view?usp=drive_link',
      description: 'JEE Main 2022 Shift 1 - June 24. Comprehensive paper with answer key and pattern analysis.'
    },
    {
      year: 2021,
      driveLink: 'https://drive.google.com/file/d/1IhlaH342KJt1gsCme2uSLJQ7IaAWIqEU/view?usp=drive_link',
      description: 'JEE Main 2021 Shift 1 - February 24. Complete question paper with detailed solutions and tips.'
    },
    {
      year: 2020,
      driveLink: 'https://drive.google.com/file/d/1L6tPrEU5kX4S7Lesyg4d1EjDGGJV8KLC/view?usp=drive_link',
      description: 'JEE Main 2020 Shift 1 - January 7. Full paper with answer key and subject-wise breakdown.'
    }
  ];

  const handleDownload = (link: string) => {
    // Convert Google Drive view link to direct download link
    const fileId = link.match(/\/d\/(.+?)\//)?.[1];
    if (fileId) {
      const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
      window.open(downloadLink, '_blank');
    } else {
      // Fallback to opening the view link
      window.open(link, '_blank');
    }
  };

  const handleView = (link: string) => {
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Previous Year Question Papers
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pyqData.map((paper) => (
          <div 
            key={paper.year} 
            className="group p-6 rounded-3xl bg-slate-900/50 border border-slate-800/50 hover:border-[#F59E0B]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#F59E0B]/10"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#F59E0B]">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-500 bg-slate-800/50 px-2 py-1 rounded">
                UG Exam
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              JEE Main {paper.year} Question Paper
            </h3>
            
            <p className="text-slate-400 text-sm mb-6 line-clamp-3">
              {paper.description}
            </p>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleDownload(paper.driveLink)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#e08e15] text-slate-900 text-sm font-bold py-3 rounded-xl transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button 
                onClick={() => handleView(paper.driveLink)}
                className="w-12 h-12 flex items-center justify-center border border-slate-800 hover:border-slate-700 rounded-xl transition-all hover:bg-slate-800/50"
              >
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PYQSection;