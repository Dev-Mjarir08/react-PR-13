import React from 'react';

/**
 * Modern minimalist loader component.
 */
const Loader = ({ fullPage = true }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium text-sm tracking-wide">Loading...</p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};

export default Loader;
