'use client';

import { useState, useEffect } from 'react';
import DateRangePicker from '@/components/DateRangePicker';
import HollywoodMap from '@/components/HollywoodMap';
import CrimeDashboard from '@/components/CrimeDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowRightCircleIcon } from '@heroicons/react/24/solid';

interface DateRange {
  minDate: string;
  maxDate: string;
}

interface CrimeRecord {
  area: string;
  area_name: string;
  caseno: string;
  crime_against: string;
  date_occ: string;
  date_rptd: string;
  domestic_violence_crime: string;
  gang_related_crime: string;
  group: string;
  hate_crime: string;
  homeless_arrestee_crime: string;
  homeless_suspect_crime: string;
  homeless_victim_crime: string;
  nibr_code: string;
  nibr_description: string;
  premis_cd: string;
  premis_desc: string;
  rpt_dist_no: string;
  status: string;
  status_desc: string;
  time_occ: string;
  totaloffensecount: string;
  totalvictimcount: string;
  transit_related_crime: string;
  uniquenibrno: string;
  victim_shot: string;
  weapon_desc?: string;
  weapon_used_cd?: string;
}

interface CrimeData {
  success: boolean;
  count: number;
  data: CrimeRecord[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
  districts: string[];
}

export default function Home() {
  const [availableDateRange, setAvailableDateRange] = useState<DateRange | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{start: string, end: string} | null>(null);
  const [crimeData, setCrimeData] = useState<CrimeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available date range on component mount
  useEffect(() => {
    const fetchDateRange = async () => {
      try {
        const response = await fetch('/api/date-range');
        const data = await response.json();

        if (data.success) {
          setAvailableDateRange(data.dateRange);
          // Set default to last 30 days
          const endDate = data.dateRange.maxDate;
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 30);
          setSelectedDateRange({
            start: startDate.toISOString().split('T')[0],
            end: endDate
          });
        } else {
          setError('Failed to load available date range');
        }
      } catch (err) {
        setError('Failed to connect to API');
        console.error('Date range fetch error:', err);
      }
    };

    fetchDateRange();
  }, []);

  const handleDateRangeChange = (start: string, end: string) => {
    setSelectedDateRange({ start, end });
    setCrimeData(null); // Clear previous data
  };

  const handleGenerateReport = async () => {
    if (!selectedDateRange) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crime-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedDateRange.start,
          endDate: selectedDateRange.end,
          method: 'auto'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCrimeData(data);
      } else {
        setError(data.error || 'Failed to fetch crime data');
      }
    } catch (err) {
      setError('Failed to generate report');
      console.error('Crime data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Meta Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-emerald-50 to-blue-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-xs text-gray-600 flex items-center justify-between">
          <span>Data source: LA City Open Data (LAPD NIBRS)</span>
          <a href="https://dev.socrata.com/foundry/data.lacity.org/y8y3-fqfu" target="_blank" rel="noreferrer" className="text-emerald-700 hover:text-emerald-800">View dataset →</a>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hollywood Crime Data Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Crime reporting for Central Hollywood Neighborhood Council districts
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Crime Report</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Date Range Picker */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Date Range</h3>
              {availableDateRange ? (
                <DateRangePicker
                  availableRange={availableDateRange}
                  selectedRange={selectedDateRange}
                  onChange={handleDateRangeChange}
                />
              ) : (
                <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
              )}
            </div>

            {/* Hollywood Districts Map */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Coverage Area</h3>
              <HollywoodMap />
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedDateRange || loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  Generate Crime Report
                  <ArrowRightCircleIcon className="ml-2 h-5 w-5 text-white/90" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {crimeData && (
          <CrimeDashboard data={crimeData} />
        )}
      </main>
    </div>
  );
}
