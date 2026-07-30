import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardStats } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { FiPlus, FiBox, FiFolder, FiShoppingCart, FiZap, FiExternalLink } from 'react-icons/fi';

// Modular Admin Dashboard Sub-Components
import AdminStatCards from '../../components/admin/AdminStatCards.jsx';
import SalesPerformanceChart from '../../components/admin/SalesPerformanceChart.jsx';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable.jsx';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.admin);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !dashboardStats) {
    return <Loader />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Linear/Vercel Style Welcome Hero Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>STORE ENGINE ONLINE</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Welcome back, {user?.name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-lg">
            Monitor real-time electronics sales performance, manage product inventory, and fulfill customer orders.
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/admin/products"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition cursor-pointer"
          >
            <FiPlus className="mr-1.5" size={16} />
            <span>Add New Product</span>
          </Link>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition cursor-pointer"
          >
            <span>Live Store</span>
            <FiExternalLink className="ml-1.5" size={14} />
          </Link>
        </div>
      </section>

      {/* 2. KPI Stat Cards Component */}
      <AdminStatCards stats={dashboardStats} />

      {/* 3. Monthly Sales Analytics Chart Component */}
      <SalesPerformanceChart monthlySalesStats={dashboardStats.monthlySalesStats} />

      {/* 4. Recent Orders Table & CSV Export Component */}
      <RecentOrdersTable recentOrders={dashboardStats.recentOrders} />

    </div>
  );
};

export default Dashboard;
