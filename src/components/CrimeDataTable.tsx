'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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

interface CrimeDataTableProps {
  data: CrimeRecord[];
}

type SortField = keyof CrimeRecord;
type SortDirection = 'asc' | 'desc';

export default function CrimeDataTable({ data }: CrimeDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date_occ');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCrimeType, setSelectedCrimeType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Get unique values for filters with counts
  const uniqueDistricts = useMemo(() => {
    const counts = data.reduce((acc, record) => {
      acc[record.rpt_dist_no] = (acc[record.rpt_dist_no] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([district, count]) => ({ value: district, count }));
  }, [data]);

  const uniqueCrimeTypes = useMemo(() => {
    const counts = data.reduce((acc, record) => {
      acc[record.nibr_description] = (acc[record.nibr_description] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .map(([type, count]) => ({ value: type, count }));
  }, [data]);

  const uniqueStatuses = useMemo(() => {
    const counts = data.reduce((acc, record) => {
      acc[record.status_desc] = (acc[record.status_desc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .map(([status, count]) => ({ value: status, count }));
  }, [data]);

  const uniqueLocations = useMemo(() => {
    const counts = data.reduce((acc, record) => {
      acc[record.premis_desc] = (acc[record.premis_desc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .map(([location, count]) => ({ value: location, count }));
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter(record => {
      const matchesSearch = !searchTerm ||
        Object.values(record).some(value =>
          value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDistrict = !selectedDistrict || record.rpt_dist_no === selectedDistrict;
      const matchesCrimeType = !selectedCrimeType || record.nibr_description === selectedCrimeType;
      const matchesStatus = !selectedStatus || record.status_desc === selectedStatus;
      const matchesLocation = !selectedLocation || record.premis_desc === selectedLocation;

      return matchesSearch && matchesDistrict && matchesCrimeType && matchesStatus && matchesLocation;
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [data, searchTerm, selectedDistrict, selectedCrimeType, selectedStatus, selectedLocation, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDistrict('');
    setSelectedCrimeType('');
    setSelectedStatus('');
    setSelectedLocation('');
    setCurrentPage(1);
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr.length !== 4) return timeStr;
    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    return `${hours}:${minutes}`;
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-400">↕</span>;
    return sortDirection === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search all fields..."
                className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 sm:text-sm text-gray-900 placeholder:text-gray-500 bg-white transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">District</label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full py-2.5 pl-3 pr-10 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 sm:text-sm text-gray-900 bg-white appearance-none transition-all duration-200 cursor-pointer hover:border-gray-400"
              >
                <option value="">All Districts ({data.length})</option>
                {uniqueDistricts.map(({ value: district, count }) => (
                  <option key={district} value={district}>
                    District {district} ({count})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Crime Type</label>
            <div className="relative">
              <select
                value={selectedCrimeType}
                onChange={(e) => {
                  setSelectedCrimeType(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full py-2.5 pl-3 pr-10 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 sm:text-sm text-gray-900 bg-white appearance-none transition-all duration-200 cursor-pointer hover:border-gray-400"
              >
                <option value="">All Crime Types ({data.length})</option>
                {uniqueCrimeTypes.map(({ value: type, count }) => (
                  <option key={type} value={type} title={type}>
                    {type.length > 35 ? type.substring(0, 35) + '...' : type} ({count})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full py-2.5 pl-3 pr-10 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 sm:text-sm text-gray-900 bg-white appearance-none transition-all duration-200 cursor-pointer hover:border-gray-400"
              >
                <option value="">All Statuses ({data.length})</option>
                {uniqueStatuses.map(({ value: status, count }) => (
                  <option key={status} value={status}>{status} ({count})</option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full py-2.5 pl-3 pr-10 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 sm:text-sm text-gray-900 bg-white appearance-none transition-all duration-200 cursor-pointer hover:border-gray-400"
              >
                <option value="">All Locations ({data.length})</option>
                {uniqueLocations.map(({ value: loc, count }) => (
                  <option key={loc} value={loc} title={loc}>
                    {loc.length > 30 ? loc.substring(0, 30) + '...' : loc} ({count})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-800">
            Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} records
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {/* Mobile-friendly horizontal scroll with shadow indicators */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]"
                  onClick={() => handleSort('date_occ')}
                >
                  Date <SortIcon field="date_occ" />
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[80px]"
                  onClick={() => handleSort('time_occ')}
                >
                  Time <SortIcon field="time_occ" />
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[80px]"
                  onClick={() => handleSort('rpt_dist_no')}
                >
                  District <SortIcon field="rpt_dist_no" />
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[150px]"
                  onClick={() => handleSort('nibr_description')}
                >
                  Crime Type <SortIcon field="nibr_description" />
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[120px]"
                  onClick={() => handleSort('premis_desc')}
                >
                  Location <SortIcon field="premis_desc" />
                </th>
                <th
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]"
                  onClick={() => handleSort('status_desc')}
                >
                  Status <SortIcon field="status_desc" />
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider min-w-[80px]">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((record, index) => (
                <tr key={record.uniquenibrno} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    <div className="sm:hidden">{format(parseISO(record.date_occ), 'MMM dd')}</div>
                    <div className="hidden sm:block">{format(parseISO(record.date_occ), 'MMM dd, yyyy')}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {formatTime(record.time_occ)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                    {record.rpt_dist_no}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    <div className="truncate max-w-[120px] sm:max-w-xs" title={record.nibr_description}>
                      {record.nibr_description}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    <div className="truncate max-w-[100px] sm:max-w-xs" title={record.premis_desc}>
                      {record.premis_desc}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                      record.status_desc.includes('Cleared')
                        ? 'bg-green-100 text-green-800'
                        : record.status_desc.includes('Investigation')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className="sm:hidden">
                        {record.status_desc.includes('Cleared') ? 'Cleared' :
                         record.status_desc.includes('Investigation') ? 'Invest.' : 'Open'}
                      </span>
                      <span className="hidden sm:inline">{record.status_desc}</span>
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {record.domestic_violence_crime === 'Yes' && (
                        <span className="inline-flex px-1 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded" title="Domestic Violence">
                          DV
                        </span>
                      )}
                      {record.gang_related_crime === 'Yes' && (
                        <span className="inline-flex px-1 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded" title="Gang Related">
                          Gang
                        </span>
                      )}
                      {record.hate_crime === 'Yes' && (
                        <span className="inline-flex px-1 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded" title="Hate Crime">
                          Hate
                        </span>
                      )}
                      {record.transit_related_crime === 'Yes' && (
                        <span className="inline-flex px-1 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded" title="Transit Related">
                          Transit
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200 rounded-b-lg">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-900">Show</label>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="py-2 pl-3 pr-10 rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 focus:ring-2 focus:ring-opacity-20 text-sm text-gray-900 bg-white appearance-none transition-all duration-200 cursor-pointer hover:border-gray-400"
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <label className="text-sm font-medium text-gray-900">per page</label>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm space-x-1" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2.5 rounded-lg border text-sm font-medium shadow-sm transition-all duration-200 ${
                          pageNum === currentPage
                            ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500 ring-opacity-20'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
