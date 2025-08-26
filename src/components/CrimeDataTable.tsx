'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';

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

  // Get unique values for filters
  const uniqueDistricts = useMemo(() => 
    [...new Set(data.map(record => record.rpt_dist_no))].sort(),
    [data]
  );

  const uniqueCrimeTypes = useMemo(() => 
    [...new Set(data.map(record => record.nibr_description))].sort(),
    [data]
  );

  const uniqueStatuses = useMemo(() => 
    [...new Set(data.map(record => record.status_desc))].sort(),
    [data]
  );

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

      return matchesSearch && matchesDistrict && matchesCrimeType && matchesStatus;
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
  }, [data, searchTerm, selectedDistrict, selectedCrimeType, selectedStatus, sortField, sortDirection]);

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
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search all fields..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Districts</option>
              {uniqueDistricts.map(district => (
                <option key={district} value={district}>District {district}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crime Type</label>
            <select
              value={selectedCrimeType}
              onChange={(e) => {
                setSelectedCrimeType(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Crime Types</option>
              {uniqueCrimeTypes.map(type => (
                <option key={type} value={type}>
                  {type.length > 50 ? type.substring(0, 50) + '...' : type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('date_occ')}
                >
                  Date <SortIcon field="date_occ" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('time_occ')}
                >
                  Time <SortIcon field="time_occ" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rpt_dist_no')}
                >
                  District <SortIcon field="rpt_dist_no" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nibr_description')}
                >
                  Crime Type <SortIcon field="nibr_description" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('premis_desc')}
                >
                  Location <SortIcon field="premis_desc" />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status_desc')}
                >
                  Status <SortIcon field="status_desc" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flags
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.map((record, index) => (
                <tr key={record.uniquenibrno} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(parseISO(record.date_occ), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(record.time_occ)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.rpt_dist_no}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={record.nibr_description}>
                      {record.nibr_description}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={record.premis_desc}>
                      {record.premis_desc}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      record.status_desc.includes('Cleared') 
                        ? 'bg-green-100 text-green-800'
                        : record.status_desc.includes('Investigation')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {record.status_desc}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-1">
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Show</label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border-gray-300 rounded-md text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <label className="text-sm text-gray-700">per page</label>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
