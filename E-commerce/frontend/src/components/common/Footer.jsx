import React from 'react';
import { Link } from 'react-router-dom';
import { FiSmartphone, FiHeadphones, FiTv, FiWatch, FiShield, FiTruck, FiRefreshCw, FiCreditCard, FiLock, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20 font-sans">
      
      {/* Upper Trust Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9C27B0]/15 text-[#FF4FA3] flex items-center justify-center shrink-0 border border-[#9C27B0]/20">
              <FiTruck size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Free Shipping</p>
              <p className="text-[11px] text-slate-400">On all orders across India</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9C27B0]/15 text-[#FF4FA3] flex items-center justify-center shrink-0 border border-[#9C27B0]/20">
              <FiShield size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">100% Quality Assured</p>
              <p className="text-[11px] text-slate-400">Verified products & sellers</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9C27B0]/15 text-[#FF4FA3] flex items-center justify-center shrink-0 border border-[#9C27B0]/20">
              <FiRefreshCw size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Easy 7-Day Returns</p>
              <p className="text-[11px] text-slate-400">Hassle-free return policy</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#9C27B0]/15 text-[#FF4FA3] flex items-center justify-center shrink-0 border border-[#9C27B0]/20">
              <FiLock size={22} />
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Secure Payment</p>
              <p className="text-[11px] text-slate-400">256-bit Encrypted SSL Checkout</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-black tracking-tight text-[#9C27B0] flex items-center space-x-1">
                <span>
                  ShopIndia
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FF4FA3] inline-block"></span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's favorite online shopping destination. Discover top fashion, electronics, home essentials, and lifestyle trends with unbeatable prices and fast delivery.
            </p>

            <div className="space-y-2 text-xs font-semibold pt-2 text-slate-300">
              <p className="flex items-center space-x-2">
                <FiPhone className="text-[#FF4FA3]" /> <span>Toll-Free Support: 1800-123-9999</span>
              </p>
              <p className="flex items-center space-x-2">
                <FiMail className="text-[#FF4FA3]" /> <span>Support: help@shopindia.com</span>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              {[
                { icon: FaFacebookF, label: 'Facebook' },
                { icon: FaTwitter, label: 'Twitter' },
                { icon: FaInstagram, label: 'Instagram' },
                { icon: FaYoutube, label: 'YouTube' },
                { icon: FaLinkedinIn, label: 'LinkedIn' },
              ].map((soc) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={soc.label}
                    href="#"
                    aria-label={soc.label}
                    className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-[#9C27B0] hover:border-transparent flex items-center justify-center transition-all duration-200"
                  >
                    <Icon size={13} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Top Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Top Categories</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/products" className="hover:text-[#FF4FA3] transition">Fashion & Apparel</Link></li>
              <li><Link to="/products" className="hover:text-[#FF4FA3] transition">Smartphones & Tech</Link></li>
              <li><Link to="/products" className="hover:text-[#FF4FA3] transition">Home & Kitchen</Link></li>
              <li><Link to="/products" className="hover:text-[#FF4FA3] transition">Beauty & Personal Care</Link></li>
              <li><Link to="/products" className="hover:text-[#FF4FA3] transition">Footwear & Accessories</Link></li>
            </ul>
          </div>

          {/* Quick Support Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/orders/my-orders" className="hover:text-[#FF4FA3] transition">Track Orders</Link></li>
              <li><Link to="/profile" className="hover:text-[#FF4FA3] transition">My Account Profile</Link></li>
              <li><Link to="/compare" className="hover:text-[#FF4FA3] transition">Product Comparison</Link></li>
              <li><Link to="/cart" className="hover:text-[#FF4FA3] transition">Shopping Bag & Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#FF4FA3] transition">Saved Wishlist Items</Link></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">Payment Options</h4>
            <p className="text-[11px] text-slate-400">Secure payments via UPI, Credit/Debit Cards, NetBanking & COD.</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {['UPI', 'Razorpay', 'Visa', 'Mastercard', 'NetBanking', 'COD'].map((pay) => (
                <span
                  key={pay}
                  className="px-2.5 py-1 bg-slate-800 border border-slate-700/80 rounded-lg text-[10px] font-bold text-slate-300"
                >
                  {pay}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShopIndia E-Commerce. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:text-slate-300 transition">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition">Security Certified</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;
