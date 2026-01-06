import React, { useState } from 'react';
import IIMIndoreCutoffTable from './IIMIndoreCutoffTable';
import IIMRohtakCutoffTable from './IIMRohtakCutoffTable';
import IIMShillongCutoffTable from './IIMShillongCutoffTable';
import IIMRanchiCutoffTable from './IIMRanchiCutoffTable';
import IIMBodhgayaCutoffTable from './IIMBodhgayaCutoffTable';
import IIMSirmaurCutoffTable from './IIMSirmaurCutoffTable';

const primaryColor = '#823588';
const secondaryColor = '#F2AD00';

// Define city keys type
type CityKey = 'indore' | 'rohtak' | 'shillong' | 'ranchi' | 'bodhgaya' | 'sirmaur';

// Define available years for each IIM
const iimYearsData: Record<CityKey, { name: string; years: number[] }> = {
  indore: {
    name: 'IIM Indore',
    years: [2025, 2024, 2023, 2022, 2021, 2020, 2019],
  },
  rohtak: {
    name: 'IIM Rohtak',
    years: [2025, 2024, 2023, 2022, 2021],
  },
  shillong: {
    name: 'IIM Shillong',
    years: [2025],
  },
  ranchi: {
    name: 'IIM Ranchi',
    years: [2025, 2024, 2023],
  },
  bodhgaya: {
    name: 'IIM Bodh Gaya',
    years: [2025, 2024, 2023, 2022],
  },
  sirmaur: {
    name: 'IIM Sirmaur',
    years: [2025],
  },
};

const UnifiedCutoffsPage = () => {
  const [selectedCity, setSelectedCity] = useState<CityKey>('indore');
  const [selectedYear, setSelectedYear] = useState(2025);

  // Update year when city changes
  const handleCityChange = (city: CityKey) => {
    setSelectedCity(city);
    // Set to the most recent year available for this city
    setSelectedYear(iimYearsData[city].years[0]);
  };

  // Render the appropriate component based on selection
  const renderCutoffComponent = () => {
    switch (selectedCity) {
      case 'indore':
        return <IIMIndoreCutoffTable selectedYear={selectedYear} />;
      case 'rohtak':
        return <IIMRohtakCutoffTable selectedYear={selectedYear} />;
      case 'shillong':
        return <IIMShillongCutoffTable />;
      case 'ranchi':
        return <IIMRanchiCutoffTable selectedYear={selectedYear} />;
      case 'bodhgaya':
        return <IIMBodhgayaCutoffTable selectedYear={selectedYear} />;
      case 'sirmaur':
        return <IIMSirmaurCutoffTable />;
      default:
        return <IIMIndoreCutoffTable selectedYear={selectedYear} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ color: primaryColor }}>
            IIM IPM Cutoff Data
          </h1>
          <p className="text-gray-600 text-lg">Select Institute and Year for Detailed Analysis</p>
        </div>

        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-8">
          {/* City/IIM Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: primaryColor }}>
              Select Institute
            </label>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value as CityKey)}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: primaryColor,
                backgroundColor: 'white'
              }}
            >
              {(Object.entries(iimYearsData) as [CityKey, { name: string; years: number[] }][]).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: primaryColor }}>
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                borderColor: secondaryColor,
                backgroundColor: 'white'
              }}
            >
              {iimYearsData[selectedCity].years.map((year: number) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info Card */}
        <div className="max-w-3xl mx-auto mb-8">
          <div 
            className="rounded-xl p-4 shadow-md"
            style={{ backgroundColor: `${primaryColor}10` }}
          >
            <p className="text-center text-sm text-gray-700">
              <span className="font-semibold" style={{ color: primaryColor }}>
                Currently Viewing:
              </span>{' '}
              {iimYearsData[selectedCity].name} - {selectedYear}
            </p>
          </div>
        </div>

        {/* Render Selected Component */}
        <div>
          {renderCutoffComponent()}
        </div>
      </div>
    </div>
  );
};

export default UnifiedCutoffsPage;