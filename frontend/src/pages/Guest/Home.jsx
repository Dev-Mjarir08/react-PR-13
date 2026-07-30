import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProducts } from '../../features/product/productSlice.js';
import { fetchCategories } from '../../features/category/categorySlice.js';
import HeroSection from '../../components/home/HeroSection.jsx';
import ProductCard from '../../components/product/ProductCard.jsx';
import Modal from '../../components/common/Modal.jsx';
import Loader from '../../components/common/Loader.jsx';
import axiosInstance from '../../api/axios.js';
import { toast } from 'react-toastify';
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiCreditCard,
  FiSmartphone,
  FiTv,
  FiHeadphones,
  FiWatch,
  FiCheckCircle,
  FiStar,
  FiMail,
  FiZap,
  FiGift,
  FiCpu,
  FiInfo,
  FiUser,
  FiPackage,
  FiMapPin,
  FiHeart,
  FiLayers,
  FiGrid,
  FiAlertCircle,
} from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

// Predefined Croma Hero Slides fallback
const HERO_SLIDES = [
  {
    id: 'slide-1',
    badge: 'NEW RELEASE 2026',
    title: 'Next-Gen Ultra OLED Smart TVs',
    subtitle: 'Experience 4K Quantum Color Depth with Dolby Atmos 3D Surround Sound.',
    cta: 'Explore Flagship TVs',
    link: '/products?category=Televisions',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1400',
    discount: 'Up to 35% OFF',
  },
  {
    id: 'slide-2',
    badge: 'PRO PERFORMANCE',
    title: 'M3 Pro Laptops & Workstations',
    subtitle: 'Extreme multi-core processing power with all-day battery life.',
    cta: 'Shop Laptops',
    link: '/products?category=Laptops',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1400',
    discount: 'Flat ₹15,000 Cashback',
  },
  {
    id: 'slide-3',
    badge: 'AUDIO REVOLUTION',
    title: 'Active Noise-Cancelling Headphones',
    subtitle: 'Pure studio acoustics engineered for audiophiles and daily commuters.',
    cta: 'Browse Audio',
    link: '/products?category=Audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1400',
    discount: 'Starting @ ₹2,999',
  },
];

// Brand logos for infinite marquee
const BRANDS = [
  { name: 'Apple', logo: ' Apple' },
  { name: 'Samsung', logo: 'SAMSUNG' },
  { name: 'Sony', logo: 'SONY' },
  { name: 'LG', logo: 'LG Electronics' },
  { name: 'Dell', logo: 'DELL' },
  { name: 'HP', logo: 'HP Pro' },
  { name: 'Bose', logo: 'BOSE' },
  { name: 'OnePlus', logo: 'ONEPLUS' },
];

