import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  adminBulkCreateBanners,
  adminDeleteAllBanners,
  clearAdminStates,
} from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiInfo, FiLayers, FiX, FiDownload, FiUpload, FiCheck, FiEdit2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

const Banner = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { banners = [], loading, success, error } = useSelector((state) => state.admin);

  const [editingBanner, setEditingBanner] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageMode, setImageMode] = useState('file'); // 'file' or 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Bulk Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { id: 1, title: '', link: '/products', imageUrl: '' },
    { id: 2, title: '', link: '/products', imageUrl: '' },
  ]);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
      dispatch(clearAdminStates());
      dispatch(fetchBanners());
      reset();
      setImageFile(null);
      setImageUrlInput('');
      setImageMode('file');
      setEditingBanner(null);
      setIsBulkModalOpen(false);
    }
  }, [success, dispatch, reset, editingBanner]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleEditClick = (b) => {
    setEditingBanner(b);
    setValue('title', b.title);
    setValue('link', b.link || '/products');
    setImageFile(null);
    const existingUrl = b.image?.url || b.imageUrl || '';
    setImageUrlInput(existingUrl);
    if (existingUrl && !existingUrl.includes('cloudinary')) {
      setImageMode('url');
    } else {
      setImageMode('file');
    }
  };

  const handleCancelEdit = () => {
    setEditingBanner(null);
    reset({ title: '', link: '/products' });
    setImageFile(null);
    setImageUrlInput('');
    setImageMode('file');
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('link', data.link || '/products');

    if (imageMode === 'file' && imageFile) {
      formData.append('image', imageFile);
    } else if (imageMode === 'url' && imageUrlInput.trim()) {
      formData.append('imageUrl', imageUrlInput.trim());
    }

    if (editingBanner) {
      dispatch(updateBanner({ id: editingBanner._id, formData }));
    } else {
      dispatch(createBanner(formData));
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (!deleteModal.id) return;
    dispatch(deleteBanner(deleteModal.id))
      .unwrap()
      .then(() => {
        toast.success('Banner deleted.');
        dispatch(fetchBanners());
      })
      .finally(() => {
        setDeleteModal({ isOpen: false, id: null });
      });
  };

  // Bulk Handlers
  const handleBulkRowChange = (index, field, val) => {
    const updated = [...bulkRows];
    updated[index][field] = val;
    setBulkRows(updated);
  };

  const addBulkRow = () => {
    setBulkRows([...bulkRows, { id: Date.now() + Math.random(), title: '', link: '/products', imageUrl: '' }]);
  };

  const removeBulkRow = (index) => {
    if (bulkRows.length === 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const downloadSampleCSV = () => {
    const content = 'title,link,imageUrl\n"Grand Festival Sale 50% OFF","/products","https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da"\n"New Apple Flagship Launch","/category/smartphones","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"\n';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'banners_template.csv';
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
            const imageKeys = ['imageurl', 'imageUrl', 'image', 'images', 'thumbnail', 'thumb', 'photo', 'picture', 'src'];
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
            title: item.title || item.name || '',
            link: item.link || item.url || '/products',
            imageUrl: extractImg(item),
          }));
          setBulkRows(rows);
          toast.success(`Loaded ${rows.length} banner rows!`);
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
    const valid = bulkRows.filter((r) => r.title && r.title.trim());
    if (valid.length === 0) {
      toast.error('Please enter at least one banner title.');
      return;
    }
    dispatch(adminBulkCreateBanners(valid));
  };

  const [deleteAllModal, setDeleteAllModal] = useState(false);

  const confirmDeleteAll = () => {
    dispatch(adminDeleteAllBanners());
    setDeleteAllModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FiLayers className="text-blue-600" />
            <span>Manage Banners</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure single or bulk homepage promotional sliders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {banners.length > 0 && (
            <button
              onClick={() => setDeleteAllModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <FiTrash2 className="mr-1.5" size={16} /> Delete All Banners
            </button>
          )}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiLayers className="mr-1.5" size={16} /> Bulk Add Banners
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Single Add Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {editingBanner ? 'Edit Promo Banner' : 'Create Single Banner'}
            </h2>
            {editingBanner && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold text-slate-700">
            <div>
              <label className="block mb-1 font-bold text-slate-900">Banner Title *</label>
              <input
                type="text"
                placeholder="Summer Sale 50% OFF"
                {...register('title', { required: true })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Target Link URL</label>
              <input
                type="text"
                placeholder="/products or https://..."
                {...register('link')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-900 text-xs">Banner Image *</label>
                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setImageMode('file')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                      imageMode === 'file' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📁 Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition ${
                      imageMode === 'url' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🔗 Image URL
                  </button>
                </div>
              </div>

              {imageMode === 'file' ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              ) : (
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
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
                <>
                  <FiCheck size={16} />
                  <span>{editingBanner ? 'Update Banner' : 'Upload Banner'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Banners Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Active Banners ({banners.length})
          </h2>

          {loading ? (
            <Loader fullPage={false} />
          ) : banners.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 bg-white rounded-3xl">
              <FiInfo className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">No promo banners configured.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.map((b) => (
                <div key={b._id} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs relative group">
                  <div className="h-40 w-full bg-slate-100 relative">
                    <img
                      src={getImageUrl(b)}
                      alt={b.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent p-4 flex flex-col justify-end">
                      <h3 className="text-sm font-extrabold text-white">{b.title}</h3>
                      <p className="text-[10px] text-slate-300 font-mono">{b.link || '/products'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-white flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      Active Banner
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditClick(b)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                        title="Edit Banner"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Delete Banner"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                <span>Bulk Create Banners</span>
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
                      placeholder="Banner Title *"
                      value={row.title}
                      onChange={(e) => handleBulkRowChange(idx, 'title', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Link URL"
                      value={row.link}
                      onChange={(e) => handleBulkRowChange(idx, 'link', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={row.imageUrl}
                      onChange={(e) => handleBulkRowChange(idx, 'imageUrl', e.target.value)}
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
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {loading ? 'Processing...' : `Create ${bulkRows.filter(r => r.title).length} Banners`}
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
        title="Delete Banner?"
        message="Are you sure you want to delete this promotional banner?"
        confirmText="Delete Banner"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete ALL Banners?"
        message={`Are you sure you want to permanently delete ALL ${banners.length} promotional banners?`}
        confirmText="Yes, Delete All Banners"
        variant="danger"
      />

    </div>
  );
};

export default Banner;
