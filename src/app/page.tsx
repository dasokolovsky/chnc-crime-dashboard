'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
// Icons imported but not used - keeping for potential future use
import DateRangePicker from '@/components/DateRangePicker';
import HollywoodMap from '@/components/HollywoodMap';
import CrimeDashboard from '@/components/CrimeDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingState from '@/components/LoadingState';
import { cachedFetch } from '@/utils/apiCache';

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
  error?: string;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [availableDateRange, setAvailableDateRange] = useState<DateRange | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{start: string, end: string} | null>(null);
  const [crimeData, setCrimeData] = useState<CrimeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to update URL with current state
  const updateURL = useCallback((startDate: string, endDate: string) => {
    const params = new URLSearchParams();
    params.set('start', startDate);
    params.set('end', endDate);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router]);

  // Function to get date range from URL or default
  const getInitialDateRange = useCallback((availableRange: DateRange) => {
    const urlStart = searchParams.get('start');
    const urlEnd = searchParams.get('end');

    if (urlStart && urlEnd) {
      // Validate URL dates are within available range
      const startDate = new Date(urlStart);
      const endDate = new Date(urlEnd);
      const minDate = new Date(availableRange.minDate);
      const maxDate = new Date(availableRange.maxDate);

      if (startDate >= minDate && endDate <= maxDate && startDate <= endDate) {
        return { start: urlStart, end: urlEnd };
      }
    }

    // Default to last 30 days if no valid URL params
    const endDate = availableRange.maxDate;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate
    };
  }, [searchParams]);

  // Fetch available date range on component mount
  useEffect(() => {
    const fetchDateRange = async () => {
      try {
        // Cache date range for 1 hour since it doesn't change frequently
        const data = await cachedFetch<{success: boolean, dateRange: DateRange}>('/api/date-range', undefined, undefined, 60 * 60 * 1000);

        if (data.success) {
          setAvailableDateRange(data.dateRange);
          // Get initial date range from URL or use default
          const initialRange = getInitialDateRange(data.dateRange);
          setSelectedDateRange(initialRange);
          // Update URL if using default values
          if (!searchParams.get('start') || !searchParams.get('end')) {
            updateURL(initialRange.start, initialRange.end);
          }
        } else {
          setError('Unable to load available date range from the server. Please check your connection and try again.');
        }
      } catch (err) {
        setError('Cannot connect to the crime data service. Please check your internet connection and try again.');
        console.error('Date range fetch error:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchDateRange();
  }, [getInitialDateRange, searchParams, updateURL]);

  const handleDateRangeChange = (start: string, end: string) => {
    setSelectedDateRange({ start, end });
    setCrimeData(null); // Clear previous data
    updateURL(start, end); // Update URL to reflect new date range
  };

  const handleGenerateReport = async () => {
    if (!selectedDateRange) return;

    setLoading(true);
    setError(null);

    try {
      // Cache crime data for 10 minutes
      const data = await cachedFetch<CrimeData>('/api/crime-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: selectedDateRange.start,
          endDate: selectedDateRange.end,
          method: 'auto'
        }),
      }, undefined, 10 * 60 * 1000);

      if (data.success) {
        setCrimeData(data);
      } else {
        setError(data.error || 'Unable to retrieve crime data for the selected date range. The data may be temporarily unavailable.');
      }
    } catch (err) {
      setError('Failed to generate the crime report. Please check your connection and try again.');
      console.error('Crime data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show initial loading state
  if (initialLoading) {
    return (
      <LoadingState
        fullScreen
        message="Loading CHNC Crime Dashboard"
        submessage="Fetching available data range..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              {/* Logo and Title */}
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <Image
                  src="https://images.squarespace-cdn.com/content/v1/5d659dacea31cf0001a036b4/1605818683199-G7V1ULX6IKMNG1SKZQDF/chnc.png"
                  alt="CHNC logo"
                  width={40}
                  height={40}
                  className="rounded flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                    <span className="sm:hidden">CHNC Crime Dashboard</span>
                    <span className="hidden sm:inline">Hollywood Crime Data Dashboard</span>
                  </h1>
                </div>
              </div>

              {/* Description - condensed on mobile */}
              <p className="text-sm sm:text-base text-gray-700 sm:text-gray-800 mt-2 sm:mt-3 leading-relaxed">
                <span className="sm:hidden">
                  LAPD incident data for CHNC&apos;s Hollywood districts. Select dates to explore patterns.
                </span>
                <span className="hidden sm:inline">
                  This community dashboard shows incidents reported to LAPD for CHNC’s Hollywood districts. Pick a date range to explore patterns and view details.
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <ErrorMessage
            type="error"
            title="Unable to Load Data"
            message={error}
            onRetry={() => {
              setError(null);
              if (selectedDateRange) {
                handleGenerateReport();
              }
            }}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Controls Section */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
              <span>Source: LA City Open Data (LAPD NIBRS)</span>
              <span className="hidden sm:inline mx-2">•</span>
              <span className="text-center">
                Available: {availableDateRange ? `${format(parseISO(availableDateRange.minDate), 'MMM dd, yyyy')} – ${format(parseISO(availableDateRange.maxDate), 'MMM dd, yyyy')}` : '—'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            {/* Date Range Picker */}
            <div className="order-1">
              <div className="flex items-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Select Date Range</h3>
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
            <div className="order-2">
              <div className="flex items-center mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Coverage Area</h3>
              </div>
              <HollywoodMap />
            </div>
          </div>

          {/* Generate Report Button */}
          <div className="mt-6 sm:mt-8 text-center">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedDateRange || loading}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 min-h-[48px] touch-manipulation"
              aria-describedby={!selectedDateRange ? "generate-report-help" : undefined}
              aria-live="polite"
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
            {!selectedDateRange && (
              <p id="generate-report-help" className="mt-2 text-sm text-gray-600">
                Please select a date range to generate a report
              </p>
            )}
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

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
