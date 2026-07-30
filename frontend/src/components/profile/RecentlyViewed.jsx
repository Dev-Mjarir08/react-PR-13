import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

const RecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('croma_recently_viewed') || '[]');
      setRecentlyViewed(stored);
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, []);

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 font-sans">
      <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
        <FiClock className="mr-2 text-[#9C27B0]" size={16} /> Recently Browsed Items
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recentlyViewed.slice(0, 4).map((item) => (
          <Link
            key={item._id}
            to={`/products/${item.slug}`}
            className="p-3 border border-slate-100 rounded-2xl bg-slate-50 hover:bg-purple-50/40 hover:border-purple-200 transition text-center space-y-2 block"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center p-1 bg-white rounded-xl">
              <img src={getImageUrl(item.images?.[0]?.url || item.images?.[0] || item.image)} alt="" className="max-h-full max-w-full object-contain" />
            </div>
            <p className="text-[11px] font-bold text-[#212121] line-clamp-1">{item.title}</p>
            <p className="text-xs font-black text-[#9C27B0]">₹{item.price?.toLocaleString('en-IN')}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
