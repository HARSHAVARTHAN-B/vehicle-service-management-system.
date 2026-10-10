import React from 'react';

export const LoadingSpinner = ({ text = "Loading data from server..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-xs font-semibold text-slate-500 animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
