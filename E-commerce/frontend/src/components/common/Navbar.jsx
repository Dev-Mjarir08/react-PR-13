import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice.js';
import { fetchCart, resetCartOnLogout } from '../../features/cart/cartSlice.js';
import { fetchWishlist, resetWishlistOnLogout } from '../../features/wishlist/wishlistSlice.js';
import { fetchCategories } from '../../features/category/categorySlice.js';
import { clearCompare } from '../../features/compare/compareSlice.js';
import {
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSearch,
  FiLogOut,
  FiMenu,
  FiX,
  FiLayers,
  FiPackage,
  FiMapPin,
  FiLock,
  FiCheckCircle,
  FiChevronRight,
  FiShield,
  FiGrid,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import ConfirmModal from './ConfirmModal.jsx';
import SearchDropdown from './SearchDropdown.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { categories } = useSelector((state) => state.category);
  const { compareItems } = useSelector((state) => state.compare);

  // Fetch quantities on login/mount
  useEffect(() => {
    dispatch(fetchCategories());
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Lock body scrolling when profile drawer is open
  useEffect(() => {
    if (profileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [profileDrawerOpen]);

  const handleLogoutClick = () => {
    setProfileDrawerOpen(false);
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

  const handleDrawerNavigate = (path) => {
    setProfileDrawerOpen(false);
    navigate(path);
  };

  const cartCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistCount = wishlist?.products?.length || 0;
  const compareCount = compareItems?.length || 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      
      {/* Top Banner Ticker (Meesho / Indian Platform style) */}
      <div className="bg-[#9C27B0] text-white text-[11px] font-semibold py-1.5 px-4 text-center tracking-wide overflow-hidden flex items-center justify-between sm:justify-center space-x-4">
        <div className="flex items-center justify-center space-x-6 mx-auto">
          <span className="flex items-center space-x-1"><FiShield className="inline" /> <span>100% Quality Assured</span></span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center space-x-1"><FiCheckCircle className="inline" /> <span>7 Days Easy Returns</span></span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:flex items-center space-x-1"><FiMapPin className="inline" /> <span>Free Delivery Across India</span></span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4 sm:gap-6">
          
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="text-xl sm:text-2xl font-black tracking-tight text-[#9C27B0] flex items-center space-x-1 group">
              <span className="group-hover:scale-105 transition-transform">
                ShopIndia
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FF4FA3] inline-block animate-pulse"></span>
            </Link>
          </div>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchDropdown />
          </div>

          {/* Action Navigation icons */}
          <div className="hidden md:flex items-center space-x-6">
            
            {/* All Products */}
            <Link to="/products" className="text-xs font-bold uppercase tracking-wider text-[#212121] hover:text-[#9C27B0] transition">
              All Products
            </Link>

            {/* Compare */}
            <Link to="/compare" className="text-[#212121] hover:text-[#9C27B0] relative transition p-1.5 rounded-full hover:bg-purple-50" title="Compare Items">
              <FiLayers size={21} />
              {compareCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4FA3] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="text-[#212121] hover:text-[#9C27B0] relative transition p-1.5 rounded-full hover:bg-purple-50" title="Wishlist">
              <FiHeart size={21} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF4FA3] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="text-[#212121] hover:text-[#9C27B0] relative transition p-1.5 rounded-full hover:bg-purple-50" title="Cart">
              <FiShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9C27B0] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Action */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {user?.role !== 'Admin' && (
                  <Link
                    to="/orders/my-orders"
                    className="flex items-center space-x-1 text-xs font-bold text-[#212121] hover:text-[#9C27B0] transition"
                    title="My Orders"
                  >
                    <FiPackage size={17} />
                    <span>Orders</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(true)}
                  className="flex items-center space-x-2 border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 px-3 py-1.5 rounded-full transition cursor-pointer"
                  title="Open Account Menu"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-purple-100 border border-[#9C27B0]/30 shrink-0">
                    <img
                      src={getImageUrl(user?.avatar)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#212121] max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-[#9C27B0] to-[#FF4FA3] hover:opacity-95 text-white text-xs font-bold rounded-full shadow-xs hover:shadow-md transition duration-200">
                Sign In
              </Link>
            )}

          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center space-x-3">
            <Link to="/cart" className="text-[#212121] relative p-1">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#9C27B0] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#212121] hover:text-[#9C27B0] cursor-pointer p-1"
            >
              {mobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </button>
          </div>

        </div>
      </div>

      {/* Category Bar for Desktop */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 py-2 overflow-x-auto no-scrollbar text-xs font-semibold text-[#212121]">
            <Link to="/products" className="hover:text-[#9C27B0] whitespace-nowrap transition">
              All Categories
            </Link>
            {categories && categories.slice(0, 7).map((cat) => (
              <Link
                key={cat._id}
                to={`/products?category=${cat.slug || cat._id}`}
                className="hover:text-[#9C27B0] whitespace-nowrap transition text-[#757575] hover:text-[#212121]"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Sidebar Drawer Overlay (Portaled to document.body) */}
      {profileDrawerOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
              onClick={() => setProfileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Drawer Content */}
            <div className="relative w-80 max-w-full bg-white h-screen shadow-2xl z-[110] flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div>
                <div className="bg-[#9C27B0] text-white p-6 relative">
                  <button
                    onClick={() => setProfileDrawerOpen(false)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white p-1 transition cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>

                  <div className="flex items-center space-x-4 pt-2">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-white/20 border-2 border-white shadow-md shrink-0">
                      <img
                        src={getImageUrl(user?.avatar)}
                        alt={user?.name || 'User Profile'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      <h3 className="text-sm font-extrabold text-white truncate">{user?.name}</h3>
                      <p className="text-[11px] text-purple-100 truncate">{user?.email}</p>
                      <div className="pt-1">
                        <span className="inline-flex items-center text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                          <FiCheckCircle className="mr-1" /> {user?.role || 'Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Menu List */}
                <div className="p-4 space-y-1">
                  <p className="px-3 text-[10px] font-black text-[#757575] uppercase tracking-widest pb-1">Account Operations</p>

                  {user?.role === 'Admin' && (
                    <button
                      onClick={() => handleDrawerNavigate('/admin/dashboard')}
                      className="w-full p-3.5 mb-3 rounded-2xl bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-extrabold flex items-center justify-between shadow-xs transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
                          <FiGrid size={18} />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black tracking-wide text-white">Admin Control Panel</p>
                          <p className="text-[10px] text-purple-100 font-medium">Go to Admin Dashboard</p>
                        </div>
                      </div>
                      <FiChevronRight size={16} className="text-white" />
                    </button>
                  )}

                  {[
                    {
                      label: 'My Account Profile',
                      icon: FiUser,
                      path: '/profile',
                      desc: 'Personal details & preferences',
                    },
                    {
                      label: 'My Orders & Tracking',
                      icon: FiPackage,
                      path: '/orders/my-orders',
                      desc: 'Track shipments & invoices',
                    },
                    {
                      label: 'Saved Delivery Addresses',
                      icon: FiMapPin,
                      path: '/profile',
                      desc: 'Manage home & office locations',
                    },
                    {
                      label: 'Saved Wishlist Items',
                      icon: FiHeart,
                      path: '/wishlist',
                      badge: wishlistCount,
                      desc: 'Bookmarked products',
                    },
                    {
                      label: 'Product Comparison',
                      icon: FiLayers,
                      path: '/compare',
                      badge: compareCount,
                      desc: 'Side-by-side device specs',
                    },
                    {
                      label: 'Security & Password',
                      icon: FiLock,
                      path: '/profile',
                      desc: 'Password & account settings',
                    },
                  ].map((menuItem, idx) => {
                    const Icon = menuItem.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleDrawerNavigate(menuItem.path)}
                        className="w-full p-3 rounded-xl flex items-center justify-between text-left hover:bg-purple-50 hover:text-[#9C27B0] transition group cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#757575] flex items-center justify-center group-hover:bg-[#9C27B0] group-hover:text-white transition">
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#212121] group-hover:text-[#9C27B0] transition">{menuItem.label}</p>
                            <p className="text-[10px] text-[#757575] font-medium">{menuItem.desc}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {menuItem.badge !== undefined && menuItem.badge > 0 && (
                            <span className="bg-[#FF4FA3] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                              {menuItem.badge}
                            </span>
                          )}
                          <FiChevronRight size={16} className="text-[#757575] group-hover:text-[#9C27B0] group-hover:translate-x-0.5 transition" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drawer Logout */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleLogoutClick}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <FiLogOut size={16} />
                  <span>Sign Out of Account</span>
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-4">
          <SearchDropdown isMobile={true} onCloseMobile={() => setMobileMenuOpen(false)} />

          <div className="flex flex-col space-y-3 pt-2">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-[#212121] hover:text-[#9C27B0]"
            >
              All Products
            </Link>
            <Link
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-[#212121] hover:text-[#9C27B0] flex items-center space-x-2"
            >
              <FiLayers /> <span>Compare ({compareCount})</span>
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-bold text-[#212121] hover:text-[#9C27B0] flex items-center space-x-2"
            >
              <FiHeart /> <span>Wishlist ({wishlistCount})</span>
            </Link>

            {isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setProfileDrawerOpen(true);
                  }}
                  className="text-left text-sm font-bold text-[#9C27B0] flex items-center space-x-2 pt-2 border-t border-slate-100"
                >
                  <FiUser className="text-[#9C27B0]" /> <span>Account Menu ({user?.name})</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogoutClick();
                  }}
                  className="text-left text-sm font-bold text-red-600 hover:text-red-800 flex items-center space-x-2"
                >
                  <FiLogOut /> <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-center text-xs font-bold rounded-full block shadow-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Sign Out Confirmation"
        message="Are you sure you want to log out of your ShopIndia account?"
        confirmText="Yes, Sign Out"
        cancelText="No, Stay Logged In"
        variant="danger"
      />
    </header>
  );
};

export default Navbar;
