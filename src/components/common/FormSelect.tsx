import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
  error?: boolean;
  icon?: React.ReactNode;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  options,
  error = false,
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
      <select
        {...props}
        disabled={disabled}
        className={`w-full bg-[#0f172a] border rounded-lg px-4 py-2.5 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          icon ? 'pl-10' : ''
        } ${
          error
            ? 'border-red-500/50 focus:ring-red-500'
            : 'border-[#334155] hover:border-[#475569]'
        } ${className}`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default FormSelect;
