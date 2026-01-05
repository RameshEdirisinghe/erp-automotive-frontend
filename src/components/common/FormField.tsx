import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required = false,
  children,
  className = ''
}) => {
  const id = React.useId();

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        {React.isValidElement(children) && React.cloneElement(children as React.ReactElement<any>, { id })}
        {!React.isValidElement(children) && children}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default FormField;
