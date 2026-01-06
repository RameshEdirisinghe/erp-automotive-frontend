import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const FormInput: React.FC<FormInputProps> = ({
  error = false,
  icon,
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>}
      <input
        {...props}
        disabled={disabled}
        className={`w-full bg-[#0f172a] border rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          icon ? 'pl-10' : ''
        } ${
          error
            ? 'border-red-500/50 focus:ring-red-500'
            : 'border-[#334155] hover:border-[#475569]'
        } ${className}`}
      />
    </div>
  );
};

export default FormInput;
