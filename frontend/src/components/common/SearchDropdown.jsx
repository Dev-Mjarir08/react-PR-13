import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios.js';
import { getImageUrl } from '../../utils/imageUtils.js';
import { FiSearch, FiClock, FiTrendingUp, FiX } from 'react-icons/fi';

const SearchDropdown = ({ isMobile = false, onCloseMobile }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularSearches, setPopularSearches] = useState(['Smartphones', 'Laptops', 'OLED TV', 'Headphones', 'Smartwatches']);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('croma_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse recent searches', e);
    }
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API fetch for suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(`/products/search?q=${encodeURIComponent(query.trim())}`);
        const data = response.data.data;
        setSuggestions(data.suggestions || []);
        if (data.popularSearches && data.popularSearches.length > 0) {
          setPopularSearches(data.popularSearches);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Save term to recent searches
  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((s) => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('croma_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent search', e);
    }
  };

  const removeRecentSearch = (e, termToRemove) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem('croma_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update recent searches', e);
    }
  };

  const executeSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    saveRecentSearch(searchTerm);
    setIsOpen(false);
    if (isMobile && onCloseMobile) onCloseMobile();
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleSelectProduct = (slug, productTitle) => {
    saveRecentSearch(productTitle);
    setIsOpen(false);
    if (isMobile && onCloseMobile) onCloseMobile();
    navigate(`/products/${slug}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      handleSelectProduct(suggestions[selectedIndex].slug, suggestions[selectedIndex].title);
    } else {
      executeSearch(query);
    }
  };

  // Keyboard Navigation (Arrow keys, Enter, Escape)
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={wrapperRef} className="w-full relative">
      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands, categories..."
          className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] focus:border-transparent focus:bg-white text-xs sm:text-sm font-medium text-[#212121] placeholder:text-[#757575] shadow-xs transition-all duration-200"
        />
        <FiSearch className="absolute left-4 top-3 text-[#757575] group-focus-within:text-[#9C27B0]" size={18} />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-[#212121] p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
          >
            <FiX size={16} />
          </button>
        )}
      </form>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto animate-in fade-in-50 slide-in-from-top-2 duration-200">
          {loading && (
            <div className="p-5 text-center text-xs text-[#757575] flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-[#9C27B0] border-t-transparent rounded-full animate-spin"></div>
              <span>Searching products...</span>
            </div>
          )}

          {!loading && query.trim() && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm font-bold text-[#212121]">No matching products for "{query}"</p>
              <p className="text-xs text-[#757575] mt-1">Try checking spelling or search for categories like Electronics, Fashion, or Home.</p>
            </div>
          )}

          {/* Direct Suggestions List */}
          {!loading && suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-black text-[#757575] uppercase tracking-wider">
                Matching Products
              </div>
              {suggestions.map((item, index) => {
                const isSelected = index === selectedIndex;
                const price = item.discountPrice > 0 ? item.discountPrice : item.price;
                return (
                  <div
                    key={item._id}
                    onClick={() => handleSelectProduct(item.slug, item.title)}
                    className={`flex items-center space-x-3 px-4 py-2.5 cursor-pointer transition-all ${
                      isSelected ? 'bg-purple-50 text-[#9C27B0]' : 'hover:bg-slate-50 text-[#212121]'
                    }`}
                  >
                    <img
                      src={getImageUrl(item.images)}
                      alt={item.title}
                      className="w-10 h-10 object-contain rounded-xl border border-slate-100 bg-white p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-[#212121] truncate hover:text-[#9C27B0] transition">{item.title}</p>
                      <p className="text-[11px] text-[#757575] font-medium">{item.brand} • {item.category?.name || 'Category'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-extrabold text-[#9C27B0]">₹{price.toLocaleString('en-IN')}</p>
                      {item.discountPrice > 0 && (
                        <p className="text-[10px] text-[#757575] line-through">₹{item.price.toLocaleString('en-IN')}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Default / Initial View when Query is empty */}
          {!query.trim() && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[10px] font-black text-[#757575] uppercase tracking-wider mb-2">
                    <span className="flex items-center space-x-1.5"><FiClock className="text-[#9C27B0]" /> <span>Recent Searches</span></span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => executeSearch(term)}
                        className="flex items-center justify-between px-3 py-1.5 text-xs text-[#212121] hover:bg-purple-50 hover:text-[#9C27B0] rounded-xl cursor-pointer font-medium transition"
                      >
                        <span className="truncate">{term}</span>
                        <button
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-full transition"
                        >
                          <FiX size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches Tags */}
              <div>
                <div className="flex items-center space-x-1.5 text-[10px] font-black text-[#757575] uppercase tracking-wider mb-2.5">
                  <FiTrendingUp className="text-[#FF4FA3]" /> <span>Popular Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeSearch(tag)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-purple-100 hover:text-[#9C27B0] text-xs font-semibold text-[#212121] rounded-full transition cursor-pointer border border-slate-200/60"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
