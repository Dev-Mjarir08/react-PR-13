import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../../features/product/productSlice.js';
import { fetchCategories } from '../../features/category/categorySlice.js';
import { fetchSubCategories } from '../../features/subcategory/subCategorySlice.js';
import { fetchBrands } from '../../features/brand/brandSlice.js';
import ProductCard from '../../components/product/ProductCard.jsx';
import Modal from '../../components/common/Modal.jsx';
import Loader from '../../components/common/Loader.jsx';
import SkeletonCard from '../../components/common/SkeletonCard.jsx';
import {
  FiFilter,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiCheck,
  FiSliders,
  FiSmartphone,
  FiTv,
  FiMonitor,
  FiTag,
  FiStar,
  FiDollarSign,
  FiFolder,
  FiGrid,
  FiCpu,
} from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

// E-commerce Specification Presets
const SPEC_PRESETS = {
  ram: ['4GB', '6GB', '8GB', '12GB', '16GB', '32GB', '64GB'],
  storage: ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB SSD'],
  processor: ['Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'Apple M2', 'Apple M3', 'AMD Ryzen 7', 'Snapdragon 8 Gen 2'],
  gpu: ['NVIDIA RTX 3050', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 4080', 'NVIDIA RTX 4090'],
  screenSize: ['32 Inches', '43 Inches', '55 Inches', '65 Inches', '75 Inches & Above'],
  displayType: ['OLED', 'QLED', '4K Ultra HD', 'AMOLED', 'Full HD'],
};

const PRICE_PRESETS = [
  { label: 'Under ₹10,000', min: '', max: '10000' },
  { label: '₹10,000 - ₹25,000', min: '10000', max: '25000' },
  { label: '₹25,000 - ₹50,000', min: '25000', max: '50000' },
  { label: '₹50,000 - ₹1,00,000', min: '50000', max: '100000' },
  { label: 'Above ₹1,00,000', min: '100000', max: '' },
];

const Products = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, loading, pagination } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { subCategories } = useSelector((state) => state.subCategory);
  const { brands: fetchedBrands } = useSelector((state) => state.brand);

  // Synchronized Filter Parameters
  const categoryId = searchParams.get('category') || '';
  const subCategory = searchParams.get('subCategory') || '';
  const searchVal = searchParams.get('search') || '';
  const brandVal = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const ratingVal = searchParams.get('rating') || '';
  const inStock = searchParams.get('inStock') || '';
  const discountVal = searchParams.get('discount') || '';
  const colorVal = searchParams.get('color') || '';
  const storageVal = searchParams.get('storage') || '';
  const ramVal = searchParams.get('ram') || '';
  const processorVal = searchParams.get('processor') || '';
  const screenSizeVal = searchParams.get('screenSize') || '';
  const displayTypeVal = searchParams.get('displayType') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch products and categories when URL params change
  useEffect(() => {
    const params = {
      page,
      limit: 12,
      sort,
    };
    if (categoryId) params.category = categoryId;
    if (subCategory) params.subCategory = subCategory;
    if (searchVal) params.search = searchVal;
    if (brandVal) params.brand = brandVal;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (ratingVal) params.rating = ratingVal;
    if (inStock) params.inStock = inStock;
    if (discountVal) params.discount = discountVal;
    if (colorVal) params.color = colorVal;
    if (storageVal) params.storage = storageVal;
    if (ramVal) params.ram = ramVal;
    if (processorVal) params.processor = processorVal;
    if (screenSizeVal) params.screenSize = screenSizeVal;
    if (displayTypeVal) params.displayType = displayTypeVal;

    dispatch(fetchProducts(params));
    dispatch(fetchCategories());
    dispatch(fetchSubCategories(categoryId));
    dispatch(fetchBrands(categoryId));
  }, [
    dispatch,
    categoryId,
    subCategory,
    searchVal,
    brandVal,
    minPrice,
    maxPrice,
    ratingVal,
    inStock,
    discountVal,
    colorVal,
    storageVal,
    ramVal,
    processorVal,
    screenSizeVal,
    displayTypeVal,
    sort,
    page,
  ]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const removeCategoryFilter = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    newParams.delete('category');
    newParams.delete('subCategory');
    setSearchParams(newParams);
  };

  const handleMultiSelectToggle = (key, valToToggle) => {
    const currentStr = searchParams.get(key) || '';
    const currentArr = currentStr ? currentStr.split(',').map((s) => s.trim()).filter(Boolean) : [];
    let updated;
    if (currentArr.some((item) => item.toLowerCase() === valToToggle.toLowerCase())) {
      updated = currentArr.filter((item) => item.toLowerCase() !== valToToggle.toLowerCase());
    } else {
      updated = [...currentArr, valToToggle];
    }
    updateFilters(key, updated.join(','));
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  // Find active category details
  const activeCategoryObj = categories.find(
    (c) =>
      c._id === categoryId ||
      c.slug?.toLowerCase() === categoryId.toLowerCase() ||
      c.name?.toLowerCase() === categoryId.toLowerCase()
  );
  const activeCategoryName = (activeCategoryObj?.name || categoryId || '').toLowerCase().trim();

  // Category Types Detection
  const isSmartphone = ['smartphone', 'mobiles', 'mobile', 'phone'].some((t) => activeCategoryName.includes(t));
  const isLaptop = ['laptop', 'laptops', 'computer', 'macbook', 'pc'].some((t) => activeCategoryName.includes(t));
  const isGaming = ['gaming', 'game', 'console', 'playstation', 'xbox'].some((t) => activeCategoryName.includes(t));
  const isTelevision = ['television', 'televisions', 'tv', 'display'].some((t) => activeCategoryName.includes(t));
  const isAudio = ['audio', 'headphones', 'earbuds', 'speaker', 'soundbar'].some((t) => activeCategoryName.includes(t));

  // Dynamic Brands Extractor (DB + active products)
  const apiBrandNames = (fetchedBrands || []).map((b) => b.name);
  const productBrands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  const availableBrands = Array.from(new Set([...apiBrandNames, ...productBrands])).sort();

  // Dynamic RAM & Storage Extractor from catalog items
  const extractedRAMs = Array.from(
    new Set([
      ...SPEC_PRESETS.ram,
      ...products.map((p) => p.specifications?.RAM || p.specifications?.ram || p.ram).filter(Boolean),
    ])
  );
  const extractedStorages = Array.from(
    new Set([
      ...SPEC_PRESETS.storage,
      ...products.map((p) => p.specifications?.Storage || p.specifications?.storage || p.storage).filter(Boolean),
    ])
  );

  const activeFiltersCount = [
    categoryId,
    subCategory,
    brandVal,
    minPrice,
    maxPrice,
    ratingVal,
    inStock,
    discountVal,
    colorVal,
    storageVal,
    ramVal,
    processorVal,
    screenSizeVal,
    displayTypeVal,
    searchVal,
  ].filter(Boolean).length;

  // Render Filter Content Sidebar
  const renderFilterSidebar = () => (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <FiSliders size={18} className="text-blue-600" />
          <h2 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs">
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </h2>
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-600 hover:text-red-700 underline cursor-pointer"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Category Section: Focused & Collapsed when a Category is Selected */}
      {categoryId ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
              <FiFolder className="text-blue-600" />
              <span>Category</span>
            </h3>
            <button
              type="button"
              onClick={removeCategoryFilter}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center space-x-1"
            >
              <span>All Categories</span>
            </button>
          </div>

          {/* Active Category Selected Badge */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
              <span className="font-black text-blue-900 text-xs">
                {activeCategoryObj?.name || categoryId}
              </span>
            </div>
            <button
              type="button"
              onClick={removeCategoryFilter}
              className="p-1.5 text-blue-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
              title="Remove Category Filter"
            >
              <FiX size={16} className="pointer-events-none" />
            </button>
          </div>

          {/* Subcategories list relevant to active category */}
          {subCategories && subCategories.length > 0 && (
            <div className="pl-3 border-l-2 border-blue-200 ml-2 space-y-1 pt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                Subcategories
              </span>
              <button
                type="button"
                onClick={() => updateFilters('subCategory', '')}
                className={`w-full text-left text-xs font-bold py-1.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-between ${
                  !subCategory ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All {activeCategoryObj?.name || 'Subcategories'}</span>
                {!subCategory && <FiCheck size={12} />}
              </button>
              {subCategories.map((sub) => {
                const isActive = subCategory === sub._id || subCategory === sub.slug;
                return (
                  <button
                    key={sub._id}
                    type="button"
                    onClick={() => updateFilters('subCategory', sub._id)}
                    className={`w-full text-left text-xs font-bold py-1.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-between ${
                      isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {isActive && <FiCheck size={12} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Categories List when no category is selected */
        <div className="space-y-2">
          <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
            <FiGrid className="text-blue-600" />
            <span>Categories</span>
          </h3>
          <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => updateFilters('category', '')}
              className={`text-left text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-between ${
                !categoryId ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Categories</span>
              {!categoryId && <FiCheck size={14} />}
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                type="button"
                onClick={() => updateFilters('category', cat._id)}
                className="text-left text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-between"
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* RAM & Storage Filters: Shown ONLY when a Smartphone, Laptop, or Gaming Category is Selected */}
      {(isSmartphone || isLaptop || isGaming) && (
        <>
          {/* RAM Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
              <FiSmartphone className="text-blue-600" />
              <span>RAM Capacity</span>
            </h3>
            <div className="grid grid-cols-3 gap-1.5">
              {extractedRAMs.slice(0, 6).map((ram) => {
                const checked = ramVal
                  .split(',')
                  .map((r) => r.trim().toLowerCase())
                  .includes(ram.toLowerCase());
                return (
                  <button
                    key={ram}
                    type="button"
                    onClick={() => handleMultiSelectToggle('ram', ram)}
                    className={`py-1.5 px-2 text-center text-xs font-bold rounded-xl border transition cursor-pointer ${
                      checked
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-extrabold shadow-2xs'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {ram}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Internal Storage Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Internal Storage</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {extractedStorages.slice(0, 6).map((st) => {
                const checked = storageVal
                  .split(',')
                  .map((s) => s.trim().toLowerCase())
                  .includes(st.toLowerCase());
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleMultiSelectToggle('storage', st)}
                    className={`py-1.5 px-2 text-center text-xs font-bold rounded-xl border transition cursor-pointer ${
                      checked
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-extrabold shadow-2xs'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Processor & GPU Filters: Shown ONLY when a Laptop or Gaming Category is Selected */}
      {(isGaming || isLaptop) && (
        <>
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
              <FiCpu className="text-blue-600" />
              <span>Processor Family</span>
            </h3>
            <div className="space-y-1.5">
              {SPEC_PRESETS.processor.map((proc) => {
                const checked = processorVal
                  .split(',')
                  .map((p) => p.trim().toLowerCase())
                  .includes(proc.toLowerCase());
                return (
                  <label key={proc} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleMultiSelectToggle('processor', proc)}
                      className="rounded-md text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                    />
                    <span>{proc}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Graphics Card / GPU for Gaming */}
          {isGaming && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Graphics Card (GPU)</h3>
              <div className="space-y-1.5">
                {SPEC_PRESETS.gpu.map((gpuItem) => {
                  const checked = processorVal
                    .split(',')
                    .map((p) => p.trim().toLowerCase())
                    .includes(gpuItem.toLowerCase());
                  return (
                    <label key={gpuItem} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-blue-600 transition">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleMultiSelectToggle('processor', gpuItem)}
                        className="rounded-md text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                      />
                      <span>{gpuItem}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Screen Size & Display Tech: Shown ONLY when a Television Category is Selected */}
      {isTelevision && (
        <>
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
              <FiTv className="text-blue-600" />
              <span>Screen Size</span>
            </h3>
            <div className="space-y-1.5">
              {SPEC_PRESETS.screenSize.map((sz) => {
                const checked = screenSizeVal
                  .split(',')
                  .map((s) => s.trim().toLowerCase())
                  .includes(sz.toLowerCase());
                return (
                  <label key={sz} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-blue-600 transition">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleMultiSelectToggle('screenSize', sz)}
                      className="rounded-md text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                    />
                    <span>{sz}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Display Tech</h3>
            <div className="flex flex-wrap gap-1.5">
              {SPEC_PRESETS.displayType.map((dt) => {
                const checked = displayTypeVal
                  .split(',')
                  .map((d) => d.trim().toLowerCase())
                  .includes(dt.toLowerCase());
                return (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => handleMultiSelectToggle('displayType', dt)}
                    className={`py-1.5 px-3 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      checked
                        ? 'bg-blue-50 border-blue-600 text-blue-600 font-extrabold'
                        : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {dt}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Brands Checkboxes Filter */}
      {availableBrands.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
            <FiTag className="text-blue-600" />
            <span>Brand</span>
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {availableBrands.map((bName) => {
              const checked = brandVal
                .split(',')
                .map((b) => b.trim().toLowerCase())
                .includes(bName.toLowerCase());
              return (
                <label key={bName} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer hover:text-blue-600 transition">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleMultiSelectToggle('brand', bName)}
                    className="rounded-md text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
                  />
                  <span>{bName}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Presets & Custom Inputs */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
          <FiDollarSign className="text-blue-600" />
          <span>Price Range (₹)</span>
        </h3>
        
        <div className="space-y-1">
          {PRICE_PRESETS.map((preset, pIdx) => {
            const isSelected = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    updateFilters('minPrice', '');
                    updateFilters('maxPrice', '');
                  } else {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set('page', '1');
                    if (preset.min) newParams.set('minPrice', preset.min);
                    else newParams.delete('minPrice');
                    if (preset.max) newParams.set('maxPrice', preset.max);
                    else newParams.delete('maxPrice');
                    setSearchParams(newParams);
                  }
                }}
                className={`w-full text-left text-xs font-bold py-1.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-between ${
                  isSelected ? 'bg-blue-50 text-blue-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{preset.label}</span>
                {isSelected && <FiCheck size={14} />}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => updateFilters('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => updateFilters('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
          />
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-1.5 pt-4 border-t border-slate-100">
        <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center space-x-1">
          <FiStar className="text-amber-500" />
          <span>Customer Ratings</span>
        </h3>
        <div className="flex flex-col space-y-1">
          {[4, 3, 2].map((r) => {
            const isSelected = ratingVal === r.toString();
            return (
              <button
                key={r}
                type="button"
                onClick={() => updateFilters('rating', isSelected ? '' : r.toString())}
                className={`text-left text-xs py-1.5 px-3 rounded-xl transition cursor-pointer flex items-center justify-between font-bold ${
                  isSelected ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <span className="text-amber-500 font-extrabold">{r} ★</span>
                  <span>& above</span>
                </div>
                {isSelected && <FiCheck size={14} className="text-amber-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock & Discount Checkboxes */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock === 'true'}
            onChange={(e) => updateFilters('inStock', e.target.checked ? 'true' : '')}
            className="rounded-md text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
          />
          <span>Include In-Stock Only</span>
        </label>
        <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={discountVal === 'true'}
            onChange={(e) => updateFilters('discount', e.target.checked ? 'true' : '')}
            className="rounded-md text-blue-600 focus:ring-blue-500 h-4 w-4 border-slate-300"
          />
          <span>Discounted Deals Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 font-sans pb-10 max-w-7xl mx-auto">
      
      {/* Active Filters Bar / Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-blue-50/60 border border-blue-200/80 p-3 rounded-2xl">
          <span className="text-xs font-black text-blue-900 uppercase tracking-wider mr-1">Active Filters:</span>
          
          {categoryId && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              Category: {activeCategoryObj?.name || categoryId}
              <button
                type="button"
                onClick={removeCategoryFilter}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
                title="Remove Category Filter"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          {subCategory && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              Subcategory: {subCategory}
              <button
                type="button"
                onClick={() => updateFilters('subCategory', '')}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          {brandVal && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              Brand: {brandVal}
              <button
                type="button"
                onClick={() => updateFilters('brand', '')}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          {ramVal && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              RAM: {ramVal}
              <button
                type="button"
                onClick={() => updateFilters('ram', '')}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          {storageVal && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              Storage: {storageVal}
              <button
                type="button"
                onClick={() => updateFilters('storage', '')}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          {processorVal && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              Processor/GPU: {processorVal}
              <button
                type="button"
                onClick={() => updateFilters('processor', '')}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center px-3 py-1 bg-white border border-blue-300 text-blue-700 text-xs font-bold rounded-xl shadow-2xs">
              Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
              <button
                type="button"
                onClick={() => {
                  updateFilters('minPrice', '');
                  updateFilters('maxPrice', '');
                }}
                className="ml-2 text-blue-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
              >
                <FiX size={14} className="pointer-events-none" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-bold text-red-600 hover:text-red-800 underline ml-auto cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid Layout: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6 border border-slate-200/80 rounded-3xl p-5 bg-white h-fit shadow-xs sticky top-24">
          {renderFilterSidebar()}
        </aside>

        {/* Product Catalog Grid */}
        <section className="lg:col-span-3 space-y-6">
          
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-200/80 rounded-3xl p-4 bg-white gap-4 shadow-xs">
            <div className="flex items-center space-x-3">
              {/* Mobile Filter Open Button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                <FiFilter className="mr-1.5" size={16} /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>

              <div className="text-xs sm:text-sm text-slate-600 font-semibold">
                {searchVal && (
                  <span>
                    Results for "<span className="text-blue-600 font-extrabold">{searchVal}</span>" |{' '}
                  </span>
                )}
                Showing <span className="text-slate-900 font-black">{pagination?.total || products.length}</span> products
              </div>
            </div>

            {/* Sort By Dropdown */}
            <div className="w-full sm:w-auto">
              <select
                value={sort}
                onChange={(e) => updateFilters('sort', e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 cursor-pointer shadow-2xs"
              >
                <option value="newest">Sort by: Newest Arrivals</option>
                <option value="popularity">Popularity</option>
                <option value="best-selling">Best Selling</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 bg-white rounded-3xl space-y-4">
              <FiInfo className="mx-auto text-slate-400" size={40} />
              <div>
                <h3 className="text-base font-bold text-slate-800">No products match your selected filters</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Try adjusting your category, RAM, storage, or price criteria.</p>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} onQuickView={handleQuickView} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200/80">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <FiChevronLeft size={18} />
              </button>
              {Array.from({ length: pagination.pages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => handlePageChange(pNum)}
                  className={`w-9 h-9 text-xs font-extrabold rounded-xl transition cursor-pointer ${
                    page === pNum
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pNum}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= pagination.pages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filters Slide-over Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <h2 className="font-extrabold text-slate-900 uppercase text-sm flex items-center space-x-2">
                  <FiFilter className="text-blue-600" />
                  <span>Filter Products</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>
              {renderFilterSidebar()}
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer text-center mt-6"
            >
              Apply Filters ({products.length} Items)
            </button>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewOpen && quickViewProduct && (
        <Modal isOpen={quickViewOpen} onClose={() => setQuickViewOpen(false)} title="Quick Product Preview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100">
              <img
                src={getImageUrl(quickViewProduct.images?.[0])}
                alt={quickViewProduct.title}
                className="max-h-60 object-contain"
              />
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {quickViewProduct.brand || 'Store Item'}
              </span>
              <h3 className="text-base font-bold text-slate-900">{quickViewProduct.title}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-black text-slate-900">₹{quickViewProduct.price}</span>
                {quickViewProduct.discountPrice > 0 && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{quickViewProduct.price + quickViewProduct.discountPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-3">{quickViewProduct.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Products;
