import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute.jsx';
import Sidebar from '../components/admin/Sidebar.jsx';
import Topbar from '../components/admin/Topbar.jsx';

/**
 * Layout specifically guarded for Admin dashboard paths.
 * Fully responsive across mobile, tablet, and desktop viewports.
 */
const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['Admin']}>
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        
        {/* Navigation Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          
          {/* Header Action Bar */}
          <Topbar onMobileMenuToggle={() => setMobileOpen(true)} />

          {/* Dynamic Component Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <Outlet />
          </main>

        </div>

      </div>
    </ProtectedRoute>
  );
};

export default AdminLayout;
