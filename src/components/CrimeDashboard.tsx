'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import CrimeSummary from './CrimeSummary';
import CrimeDataTable from './CrimeDataTable';

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

interface CrimeDashboardProps {
  data: CrimeData;
}

export default function CrimeDashboard({ data }: CrimeDashboardProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');

  // Process data for summary statistics
  const summaryStats = useMemo(() => {
    const records = data.data;
    
    // Crime type breakdown
    const crimeTypes = records.reduce((acc, record) => {
      const type = record.nibr_description || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // District breakdown
    const districts = records.reduce((acc, record) => {
      const district = record.rpt_dist_no;
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Crime against breakdown
    const crimeAgainst = records.reduce((acc, record) => {
      const against = record.crime_against || 'Unknown';
      acc[against] = (acc[against] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status breakdown
    const statuses = records.reduce((acc, record) => {
      const status = record.status_desc || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Special crime flags
    const specialCrimes = {
      domesticViolence: records.filter(r => r.domestic_violence_crime === 'Yes').length,
      gangRelated: records.filter(r => r.gang_related_crime === 'Yes').length,
      hateCrime: records.filter(r => r.hate_crime === 'Yes').length,
      transitRelated: records.filter(r => r.transit_related_crime === 'Yes').length,
      homelessVictim: records.filter(r => r.homeless_victim_crime === 'Yes').length,
      homelessSuspect: records.filter(r => r.homeless_suspect_crime === 'Yes').length,
      victimShot: records.filter(r => r.victim_shot === 'Yes').length
    };

    // Daily breakdown for trend analysis
    const dailyBreakdown = records.reduce((acc, record) => {
      const date = record.date_occ.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCrimes: records.length,
      crimeTypes,
      districts,
      crimeAgainst,
      statuses,
      specialCrimes,
      dailyBreakdown,
      dateRange: data.dateRange
    };
  }, [data]);

  const handleExportCSV = () => {
    const csvContent = [
      // Header row
      Object.keys(data.data[0] || {}).join(','),
      // Data rows
      ...data.data.map(record => 
        Object.values(record).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hollywood-crime-data-${data.dateRange.startDate}-to-${data.dateRange.endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    try {
      console.log('Starting PDF export...');

      // Prepare top crime types
      const topCrimeTypes = Object.entries(summaryStats.crimeTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([type, count]) => ({ type, count }));

      // Prepare district breakdown
      const districtBreakdown = Object.entries(summaryStats.districts)
        .sort(([,a], [,b]) => b - a)
        .map(([district, count]) => ({ district, count }));

      // Prepare data for PDF generation
      const pdfData = {
        crimeData: data.data,
        dateRange: {
          start: data.dateRange.startDate,
          end: data.dateRange.endDate
        },
        summary: {
          totalIncidents: data.data.length,
          topCrimeTypes: topCrimeTypes,
          districtBreakdown: districtBreakdown
        }
      };

      console.log('PDF data prepared:', {
        crimeDataLength: pdfData.crimeData.length,
        dateRange: pdfData.dateRange,
        summaryKeys: Object.keys(pdfData.summary)
      });

      // Call the PDF generation API
      console.log('Calling PDF API...');
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      console.log('PDF API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('PDF API error:', errorData);
        throw new Error(`Failed to generate PDF: ${errorData.error || response.statusText}`);
      }

      // Download the PDF
      console.log('Converting response to blob...');
      const blob = await response.blob();
      console.log('Blob created:', { size: blob.size, type: blob.type });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `CHNC-Crime-Report-${data.dateRange.startDate}-to-${data.dateRange.endDate}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('PDF download initiated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Crime Report</h2>
            <div className="mt-1 text-sm text-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span>{format(parseISO(data.dateRange.startDate), 'MMM dd, yyyy')} - {format(parseISO(data.dateRange.endDate), 'MMM dd, yyyy')}</span>
                <span className="sm:ml-2 font-semibold text-emerald-600">{data.count} total incidents</span>
              </div>
            </div>
          </div>

          {/* Export buttons - stack on mobile */}
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-h-[44px] touch-manipulation"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="px-4 py-3" aria-label="Tabs">
            <div className="flex rounded-lg bg-gray-100 p-1 w-full sm:w-auto sm:inline-flex">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 min-h-[44px] touch-manipulation ${
                  activeTab === 'summary'
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 sm:flex-none ml-1 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 min-h-[44px] touch-manipulation ${
                  activeTab === 'details'
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <span className="sm:hidden">Data</span>
                <span className="hidden sm:inline">Data ({data.count})</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'summary' ? (
            <CrimeSummary stats={summaryStats} />
          ) : (
            <CrimeDataTable data={data.data} />
          )}
        </div>
      </div>
    </div>
  );
}
