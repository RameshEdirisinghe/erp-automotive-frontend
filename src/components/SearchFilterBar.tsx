import React, { useState } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { FormInput, FormField } from './common';

interface FilterConfig {
  searchQuery: string;
  selectedField: string;
  startDate: string;
  endDate: string;
}

interface SearchFilterBarProps {
  config: FilterConfig;
  onSearchChange: (query: string) => void;
  onFieldChange: (field: string) => void;
  onDateRangeChange: (dates: { startDate: string; endDate: string }) => void;
  fieldOptions?: string[];
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  config,
  onSearchChange,
  onFieldChange,
  onDateRangeChange,
  fieldOptions = ['All Fields', 'Invoice ID', 'Customer Name', 'Status']
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-gray-400">
          Search by invoice ID, customer name, vehicle number, or amount
        </h2>
      </div>

      {/* Search Input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Search Box */}
        <div className="lg:col-span-2">
          <FormField label="Search">
            <FormInput
              placeholder="Type invoice ID, customer name, vehicle number..."
              value={config.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </FormField>
        </div>

        {/* Field Filter */}
        <FormField label="Filter by Field">
          <div className="relative">
            <select
              value={config.selectedField}
              onChange={(e) => onFieldChange(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer hover:border-[#475569] transition-all"
            >
              {fieldOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </FormField>
      </div>

      {/* Date Range - Collapsible on Mobile */}
      <div className="border-t border-[#334155] pt-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden flex items-center gap-2 text-gray-300 hover:text-gray-200 transition-colors mb-4"
        >
          <Calendar className="w-4 h-4" />
          <span className="text-sm font-medium">Filter by Date</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isExpanded ? 'block' : 'hidden lg:grid'}`}>
          <FormField label="Start Date">
            <FormInput
              type="date"
              value={config.startDate}
              onChange={(e) => onDateRangeChange({ startDate: e.target.value, endDate: config.endDate })}
            />
          </FormField>

          <FormField label="End Date">
            <FormInput
              type="date"
              value={config.endDate}
              onChange={(e) => onDateRangeChange({ startDate: config.startDate, endDate: e.target.value })}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterBar;
