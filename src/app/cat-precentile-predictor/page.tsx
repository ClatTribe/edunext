  "use client";
  import React, { useState, useEffect } from 'react';
  import { useRouter } from 'next/navigation';
  import { useAuth } from '../../../contexts/AuthContext';
  import { getPercentile } from '../../../utils/data';
  import ScoreCard from '../../../components/CatPredictor/ScoreCard';
  import { PercentileRadar, OverallGauge } from '../../../components/CatPredictor/Charts';
  import DefaultLayout from '../defaultLayout';
  import { 
    Calculator, 
    BookOpen, 
    BarChart3, 
    Puzzle,
    RotateCcw 
  } from 'lucide-react';

  const Carpercentile: React.FC = () => {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    const [vaScore, setVaScore] = useState<number | ''>('');
    const [qaScore, setQaScore] = useState<number | ''>('');
    const [dilrScore, setDilrScore] = useState<number | ''>('');
    
    const [percentiles, setPercentiles] = useState({
      va: 0,
      qa: 0,
      dilr: 0,
      overall: 0
    });

    const [totalScore, setTotalScore] = useState(0);

    // Authentication check - redirect to register if not logged in
    useEffect(() => {
      if (!loading && !user) {
        router.push('/register');
      }
    }, [user, loading, router]);

    useEffect(() => {
      const v = Number(vaScore) || 0;
      const q = Number(qaScore) || 0;
      const d = Number(dilrScore) || 0;
      const t = v + q + d;

      setTotalScore(t);

      setPercentiles({
        va: getPercentile('VA', v),
        qa: getPercentile('QA', q),
        dilr: getPercentile('DILR', d),
        overall: getPercentile('Overall', t)
      });
    }, [vaScore, qaScore, dilrScore]);

    const handleReset = () => {
      setVaScore('');
      setQaScore('');
      setDilrScore('');
    };

    const radarData = [
      { subject: 'Verbal (VA)', A: percentiles.va, fullMark: 100 },
      { subject: 'Quant (QA)', A: percentiles.qa, fullMark: 100 },
      { subject: 'DILR', A: percentiles.dilr, fullMark: 100 },
    ];

    // Show loading state while checking authentication
    if (loading) {
      return (
        <DefaultLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-xl text-[#005de6] flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#005de6]"></div>
              Loading...
            </div>
          </div>
        </DefaultLayout>
      );
    }

    // Don't render the page content if user is not authenticated
    if (!user) return null;

    return (
      <DefaultLayout>
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
        <main className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section - Similar to CourseFinder */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-[#005de6] mb-2">CAT Percentile Predictor</h1>
                <p className="text-gray-600">Enter your scores to estimate your percentile based on historical data</p>
              </div>
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <label htmlFor="va" className="block text-sm font-medium text-gray-700 mb-2">Verbal Ability (VA)</label>
              <div className="relative rounded-md shadow-sm mt-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BookOpen className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  id="va"
                  className="block w-full rounded-md border-0 py-3 pl-10 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#005de6] sm:text-lg sm:leading-6"
                  placeholder="0"
                  value={vaScore}
                  onChange={(e) => setVaScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">Score</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <label htmlFor="dilr" className="block text-sm font-medium text-gray-700 mb-2">Data Interpretation (DILR)</label>
              <div className="relative rounded-md shadow-sm mt-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Puzzle className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  id="dilr"
                  className="block w-full rounded-md border-0 py-3 pl-10 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#005de6] sm:text-lg sm:leading-6"
                  placeholder="0"
                  value={dilrScore}
                  onChange={(e) => setDilrScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">Score</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
              <label htmlFor="qa" className="block text-sm font-medium text-gray-700 mb-2">Quantitative Ability (QA)</label>
              <div className="relative rounded-md shadow-sm mt-auto">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <BarChart3 className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="number"
                  id="qa"
                  className="block w-full rounded-md border-0 py-3 pl-10 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#005de6] sm:text-lg sm:leading-6"
                  placeholder="0"
                  value={qaScore}
                  onChange={(e) => setQaScore(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-gray-500 sm:text-sm">Score</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Section Breakdown */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Sectional Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScoreCard 
                  title="VA Percentile" 
                  score={Number(vaScore) || 0} 
                  percentile={percentiles.va} 
                  colorClass="bg-blue-500 text-blue-600"
                  icon={<BookOpen className="h-6 w-6 text-blue-600" />}
                />
                <ScoreCard 
                  title="DILR Percentile" 
                  score={Number(dilrScore) || 0} 
                  percentile={percentiles.dilr} 
                  colorClass="bg-emerald-500 text-emerald-600"
                  icon={<Puzzle className="h-6 w-6 text-emerald-600" />}
                />
                <ScoreCard 
                  title="QA Percentile" 
                  score={Number(qaScore) || 0} 
                  percentile={percentiles.qa} 
                  colorClass="bg-orange-500 text-orange-600"
                  icon={<BarChart3 className="h-6 w-6 text-orange-600" />}
                />
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Performance Radar</h4>
                <PercentileRadar data={radarData} />
              </div>
            </div>

            {/* Right Col: Overall Summary */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Overall Standing</h3>
              <div className="bg-[#005de6] rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500 rounded-full opacity-50 blur-xl"></div>
                  <div className="relative z-10">
                    <p className="text-blue-100 font-medium mb-1">Total Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold">{totalScore}</span>
                      <span className="text-blue-200">/ 198</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-500/30">
                      <p className="text-sm text-blue-100">Combines VA, DILR, and QA scores.</p>
                    </div>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Overall Percentile</h4>
                  <OverallGauge percentile={percentiles.overall} />
                  <p className="text-center text-gray-500 text-sm mt-[-20px]">
                    Estimated percentile based on a total score of {totalScore}.
                  </p>
              </div>
            </div>

          </div>
        </main>
      </div>
      </DefaultLayout>
    );
  };

  export default Carpercentile;