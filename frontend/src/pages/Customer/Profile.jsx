import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserProfile } from '../../features/auth/authSlice.js';
import { fetchAddresses } from '../../features/address/addressSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { FiUser, FiPackage } from 'react-icons/fi';

// Modular Profile Components
import PersonalDetails from '../../components/profile/PersonalDetails.jsx';
import AddressManager from '../../components/profile/AddressManager.jsx';
import SecuritySettings from '../../components/profile/SecuritySettings.jsx';
import VoucherTray from '../../components/profile/VoucherTray.jsx';
import RecentlyViewed from '../../components/profile/RecentlyViewed.jsx';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, profileLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchAddresses());
  }, [dispatch]);

  if (profileLoading && !user) {
    return <Loader />;
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-16">
      
      {/* Dashboard Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight flex items-center space-x-2">
            <FiUser className="text-[#9C27B0]" />
            <span>My Account Dashboard</span>
          </h1>
          <p className="text-xs text-[#757575] font-medium mt-0.5">Manage profile details, shipping addresses, password, and orders</p>
        </div>
        
        <Link
          to="/orders/my-orders"
          className="inline-flex items-center px-5 py-2.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-xs transition"
        >
          <FiPackage className="mr-1.5" size={16} />
          <span>My Orders & History</span>
        </Link>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Profile & Address Manager */}
        <div className="lg:col-span-2 space-y-8">
          <PersonalDetails />
          <AddressManager />
          <RecentlyViewed />
        </div>

        {/* Right Column: Security & Vouchers */}
        <div className="space-y-8">
          <SecuritySettings />
          <VoucherTray />
        </div>

      </div>

    </div>
  );
};

export default Profile;
