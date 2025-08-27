'use client';

import { useState, useEffect } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import DatePicker from 'react-datepicker';
import { CalendarIcon } from '@heroicons/react/24/outline';
import 'react-datepicker/dist/react-datepicker.css';

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

    // Allow longer date ranges for historical analysis
    // No maximum limit - users can analyze multi-year trends

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
    <div className="space-y-4 sm:space-y-6">
      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-900 mb-2">
            Start Date
          </label>
          <div className="relative">
            <DatePicker
              id="start-date"
              selected={startDate ? parseISO(startDate) : null}
              onChange={(date) => {
                const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
                handleStartDateChange(dateStr);
              }}
              minDate={parseISO(availableRange.minDate)}
              maxDate={parseISO(availableRange.maxDate)}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select start date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-3 pr-10 py-3 text-gray-900 placeholder:text-gray-500 min-h-[48px] touch-manipulation"
              wrapperClassName="w-full"
              popperClassName="react-datepicker-popper"
              calendarClassName="react-datepicker-calendar"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label htmlFor="end-date" className="block text-sm font-medium text-gray-900 mb-2">
            End Date
          </label>
          <div className="relative">
            <DatePicker
              id="end-date"
              selected={endDate ? parseISO(endDate) : null}
              onChange={(date) => {
                const dateStr = date ? format(date, 'yyyy-MM-dd') : '';
                handleEndDateChange(dateStr);
              }}
              minDate={parseISO(availableRange.minDate)}
              maxDate={parseISO(availableRange.maxDate)}
              dateFormat="MMM dd, yyyy"
              placeholderText="Select end date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-3 pr-10 py-3 text-gray-900 placeholder:text-gray-500 min-h-[48px] touch-manipulation"
              wrapperClassName="w-full"
              popperClassName="react-datepicker-popper"
              calendarClassName="react-datepicker-calendar"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
          {error}
        </div>
      )}

      {/* Preset Buttons - responsive layout */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
        <div className="grid grid-cols-2 sm:inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden gap-0">
          <button
            type="button"
            onClick={() => setPresetRange(7)}
            className="px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px] touch-manipulation"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() => setPresetRange(30)}
            className="px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 border-l border-gray-200 min-h-[44px] touch-manipulation"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => setPresetRange(90)}
            className="px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 border-l border-gray-200 sm:border-t-0 min-h-[44px] touch-manipulation"
          >
            Last 90 days
          </button>
          <button
            type="button"
            onClick={() => setPresetRange(365)}
            className="px-3 py-2.5 text-xs sm:text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 border-l border-gray-200 sm:border-t-0 min-h-[44px] touch-manipulation"
          >
            Last year
          </button>
        </div>
      </div>

      {/* Available Range Info */}
      <div className="text-xs text-gray-700">
        Available data: {format(parseISO(availableRange.minDate), 'MMM dd, yyyy')} - {format(parseISO(availableRange.maxDate), 'MMM dd, yyyy')}
      </div>
    </div>
  );
}
