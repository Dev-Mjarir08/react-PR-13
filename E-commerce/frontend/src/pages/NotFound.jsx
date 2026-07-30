import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowRight } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <FiAlertTriangle className="text-blue-600 animate-bounce" size={48} />
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">404 - Page Not Found</h1>
      <p className="text-sm text-gray-500 font-semibold max-w-sm">
        The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <div className="pt-4">
        <Link to="/" className="inline-flex items-center py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition">
          Return to Store <FiArrowRight className="ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
