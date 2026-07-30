import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar.jsx';
import Footer from '../components/common/Footer.jsx';

/**
 * Standard layout for guests and public paths.
 */
const GuestLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default GuestLayout;
