'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList, AreaChart, Area, Legend } from 'recharts';
import { parseISO, startOfWeek, format } from 'date-fns';

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

  // Weekly trend: group dailyBreakdown into weeks starting on Monday
  const weeklyAggregates = Object.entries(stats.dailyBreakdown).reduce<Record<string, number>>(
    (acc, [date, count]) => {
      const weekStart = format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      acc[weekStart] = (acc[weekStart] || 0) + count;
      return acc;
    },
    {}
  );

  const weeklyTrendData = Object.entries(weeklyAggregates)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, count]) => ({
      weekStart,
      count,
      formattedWeek: format(parseISO(weekStart), 'MMM dd')
    }));

  // Status distribution
  const statusData = Object.entries(stats.statuses)
    .sort(([, a], [, b]) => b - a)
    .map(([status, count]) => ({ status, count }));


  return (
    <div className="space-y-8">
      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-sm">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-blue-700">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCrimes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 bg-rose-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-sm">🚨</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-rose-700">Domestic Violence</p>
              <p className="text-2xl font-bold text-gray-900">{stats.specialCrimes.domesticViolence}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 bg-emerald-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-sm">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Cleared Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.entries(stats.statuses)
                  .filter(([status]) => status.includes('Cleared'))
                  .reduce((sum, [, count]) => sum + count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-9 h-9 bg-violet-600 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-sm">🏠</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-xs uppercase tracking-wide text-violet-700">Homeless Related</p>
              <p className="text-2xl font-bold text-gray-900">
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
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topCrimeTypes} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: '#374151' }} />
              <YAxis type="category" dataKey="name" width={180} tick={{ fill: '#374151', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value, 'Count']}
                labelFormatter={(label) => {
                  const item = topCrimeTypes.find(d => d.name === label);
                  return item?.fullName || label;
                }}
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
              />
              <Bar dataKey="count" fill="#1e40af" radius={[4, 4, 4, 4]}>
                <LabelList dataKey="count" position="right" style={{ fill: '#111827', fontSize: 12 }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crime Against Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crime Classification</h3>

      {/* Status Distribution and Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData.map(d => ({ ...d, percent: (d.count / stats.totalCrimes) * 100 }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: { payload?: { status?: string; name?: string }; percent?: number; name?: string }) => {
                  const status = props?.payload?.status ?? props?.name ?? '';
                  const p = (props?.percent ?? 0) * 100;
                  if (p < 4) return '';
                  return `${status}: ${p.toFixed(1)}%`;
                }}
                outerRadius={80}
                dataKey="count"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`status-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => {
                  const total = stats.totalCrimes || 1;
                  const pct = (Number(value) / total) * 100;
                  return [`${value} (${pct.toFixed(1)}%)`, 'Count'];
                }}
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly Trend */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Crime Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weeklyTrendData}>
              <defs>
                <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis dataKey="formattedWeek" tick={{ fill: '#374151' }} fontSize={12} />
              <YAxis tick={{ fill: '#374151' }} />
              <Tooltip
                labelFormatter={(label) => {
                  const item = weeklyTrendData.find(d => d.formattedWeek === label);
                  return item ? `Week of ${format(parseISO(item.weekStart), 'MMM dd, yyyy')}` : label;
                }}
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
              />
              <Area type="monotone" dataKey="count" stroke="#1e40af" fill="url(#weeklyGradient)" strokeWidth={2} />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
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
              <Tooltip
                formatter={(value) => [value, 'Count']}
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Breakdown and Daily Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* District Distribution */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">District Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={districtData} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: '#374151' }} />
              <YAxis type="category" dataKey="district" width={120} tick={{ fill: '#374151', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value, 'Count']}
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 4, 4]}>
                <LabelList
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  valueAccessor={(entry: any) => `${(entry.count ?? entry.value) as number} (${(entry.percentage ?? entry.payload?.percentage) as string}%)` }
                  position="right"
                  style={{ fill: '#111827', fontSize: 12 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Trend */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Crime Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={dailyTrendData}>
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="formattedDate"
                fontSize={12}
                tick={{ fill: '#374151' }}
              />
              <YAxis tick={{ fill: '#374151' }} />
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
                contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
                labelStyle={{ color: '#111827' }}
                itemStyle={{ color: '#111827' }}
              />
              <Area type="monotone" dataKey="count" stroke="#1e40af" fill="url(#dailyGradient)" strokeWidth={2} />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            </AreaChart>
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
              <div key={key} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
