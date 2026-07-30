import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { FiTrendingUp, FiCalendar } from 'react-icons/fi';

const SalesPerformanceChart = ({ monthlySalesStats }) => {
  const [filterQuarter, setFilterQuarter] = useState('ALL');

  if (!monthlySalesStats || monthlySalesStats.length === 0) return null;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let rawData = monthlySalesStats.map((item) => ({
    monthNum: item._id,
    name: monthNames[item._id - 1] || `Month ${item._id}`,
    Sales: item.totalSales,
    Orders: item.orderCount
  }));

  // Apply Quarter Filter
  if (filterQuarter === 'Q1') rawData = rawData.filter((d) => d.monthNum >= 1 && d.monthNum <= 3);
  if (filterQuarter === 'Q2') rawData = rawData.filter((d) => d.monthNum >= 4 && d.monthNum <= 6);
  if (filterQuarter === 'Q3') rawData = rawData.filter((d) => d.monthNum >= 7 && d.monthNum <= 9);
  if (filterQuarter === 'Q4') rawData = rawData.filter((d) => d.monthNum >= 10 && d.monthNum <= 12);

  const totalPeriodSales = rawData.reduce((acc, d) => acc + d.Sales, 0);

  return (
    <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="text-blue-600" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Revenue & Growth Trajectory</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Total Filtered Volume: <span className="font-extrabold text-slate-900">₹{totalPeriodSales.toLocaleString('en-IN')}</span>
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
          {['ALL', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
            <button
              key={q}
              onClick={() => setFilterQuarter(q)}
              className={`px-3 py-1 text-[11px] font-black rounded-xl transition cursor-pointer ${
                filterQuarter === q
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {q === 'ALL' ? 'All Months' : q}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full text-xs font-bold text-slate-400">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rawData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
              formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales Volume']}
            />
            <Bar dataKey="Sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default SalesPerformanceChart;
