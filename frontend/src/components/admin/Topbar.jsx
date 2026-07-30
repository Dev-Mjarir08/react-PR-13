import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice.js';
import { resetCartOnLogout } from '../../features/cart/cartSlice.js';
import { resetWishlistOnLogout } from '../../features/wishlist/wishlistSlice.js';
import { clearCompare } from '../../features/compare/compareSlice.js';
import { FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ConfirmModal from '../common/ConfirmModal.jsx';

const Topbar = ({ onMobileMenuToggle }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    dispatch(logoutUser())
      .unwrap()
      .then(() => {
        dispatch(resetCartOnLogout());
        dispatch(resetWishlistOnLogout());
        dispatch(clearCompare());
        localStorage.removeItem('croma_recently_viewed');
        localStorage.removeItem('croma_compare_items');
        toast.success('Logged out successfully.');
        navigate('/');
      });
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 shrink-0">
      
      {/* Page Context & Mobile Menu Button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-slate-700 hover:text-blue-600 p-2 border border-slate-200 rounded-xl transition cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <FiMenu size={20} />
        </button>

        <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
          Management Console
        </h2>
      </div>

      {/* Admin actions */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        
        {/* Profile info */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 p-2 rounded-full text-slate-700 shrink-0">
            <FiUser size={16} />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-none truncate max-w-[120px]">
              {user?.name}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Administrator
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Logout */}
        <button
          onClick={handleLogoutClick}
          className="flex items-center text-xs font-bold text-slate-700 hover:text-red-600 transition cursor-pointer shrink-0"
        >
          <FiLogOut className="mr-1" size={16} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>

      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Admin Sign Out Confirmation"
        message="Are you sure you want to log out of the management console?"
        confirmText="Yes, Sign Out"
        cancelText="No, Stay Logged In"
        variant="danger"
      />

    </header>
  );
};

export default Topbar;
