import React from 'react';
import { FiUsers, FiBox, FiDollarSign, FiShoppingBag, FiAlertCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const AdminStatCards = ({ stats }) => {
  if (!stats) return null;

  const {
    usersCount,
    productsCount,
    ordersCount,
    outOfStockCount,
    totalRevenue,
  } = stats;

  const cards = [
    {
      name: 'Total Revenue',
      value: `₹${totalRevenue?.toLocaleString('en-IN') || 0}`,
      change: '+14.2% MoM',
      isPositive: true,
      icon: FiDollarSign,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      name: 'Total Orders',
      value: ordersCount || 0,
      change: '+8.6% MoM',
      isPositive: true,
      icon: FiShoppingBag,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    },
    {
      name: 'Catalog Products',
      value: productsCount || 0,
      change: 'Active SKUs',
      isPositive: true,
      icon: FiBox,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      name: 'Active Customers',
      value: usersCount || 0,
      change: '+12 New Users',
      isPositive: true,
      icon: FiUsers,
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    },
    {
      name: 'Stock Alerts',
      value: outOfStockCount || 0,
      change: outOfStockCount > 0 ? 'Requires Action' : 'All In Stock',
      isPositive: outOfStockCount === 0,
      icon: FiAlertCircle,
      color: outOfStockCount > 0 ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.name}
            className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col justify-between space-y-3 shadow-sm hover:shadow-md hover:border-blue-200 transition duration-300 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.name}</span>
              <div className={`p-2.5 rounded-2xl border ${card.color} group-hover:scale-110 transition duration-300`}>
                <Icon size={18} />
              </div>
            </div>

            <div>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{card.value}</p>
              <div className="flex items-center space-x-1 pt-1">
                {card.isPositive ? (
                  <FiTrendingUp className="text-emerald-500" size={12} />
                ) : (
                  <FiTrendingDown className="text-red-500" size={12} />
                )}
                <span className={`text-[10px] font-bold ${card.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {card.change}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStatCards;
