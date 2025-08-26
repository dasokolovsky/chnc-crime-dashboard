'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';

interface DateRange {
  minDate: string;
  maxDate: string;
}

interface DateRangePickerProps {
  availableRange: DateRange;
  selectedRange: { start: string; end: string } | null;
  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({ availableRange, selectedRange, onChange }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRange) {
      setStartDate(selectedRange.start);
      setEndDate(selectedRange.end);
    }
  }, [selectedRange]);

  const validateAndUpdate = (newStart: string, newEnd: string) => {
    setError(null);

    // Basic validation
    if (!newStart || !newEnd) {
      setError('Both start and end dates are required');
      return;
    }

    const startDateObj = parseISO(newStart);
    const endDateObj = parseISO(newEnd);
    const minDateObj = parseISO(availableRange.minDate);
    const maxDateObj = parseISO(availableRange.maxDate);

    if (!isValid(startDateObj) || !isValid(endDateObj)) {
      setError('Invalid date format');
      return;
    }

    if (startDateObj > endDateObj) {
      setError('Start date must be before end date');
      return;
    }

    if (startDateObj < minDateObj) {
      setError(`Start date cannot be before ${format(minDateObj, 'MMM dd, yyyy')}`);
      return;
    }

    if (endDateObj > maxDateObj) {
      setError(`End date cannot be after ${format(maxDateObj, 'MMM dd, yyyy')}`);
      return;
    }

    // Calculate date range in days
    const diffTime = endDateObj.getTime() - startDateObj.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      setError('Date range cannot exceed 365 days');
      return;
    }

    onChange(newStart, newEnd);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate) {
      validateAndUpdate(value, endDate);
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (startDate) {
      validateAndUpdate(startDate, value);
    }
  };

  const setPresetRange = (days: number) => {
    const end = availableRange.maxDate;
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(end);
    validateAndUpdate(startStr, end);
  };

  return (
    <div className="space-y-4">
      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            min={availableRange.minDate}
            max={availableRange.maxDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            min={availableRange.minDate}
            max={availableRange.maxDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPresetRange(7)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Last 7 days
        </button>
        <button
          type="button"
          onClick={() => setPresetRange(30)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Last 30 days
        </button>
        <button
          type="button"
          onClick={() => setPresetRange(90)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Last 90 days
        </button>
        <button
          type="button"
          onClick={() => setPresetRange(365)}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Last year
        </button>
      </div>

      {/* Available Range Info */}
      <div className="text-xs text-gray-500">
        Available data: {format(parseISO(availableRange.minDate), 'MMM dd, yyyy')} - {format(parseISO(availableRange.maxDate), 'MMM dd, yyyy')}
      </div>
    </div>
  );
}
