import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  FiGrid,
  FiBox,
  FiFolder,
  FiLayers,
  FiTag,
  FiShoppingCart,
  FiUsers,
  FiPercent,
  FiImage,
  FiHome,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from 'react-icons/fi';

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { name: 'Products', path: '/admin/products', icon: FiBox },
    { name: 'Categories', path: '/admin/categories', icon: FiFolder },
    { name: 'Subcategories', path: '/admin/subcategories', icon: FiLayers },
    { name: 'Brands', path: '/admin/brands', icon: FiTag },
    { name: 'Orders', path: '/admin/orders', icon: FiShoppingCart },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Coupons', path: '/admin/coupons', icon: FiPercent },
    { name: 'Banners', path: '/admin/banners', icon: FiImage },
  ];

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const sidebarInnerContent = (
    <div className="flex flex-col h-full bg-slate-950 text-slate-400">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950 shrink-0">
        <Link to="/admin/dashboard" onClick={handleNavClick} className="flex items-center space-x-2 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-blue-600/30">
            C
          </div>
          {(!collapsed || mobileOpen) && (
            <span className="text-base font-black tracking-tight text-white">
              CROMA <span className="text-blue-500 text-xs font-bold uppercase tracking-widest ml-1">PRO</span>
            </span>
          )}
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 transition cursor-pointer"
          >
            <FiX size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-3 text-xs font-bold rounded-2xl transition duration-200 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                    : 'hover:bg-slate-900 hover:text-slate-200'
                } ${collapsed && !mobileOpen ? 'justify-center' : ''}`
              }
              title={collapsed && !mobileOpen ? item.name : undefined}
            >
              <Icon size={18} className={collapsed && !mobileOpen ? '' : 'mr-3'} />
              {(!collapsed || mobileOpen) && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Return Store */}
      <div className="p-4 border-t border-slate-900 shrink-0">
        <Link
          to="/"
          onClick={handleNavClick}
          className={`flex items-center px-3 py-2.5 text-xs font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 rounded-2xl transition border border-slate-800 ${
            collapsed && !mobileOpen ? 'justify-center' : ''
          }`}
          title="Return to Store"
        >
          <FiHome size={16} className={collapsed && !mobileOpen ? '' : 'mr-2'} />
          {(!collapsed || mobileOpen) && <span>View Store</span>}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className={`hidden md:flex flex-col min-h-screen border-r border-slate-800/80 transition-all duration-300 relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-full p-1 shadow-lg transition cursor-pointer z-40"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>

        {sidebarInnerContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] md:hidden flex">
            <div
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            />
            <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-[110] animate-in slide-in-from-left duration-300">
              {sidebarInnerContent}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Sidebar;
