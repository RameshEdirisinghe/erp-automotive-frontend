import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({
  size = 'md',
  text
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizeMap[size]} border-3 border-[#334155] border-t-blue-500 rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-400">{text}</p>}
    </div>
  );
};

export const SkeletonLoader: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-12 bg-[#334155]/50 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
