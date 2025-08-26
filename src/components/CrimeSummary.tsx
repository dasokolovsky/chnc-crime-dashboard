'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface SummaryStats {
  totalCrimes: number;
  crimeTypes: Record<string, number>;
  districts: Record<string, number>;
  crimeAgainst: Record<string, number>;
  statuses: Record<string, number>;
  specialCrimes: {
    domesticViolence: number;
    gangRelated: number;
    hateCrime: number;
    transitRelated: number;
    homelessVictim: number;
    homelessSuspect: number;
    victimShot: number;
  };
  dailyBreakdown: Record<string, number>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface CrimeSummaryProps {
  stats: SummaryStats;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

export default function CrimeSummary({ stats }: CrimeSummaryProps) {
  // Prepare data for charts
  const topCrimeTypes = Object.entries(stats.crimeTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({
      name: name.length > 30 ? name.substring(0, 30) + '...' : name,
      count,
      fullName: name
    }));

  const districtData = Object.entries(stats.districts)
    .sort(([,a], [,b]) => b - a)
    .map(([district, count]) => ({
      district,
      count,
      percentage: ((count / stats.totalCrimes) * 100).toFixed(1)
    }));

  const crimeAgainstData = Object.entries(stats.crimeAgainst)
    .map(([type, count]) => ({
      name: type,
      value: count,
      percentage: ((count / stats.totalCrimes) * 100).toFixed(1)
    }));

  const dailyTrendData = Object.entries(stats.dailyBreakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date,
      count,
      formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  return (
    <div className="space-y-8">
      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Incidents</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalCrimes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">🚨</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Domestic Violence</p>
              <p className="text-2xl font-bold text-red-900">{stats.specialCrimes.domesticViolence}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Cleared Cases</p>
              <p className="text-2xl font-bold text-green-900">
                {Object.entries(stats.statuses)
                  .filter(([status]) => status.includes('Cleared'))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">🏠</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Homeless Related</p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.specialCrimes.homelessVictim + stats.specialCrimes.homelessSuspect}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Crime Types */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Crime Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCrimeTypes} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => [value, 'Count']}
                labelFormatter={(label) => {
                  const item = topCrimeTypes.find(d => d.name === label);
                  return item?.fullName || label;
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crime Against Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crime Classification</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={crimeAgainstData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {crimeAgainstData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Count']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Breakdown and Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* District Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">District Distribution</h3>
          <div className="space-y-3">
            {districtData.map((district, index) => (
              <div key={district.district} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium">District {district.district}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{district.count}</div>
                  <div className="text-sm text-gray-500">{district.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Crime Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="formattedDate"
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => {
                  const item = dailyTrendData.find(d => d.formattedDate === label);
                  return item ? new Date(item.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : label;
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Special Crime Categories */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Crime Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(stats.specialCrimes).map(([key, count]) => {
            const labels = {
              domesticViolence: 'Domestic Violence',
              gangRelated: 'Gang Related',
              hateCrime: 'Hate Crime',
              transitRelated: 'Transit Related',
              homelessVictim: 'Homeless Victim',
              homelessSuspect: 'Homeless Suspect',
              victimShot: 'Victim Shot'
            };
            
            return (
              <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-600 mt-1">{labels[key as keyof typeof labels]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
