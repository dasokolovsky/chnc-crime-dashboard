'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
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

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hollywood-crime-data-${data.dateRange.startDate}-to-${data.dateRange.endDate}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Options */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crime Report</h2>
            <p className="mt-1 text-sm text-gray-600">
              {format(parseISO(data.dateRange.startDate), 'MMM dd, yyyy')} - {format(parseISO(data.dateRange.endDate), 'MMM dd, yyyy')}
              <span className="ml-2 font-semibold">{data.count} total incidents</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Summary Dashboard
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Detailed Data ({data.count} records)
            </button>
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
