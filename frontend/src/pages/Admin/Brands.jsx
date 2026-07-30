import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/category/categorySlice.js';
import {
  fetchBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
  clearBrandStates,
} from '../../features/brand/brandSlice.js';
import { adminBulkCreateBrands, adminDeleteAllBrands, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiEdit, FiInfo, FiTag, FiX, FiGlobe, FiFolder, FiLayers, FiDownload, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

const Brands = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const { categories } = useSelector((state) => state.category);
  const { brands, loading, success, error } = useSelector((state) => state.brand);
  const { loading: adminLoading, success: adminSuccess, error: adminError } = useSelector((state) => state.admin);

  const [logoFile, setLogoFile] = useState(null);
  const [logoMode, setLogoMode] = useState('file'); // 'file' or 'url'
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Bulk Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { id: 1, name: '', description: '', website: '', logoUrl: '' },
    { id: 2, name: '', description: '', website: '', logoUrl: '' },
  ]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands(categoryFilter));
  }, [dispatch, categoryFilter]);

  useEffect(() => {
    if (success || adminSuccess) {
      toast.success(
        editingBrand ? 'Brand updated successfully!' : 'Brands processed successfully!'
      );
      dispatch(clearBrandStates());
      dispatch(clearAdminStates());
      dispatch(fetchBrands(categoryFilter));
      handleCancelEdit();
      setIsBulkModalOpen(false);
    }
  }, [success, adminSuccess, dispatch, categoryFilter, editingBrand]);

  useEffect(() => {
    if (error || adminError) {
      toast.error(error || adminError);
      dispatch(clearBrandStates());
      dispatch(clearAdminStates());
    }
  }, [error, adminError, dispatch]);

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleCategoryCheckboxChange = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((id) => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    setValue('name', brand.name);
    setValue('description', brand.description || '');
    setValue('website', brand.website || '');
    setSelectedCategories(brand.categories ? brand.categories.map((c) => (typeof c === 'object' ? c._id : c)) : []);
    setLogoFile(null);
    const existingUrl = brand.logo?.url || '';
    setLogoUrlInput(existingUrl);
    if (existingUrl && !existingUrl.includes('cloudinary')) {
      setLogoMode('url');
    } else {
      setLogoMode('file');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    reset({ name: '', description: '', website: '' });
    setSelectedCategories([]);
    setLogoFile(null);
    setLogoUrlInput('');
    setLogoMode('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data) => {
    if (!data.name) {
      toast.error('Brand name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    formData.append('website', data.website || '');
    formData.append('categories', selectedCategories.join(','));

    if (logoMode === 'file' && logoFile) {
      formData.append('logo', logoFile);
    } else if (logoMode === 'url' && logoUrlInput.trim()) {
      formData.append('logoUrl', logoUrlInput.trim());
    }

    if (editingBrand) {
      dispatch(adminUpdateBrand({ id: editingBrand._id, formData }));
    } else {
      dispatch(adminCreateBrand(formData));
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (!deleteModal.id) return;
    dispatch(adminDeleteBrand(deleteModal.id));
    setDeleteModal({ isOpen: false, id: null });
  };

  // Bulk Handlers
  const handleBulkRowChange = (index, field, val) => {
    const updated = [...bulkRows];
    updated[index][field] = val;
    setBulkRows(updated);
  };

  const addBulkRow = () => {
    setBulkRows([...bulkRows, { id: Date.now() + Math.random(), name: '', description: '', website: '', logoUrl: '' }]);
  };

  const removeBulkRow = (index) => {
    if (bulkRows.length === 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const downloadSampleCSV = () => {
    const content = 'name,description,website,logoUrl\n"Sony","Japanese multinational electronics corporation","https://sony.com","https://images.unsplash.com/photo-1599305445671-ac291c95aaa9"\n"Apple","Consumer electronics and software","https://apple.com","https://images.unsplash.com/photo-1611186871348-b1ce696e52c9"\n';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'brands_template.csv';
    link.click();
  };

  const handleBulkFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        let imported = [];
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            imported = parsed;
          } else if (parsed && typeof parsed === 'object') {
            const possibleArr = Object.values(parsed).find((val) => Array.isArray(val));
            if (possibleArr) imported = possibleArr;
          }
        } else {
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length > 1) {
            const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim().toLowerCase());
            for (let i = 1; i < lines.length; i++) {
              const vals = lines[i].split(',').map((v) => v.replace(/^"|"$/g, '').trim());
              const obj = {};
              headers.forEach((h, idx) => (obj[h] = vals[idx] || ''));
              imported.push(obj);
            }
          }
        }
        if (Array.isArray(imported) && imported.length > 0) {
          const extractImg = (item) => {
            if (!item || typeof item !== 'object') return '';
            const imageKeys = ['logourl', 'logo', 'logolink', 'imageurl', 'imageUrl', 'image', 'images', 'thumbnail', 'thumb', 'photo', 'picture', 'src'];
            for (const k of imageKeys) {
              for (const ik of Object.keys(item)) {
                if (ik.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                  const val = item[ik];
                  if (typeof val === 'string' && val.trim()) return val.trim();
                  if (Array.isArray(val) && val.length > 0) {
                    if (typeof val[0] === 'string') return val[0].trim();
                    if (typeof val[0] === 'object' && val[0]?.url) return String(val[0].url).trim();
                  }
                  if (typeof val === 'object' && val?.url) return String(val.url).trim();
                }
              }
            }
            return '';
          };

          const rows = imported.map((item, idx) => ({
            id: Date.now() + idx,
            name: item.name || item.brand || item.title || '',
            description: item.description || item.desc || '',
            website: item.website || item.url || '',
            logoUrl: extractImg(item),
          }));
          setBulkRows(rows);
          toast.success(`Loaded ${rows.length} brand rows!`);
        }
      } catch (err) {
        toast.error('Failed to parse file: ' + err.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    const valid = bulkRows.filter((r) => r.name && r.name.trim());
    if (valid.length === 0) {
      toast.error('Please enter at least one brand name.');
      return;
    }
    dispatch(adminBulkCreateBrands(valid));
  };

  const [deleteAllModal, setDeleteAllModal] = useState(false);

  const confirmDeleteAll = () => {
    dispatch(adminDeleteAllBrands());
    setDeleteAllModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FiTag className="text-blue-600" />
            <span>Brand Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Manage manufacturer brands and link them to store categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {brands.length > 0 && (
            <button
              onClick={() => setDeleteAllModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <FiTrash2 className="mr-1.5" size={16} /> Delete All Brands
            </button>
          )}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiLayers className="mr-1.5" size={16} /> Bulk Add Brands
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create / Edit Brand Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {editingBrand ? 'Edit Brand' : 'Create Single Brand'}
            </h2>
            {editingBrand && (
              <button
                onClick={handleCancelEdit}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Brand Name *</label>
              <input
                type="text"
                placeholder="e.g. Sony, Bose, Apple"
                {...register('name', { required: true })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Description</label>
              <textarea
                rows="2"
                placeholder="Brief description..."
                {...register('description')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Official Website URL</label>
              <input
                type="text"
                placeholder="https://..."
                {...register('website')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Assigned Categories</label>
              <div className="max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50 space-y-1.5">
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat._id)}
                      onChange={() => handleCategoryCheckboxChange(cat._id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-900 text-xs font-sans">Brand Logo</label>
                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLogoMode('file')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                      logoMode === 'file' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoMode('url')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                      logoMode === 'url' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔗 Logo URL
                  </button>
                </div>
              </div>

              {logoMode === 'file' ? (
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              ) : (
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={logoUrlInput}
                  onChange={(e) => setLogoUrlInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold bg-slate-50/50"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <Loader fullPage={false} size="sm" />
              ) : (
                <span>{editingBrand ? 'Update Brand' : 'Create Brand'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Brands Grid / Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Brand Directory ({brands.length})
            </h2>

            {/* Filter by Category */}
            <div className="w-full sm:w-64">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <Loader fullPage={false} />
          ) : brands.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 bg-white rounded-3xl">
              <FiInfo className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">No brands found.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Brand</th>
                    <th className="px-6 py-3">Website</th>
                    <th className="px-6 py-3">Categories</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.map((brand) => {
                    const isBeingEdited = editingBrand?._id === brand._id;
                    return (
                      <tr
                        key={brand._id}
                        className={`transition ${isBeingEdited ? 'bg-blue-50/60' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                            <img
                              src={getImageUrl(brand.logo)}
                              alt={brand.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{brand.name}</span>
                            {brand.description && (
                              <p className="text-[10px] text-slate-400 line-clamp-1">{brand.description}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {brand.website ? (
                            <a
                              href={brand.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center space-x-1"
                            >
                              <FiGlobe size={12} />
                              <span className="truncate max-w-[120px]">{brand.website}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {brand.categories && brand.categories.length > 0 ? (
                              brand.categories.map((c) => (
                                <span
                                  key={typeof c === 'object' ? c._id : c}
                                  className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold"
                                >
                                  {typeof c === 'object' ? c.name : 'Category'}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(brand)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                            title="Edit Brand"
                          >
                            <FiEdit size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(brand._id)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                            title="Delete Brand"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Add Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <FiLayers className="text-blue-600" />
                <span>Bulk Create Brands</span>
              </h2>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={downloadSampleCSV}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition inline-flex items-center cursor-pointer"
                >
                  <FiDownload className="mr-1" size={14} /> Sample CSV
                </button>
                <label className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition inline-flex items-center cursor-pointer">
                  <FiUpload className="mr-1" size={14} /> Import CSV/JSON
                  <input type="file" accept=".csv, .json" onChange={handleBulkFileUpload} className="hidden" />
                </label>
              </div>

              <button
                type="button"
                onClick={addBulkRow}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center cursor-pointer"
              >
                <FiPlus className="mr-1" size={14} /> Add Row
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="max-h-[350px] overflow-y-auto space-y-3 pr-1">
                {bulkRows.map((row, idx) => (
                  <div key={row.id} className="flex items-center gap-2 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-200/60">
                    <span className="w-6 text-center text-xs font-black text-slate-400">{idx + 1}</span>
                    <input
                      type="text"
                      placeholder="Brand Name *"
                      value={row.name}
                      onChange={(e) => handleBulkRowChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Website URL"
                      value={row.website}
                      onChange={(e) => handleBulkRowChange(idx, 'website', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={row.logoUrl}
                      onChange={(e) => handleBulkRowChange(idx, 'logoUrl', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => removeBulkRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {adminLoading ? 'Processing...' : `Create ${bulkRows.filter(r => r.name).length} Brands`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Brand?"
        message="Are you sure you want to delete this brand?"
        confirmText="Delete Brand"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete ALL Brands?"
        message={`Are you sure you want to permanently delete ALL ${brands.length} brands?`}
        confirmText="Yes, Delete All Brands"
        variant="danger"
      />
    </div>
  );
};

export default Brands;
