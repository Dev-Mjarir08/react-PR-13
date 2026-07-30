import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiDownload, FiShoppingBag, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RecentOrdersTable = ({ recentOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const exportOrdersCSV = () => {
    if (!recentOrders || recentOrders.length === 0) {
      toast.warning('No orders data available to export.');
      return;
    }
    const headers = ['Order ID,Customer,Paid,Status,Total Price,Created At\n'];
    const rows = recentOrders.map(
      (o) => `${o._id},"${o.user?.name || 'Customer'}",${o.isPaid ? 'Yes' : 'No'},${o.status || o.orderStatus || 'Pending'},${o.totalPrice},${o.createdAt}`
    );
    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `croma-orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success('Orders CSV Report downloaded!');
  };

  let filteredOrders = recentOrders || [];

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (o) => o._id.toLowerCase().includes(q) || (o.user?.name || '').toLowerCase().includes(q)
    );
  }

  if (statusFilter !== 'ALL') {
    filteredOrders = filteredOrders.filter(
      (o) => (o.status || o.orderStatus || 'pending').toLowerCase() === statusFilter.toLowerCase()
    );
  }

  const getStatusBadgeClass = (statusStr) => {
    const st = (statusStr || 'pending').toLowerCase();
    if (st === 'delivered') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (st === 'shipped') return 'text-blue-700 bg-blue-50 border-blue-200';
    if (st === 'processing' || st === 'pending') return 'text-amber-700 bg-amber-50 border-amber-200';
    if (st === 'cancelled' || st === 'returned') return 'text-red-700 bg-red-50 border-red-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  return (
    <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <FiShoppingBag className="text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Recent Platform Transactions</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">Live customer checkout activity & order fulfillment statuses</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={exportOrdersCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiDownload size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center py-8 text-slate-400 text-xs font-semibold">No transactions match search criteria.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Order Reference</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Fulfillment Status</th>
                <th className="px-6 py-3 text-right">Order Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const currentStatus = order.status || order.orderStatus || 'Pending';
                return (
                  <tr key={order._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">#{order._id.substring(0, 10)}...</td>
                    <td className="px-6 py-4 text-slate-600 font-bold">{order.user?.name || 'Customer'}</td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Paid</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Pending COD</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getStatusBadgeClass(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default RecentOrdersTable;
