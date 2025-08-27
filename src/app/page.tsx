'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
// Icons imported but not used - keeping for potential future use
import DateRangePicker from '@/components/DateRangePicker';
import HollywoodMap from '@/components/HollywoodMap';
import CrimeDashboard from '@/components/CrimeDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Image src="https://images.squarespace-cdn.com/content/v1/5d659dacea31cf0001a036b4/1605818683199-G7V1ULX6IKMNG1SKZQDF/chnc.png" alt="CHNC logo" width={40} height={40} className="rounded" />
                <h1 className="text-3xl font-bold text-gray-900">Hollywood Crime Data Dashboard</h1>
              </div>
              <p className="mt-2 text-gray-800">
                This community dashboard shows incidents reported to LAPD for CHNC’s Hollywood districts. Pick a date range to explore patterns and view details.
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
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <span>Source: LA City Open Data (LAPD NIBRS)</span>
              <span className="mx-2">•</span>
              <span>Available: {availableDateRange ? `${format(parseISO(availableDateRange.minDate), 'MMM dd, yyyy')} – ${format(parseISO(availableDateRange.maxDate), 'MMM dd, yyyy')}` : '—'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Date Range Picker */}
            <div>
              <div className="flex items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Date Range</h3>
              </div>
              {availableDateRange ? (
                <DateRangePicker
                  availableRange={availableDateRange}
                  selectedRange={selectedDateRange}
                  onChange={handleDateRangeChange}
                />
              ) : (
                <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
              )}
            </div>

            {/* Hollywood Districts Map */}
            <div>
              <div className="flex items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Coverage Area</h3>
              </div>
              <HollywoodMap />
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedDateRange || loading}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {loading ? (
                <>
                  <LoadingSpinner className="mr-3" />
                  Generating Report...
                </>
              ) : (
                <>
                  Generate Report
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
