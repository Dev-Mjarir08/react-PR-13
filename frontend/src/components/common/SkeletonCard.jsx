import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-4 animate-pulse space-y-4">
      <div className="w-full aspect-square bg-gray-200 rounded"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonCard;