const Home = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { products, loading: productsLoading } = useSelector((state) => state.product);
  const { categories, loading: categoriesLoading } = useSelector((state) => state.category);
  const { wishlist } = useSelector((state) => state.wishlist);

  const [adminBanners, setAdminBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Horizontal scroll container ref for trending carousel & categories
  const scrollRef = useRef(null);
  const categoryScrollRef = useRef(null);

  // Flash sale countdown timer state (Hours, Minutes, Seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 42, seconds: 18 });

  // Fetch Admin Banners dynamically from API
  useEffect(() => {
    axiosInstance
      .get('/banners')
      .then((res) => {
        const list = res.data.data || [];
        if (list.length > 0) {
          setAdminBanners(list);
        }
      })
      .catch((err) => console.log('Banner fetch error:', err));
  }, []);

  // Compute active slides (prefer Admin Banners from database if created)
  const activeSlides =
    adminBanners.length > 0
      ? adminBanners.map((b) => ({
          id: b._id,
          badge: 'OFFICIAL PROMOTION',
          title: b.title,
          subtitle: 'Discover exclusive deals and flagship electronics on our store.',
          cta: 'Shop Now',
          link: b.link || '/products',
          image: getImageUrl(b),
          discount: 'Limited Time Deal',
        }))
      : HERO_SLIDES;

  // Autoplay hero slider with infinite loop
  useEffect(() => {
    if (activeSlides.length === 0) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [activeSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const activeSlide = activeSlides[currentSlide] || activeSlides[0];

  // Flash Sale countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load backend products & categories
  useEffect(() => {
    dispatch(fetchProducts({ limit: 12 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryScroll = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to Croma VIP Deals!');
    setNewsletterEmail('');
  };

  if (productsLoading || categoriesLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-10 md:space-y-14 bg-[#FAFAFA] min-h-screen text-[#212121] font-sans pb-10">
      
      {/* 1. Cinematic Hero Section */}
      <HeroSection adminBanners={adminBanners} />

      {/* 2. User Profile Overview & Account Dashboard Section */}
      {isAuthenticated && user ? (
        <section className="bg-white border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
            
            {/* User Details */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-purple-100 border-2 border-[#9C27B0]/30 shadow-sm shrink-0">
                <img
                  src={getImageUrl(user?.avatar)}
                  alt={user?.name || 'User Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-[#212121] tracking-tight">
                    Welcome back, {user?.name}! 👋
                  </h2>
                  {user?.role === 'Admin' ? (
                    <span className="inline-flex items-center text-[10px] font-black text-white bg-[#9C27B0] px-2.5 py-0.5 rounded-full shadow-2xs">
                      <FiGrid className="mr-1" size={12} /> Admin Administrator
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
                      Customer Profile
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#757575] font-medium">{user?.email}</p>

                <div className="flex items-center space-x-3 pt-0.5">
                  {user?.isVerified ? (
                    <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <FiCheckCircle className="mr-1 text-emerald-600" size={13} /> Verified Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <FiAlertCircle className="mr-1 text-amber-600" size={13} /> Unverified Email
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {user?.role === 'Admin' && (
                <Link
                  to="/admin/dashboard"
                  className="px-5 py-2.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-extrabold rounded-full shadow-xs transition flex items-center space-x-1.5"
                >
                  <FiGrid size={15} />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <Link
                to="/profile"
                className="px-5 py-2.5 bg-slate-900 hover:bg-[#9C27B0] text-white text-xs font-extrabold rounded-full shadow-xs transition flex items-center space-x-1.5"
              >
                <FiUser size={15} />
                <span>My Account Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Quick Profile Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/profile"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#9C27B0] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FiUser size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#212121] group-hover:text-[#9C27B0] transition">Personal Details</p>
                <p className="text-[10px] text-[#757575]">Edit details & avatar</p>
              </div>
            </Link>

            <Link
              to="/orders/my-orders"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#9C27B0] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FiPackage size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#212121] group-hover:text-[#9C27B0] transition">My Orders</p>
                <p className="text-[10px] text-[#757575]">View & track orders</p>
              </div>
            </Link>

            <Link
              to="/profile"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#9C27B0] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FiMapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#212121] group-hover:text-[#9C27B0] transition">Delivery Addresses</p>
                <p className="text-[10px] text-[#757575]">Manage locations</p>
              </div>
            </Link>

            <Link
              to="/wishlist"
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition group flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#FF4FA3] flex items-center justify-center mb-3 group-hover:scale-105 transition">
                <FiHeart size={20} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#212121] group-hover:text-[#9C27B0] transition">My Wishlist</p>
                <p className="text-[10px] text-[#757575]">{wishlist?.products?.length || 0} Saved items</p>
              </div>
            </Link>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-purple-50 via-white to-pink-50 border border-purple-100 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C27B0] bg-purple-100 px-3 py-1 rounded-full">SHOPINDIA MEMBER ACCOUNT</span>
            <h2 className="text-lg sm:text-xl font-black text-[#212121] tracking-tight">Sign in to access your profile & exclusive offers</h2>
            <p className="text-xs text-[#757575] max-w-lg">Track orders, manage shipping addresses, save favorite products to wishlist, and view member coupons.</p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-gradient-to-r from-[#9C27B0] to-[#FF4FA3] text-white text-xs font-bold rounded-full shadow-xs hover:opacity-95 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-white text-[#212121] border border-slate-200 hover:border-purple-300 text-xs font-bold rounded-full transition shadow-2xs"
            >
              Create Account
            </Link>
          </div>
        </section>
      )}

      {/* 2. Meesho-Style Circular Category Navigation */}
      <section className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#212121] tracking-tight">Shop Top Categories</h2>
            <p className="text-xs text-[#757575] font-medium">Explore handpicked collections across India</p>
          </div>
          <Link to="/products" className="text-xs font-bold text-[#9C27B0] hover:text-[#7B1FA2] flex items-center space-x-1">
            <span>View All</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-2">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug || cat._id}`}
              className="flex flex-col items-center space-y-2 shrink-0 group cursor-pointer w-20 sm:w-24 text-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-50 border-2 border-purple-100 group-hover:border-[#9C27B0] p-3 flex items-center justify-center transition-all duration-300 shadow-xs group-hover:scale-105 group-hover:bg-purple-50/50">
                <img
                  src={getImageUrl(cat, 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&q=80&w=400')}
                  alt={cat.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&q=80&w=400';
                  }}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition duration-300"
                />
              </div>
              <span className="text-xs font-bold text-[#212121] group-hover:text-[#9C27B0] transition truncate max-w-full">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale Live Countdown Section */}
      <section className="bg-gradient-to-r from-slate-900 via-[#7B1FA2] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-[#FF4FA3]/20 border border-[#FF4FA3]/40 text-[#FF4FA3] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              <FiZap className="animate-bounce" />
              <span>SUPER FLASH DEALS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Daily Lightning Discounts</h2>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-3 bg-slate-950/60 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
            <FiClock size={18} className="text-[#FF4FA3] animate-spin" />
            <span className="text-xs font-bold text-slate-300">Offers End In:</span>
            <div className="flex items-center space-x-1 font-mono font-black text-base sm:text-lg text-white">
              <span className="bg-[#9C27B0] px-2 py-0.5 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-[#9C27B0] px-2 py-0.5 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-[#FF4FA3] px-2 py-0.5 rounded-lg">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Flash Sale Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <div key={product._id} className="bg-white text-[#212121] rounded-2xl overflow-hidden shadow-md p-4 space-y-3 relative group border border-slate-100">
              <span className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#FF4FA3] to-[#E91E63] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">
                HOT DEAL
              </span>
              <div className="bg-slate-50 rounded-xl aspect-square overflow-hidden flex items-center justify-center p-4">
                <img
                  src={getImageUrl(product.images?.[0]?.url || product.images?.[0] || product.image)}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain group-hover:scale-108 transition duration-300"
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#9C27B0] uppercase tracking-widest">{product.brand || 'ShopIndia'}</p>
                <Link to={`/products/${product.slug}`} className="text-xs font-bold text-[#212121] line-clamp-1 hover:text-[#9C27B0] transition">
                  {product.title}
                </Link>
                <div className="flex items-baseline space-x-2">
                  <span className="text-base font-black text-[#212121]">₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-[#757575] line-through">₹{Math.round(product.price * 1.35).toLocaleString('en-IN')}</span>
                </div>
              </div>
              {/* Claimed Stock Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-bold text-[#757575]">
                  <span>Stock Claimed</span>
                  <span className="text-[#FF4FA3]">84%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#9C27B0] to-[#FF4FA3] h-full w-[84%]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Trending Best Sellers Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#212121]">Trending Products</h2>
            <p className="text-xs font-medium text-[#757575] mt-0.5">Most popular choices among shoppers this week</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 border border-slate-200 rounded-full hover:bg-purple-50 hover:border-purple-200 transition cursor-pointer text-[#212121]"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 border border-slate-200 rounded-full hover:bg-purple-50 hover:border-purple-200 transition cursor-pointer text-[#212121]"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-4"
        >
          {products.map((product) => (
            <div key={product._id} className="min-w-[260px] sm:min-w-[280px] max-w-[280px]">
              <ProductCard product={product} onQuickView={handleQuickView} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Featured Offer Banners Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between h-72 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="relative z-10 space-y-2 max-w-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FF4FA3]">INDIAN FESTIVAL SPECIAL</span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">Ethnic Fashion & Modern Apparel</h3>
            <p className="text-xs text-purple-200">Up to 60% OFF on top designer collections.</p>
          </div>
          <div className="relative z-10 pt-4">
            <Link to="/products" className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-[#9C27B0] to-[#FF4FA3] text-white text-xs font-bold rounded-full shadow-md hover:opacity-95 transition">
              <span>Explore Collection</span>
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#FCE4EC] via-white to-[#F3E5F5] text-[#212121] rounded-3xl p-8 flex flex-col justify-between h-72 relative overflow-hidden shadow-xs border border-purple-100">
          <div className="relative z-10 space-y-2 max-w-xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C27B0]">TECH & SMART LIFE</span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#212121] leading-tight">Smart Electronics & Accessories</h3>
            <p className="text-xs text-[#757575]">Authentic devices with brand warranty and free shipping.</p>
          </div>
          <div className="relative z-10 pt-4">
            <Link to="/products" className="inline-flex items-center px-6 py-2.5 bg-[#212121] hover:bg-[#9C27B0] text-white text-xs font-bold rounded-full shadow-md transition">
              <span>Shop Electronics</span>
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Why Choose Us Section */}
      <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#212121]">Why Shop With Us?</h2>
          <p className="text-xs text-[#757575] font-medium">Delivering trust, affordability, and quality to millions of customers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FiShield, title: '100% Quality Inspected', desc: 'Sourced directly from verified brand sellers across India.' },
            { icon: FiTruck, title: 'Free Nationwide Delivery', desc: 'Fast, secure shipping covering all pincodes.' },
            { icon: FiCreditCard, title: 'Flexible Payments', desc: 'Supports UPI, Cards, NetBanking, and Cash on Delivery.' },
            { icon: FiCheckCircle, title: '7 Days Return Policy', desc: 'Hassle-free replacement and instant refund assistance.' },
          ].map((feat, idx) => {
            const IconComponent = feat.icon;
            return (
              <div key={idx} className="p-6 bg-[#FAFAFA] rounded-2xl border border-slate-100 text-center space-y-3 hover:bg-purple-50/50 hover:border-purple-200 transition">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#9C27B0] to-[#FF4FA3] text-white flex items-center justify-center mx-auto shadow-sm">
                  <IconComponent size={22} />
                </div>
                <h3 className="text-sm font-bold text-[#212121]">{feat.title}</h3>
                <p className="text-xs text-[#757575] font-medium leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Newsletter Section */}
      <section className="bg-gradient-to-r from-slate-900 via-[#7B1FA2] to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <div className="w-14 h-14 bg-white/10 text-[#FF4FA3] border border-white/20 rounded-full flex items-center justify-center mx-auto">
            <FiMail size={26} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Subscribe for Exclusive Deals</h2>
            <p className="text-xs text-purple-100 font-medium">Get secret promo codes & special festive sale updates delivered to your inbox.</p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              className="w-full px-4 py-3 rounded-full bg-slate-900/90 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF4FA3]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs transition cursor-pointer shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Quick View Modal */}
      <Modal isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)}>
        {quickViewProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="bg-slate-50 h-64 md:h-full min-h-[280px] flex items-center justify-center p-6 overflow-hidden rounded-2xl border border-slate-100">
              <img
                src={getImageUrl(quickViewProduct.images?.[0]?.url || quickViewProduct.images?.[0] || quickViewProduct.image)}
                alt={quickViewProduct.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-[#9C27B0] uppercase tracking-widest">{quickViewProduct.brand || 'ShopIndia'}</span>
                <h2 className="text-lg font-bold text-[#212121] leading-tight">{quickViewProduct.title}</h2>
                <p className="text-xs text-[#757575] line-clamp-4">{quickViewProduct.description}</p>
              </div>
              <div className="space-y-4">
                <div className="border-t border-b border-slate-100 py-3 flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-[#212121]">₹{quickViewProduct.price.toLocaleString('en-IN')}</span>
                </div>
                <Link
                  to={`/products/${quickViewProduct.slug}`}
                  onClick={() => setQuickViewOpen(false)}
                  className="block text-center py-3 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-xs transition"
                >
                  View Details Page
                </Link>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Home;
