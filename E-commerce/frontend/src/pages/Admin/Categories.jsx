import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/category/categorySlice.js';
import {
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminBulkCreateCategories,
  adminDeleteAllCategories,
  clearAdminStates,
} from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiEdit, FiInfo, FiFolder, FiX, FiCheck, FiLayers, FiDownload, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

const Categories = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const { register, handleSubmit, reset, setValue } = useForm();

  const { categories, loading: categoriesLoading } = useSelector((state) => state.category);
  const { loading: adminLoading, success, error } = useSelector((state) => state.admin);

  const [imageFile, setImageFile] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imageMode, setImageMode] = useState('file'); // 'file' or 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, slug: null });
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { id: 1, name: '', description: '', imageUrl: '' },
    { id: 2, name: '', description: '', imageUrl: '' },
  ]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success(editingCategory ? 'Category updated!' : 'Category created!');
      reset({ name: '', description: '' });
      setImageFile(null);
      setImageUrlInput('');
      setImageMode('file');
      setEditingCategory(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      dispatch(clearAdminStates());
      dispatch(fetchCategories());
    }
  }, [success, dispatch, editingCategory, reset]);

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

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setValue('name', cat.name);
    setValue('description', cat.description || '');
    setImageFile(null);
    const existingUrl = cat.image?.url || '';
    setImageUrlInput(existingUrl);
    if (existingUrl && !existingUrl.includes('cloudinary')) {
      setImageMode('url');
    } else {
      setImageMode('file');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setImageFile(null);
    setImageUrlInput('');
    setImageMode('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description || '');
    if (imageMode === 'file' && imageFile) {
      formData.append('image', imageFile);
    } else if (imageMode === 'url' && imageUrlInput.trim()) {
      formData.append('imageUrl', imageUrlInput.trim());
    }

    if (editingCategory) {
      dispatch(adminUpdateCategory({ slug: editingCategory.slug, formData }));
    } else {
      dispatch(adminCreateCategory(formData));
    }
  };

  const handleDelete = (slug) => {
    setDeleteModal({ isOpen: true, slug });
  };

  const confirmDelete = () => {
    if (!deleteModal.slug) return;
    dispatch(adminDeleteCategory(deleteModal.slug));
    setDeleteModal({ isOpen: false, slug: null });
  };

  // Bulk Handlers
  const handleBulkRowChange = (index, field, val) => {
    const updated = [...bulkRows];
    updated[index][field] = val;
    setBulkRows(updated);
  };

  const addBulkRow = () => {
    setBulkRows([...bulkRows, { id: Date.now() + Math.random(), name: '', description: '', imageUrl: '' }]);
  };

  const removeBulkRow = (index) => {
    if (bulkRows.length === 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const downloadSampleCSV = () => {
    const content = 'name,description,imageUrl\n"Electronics","Gadgets & devices","https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"\n"Fashion","Apparel & clothing","https://images.unsplash.com/photo-1445205170230-053b83016050"\n';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'categories_template.csv';
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
            name: item.name || item.title || item.category || '',
            description: item.description || item.desc || '',
            imageUrl: extractImg(item),
          }));
          setBulkRows(rows);
          toast.success(`Loaded ${rows.length} category rows!`);
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
      toast.error('Please enter at least one category name.');
      return;
    }
    dispatch(adminBulkCreateCategories(valid));
  };

  const [deleteAllModal, setDeleteAllModal] = useState(false);

  const confirmDeleteAll = () => {
    dispatch(adminDeleteAllCategories());
    setDeleteAllModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FiFolder className="text-blue-600" />
            <span>Category Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Create single or bulk categories into store catalog</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.length > 0 && (
            <button
              onClick={() => setDeleteAllModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <FiTrash2 className="mr-1.5" size={16} /> Delete All Categories
            </button>
          )}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiLayers className="mr-1.5" size={16} /> Bulk Add Categories
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Create / Edit Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {editingCategory ? 'Edit Category' : 'Create Single Category'}
            </h2>
            {editingCategory && (
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
              <label className="block mb-1 font-bold text-slate-900">Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Smartphones"
                {...register('name', { required: true })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Description</label>
              <textarea
                rows="3"
                placeholder="Brief category description..."
                {...register('description')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-900 text-xs">Category Image</label>
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
                  ref={fileInputRef}
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
              disabled={adminLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {adminLoading ? (
                <Loader fullPage={false} size="sm" />
              ) : (
                <>
                  <FiCheck size={16} />
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Category List Table */}
        <div className="lg:col-span-2 space-y-4">
          {categoriesLoading ? (
            <Loader fullPage={false} />
          ) : categories.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 bg-white rounded-3xl">
              <FiInfo className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">No categories found in database.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => {
                    const isBeingEdited = editingCategory?._id === cat._id;
                    return (
                      <tr
                        key={cat._id}
                        className={`transition ${isBeingEdited ? 'bg-blue-50/60' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                            <img
                              src={getImageUrl(cat, 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&q=80&w=400')}
                              alt={cat.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?auto=format&fit=crop&q=80&w=400';
                              }}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900">{cat.name}</span>
                            {isBeingEdited && (
                              <span className="ml-2 text-[9px] font-black text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Editing</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{cat.description || '-'}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                            title="Edit Category"
                          >
                            <FiEdit size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(cat.slug)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                            title="Delete Category"
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
                <span>Bulk Create Categories</span>
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
                      placeholder="Category Name *"
                      value={row.name}
                      onChange={(e) => handleBulkRowChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={row.description}
                      onChange={(e) => handleBulkRowChange(idx, 'description', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <input
                      type="text"
                      placeholder="Image URL (optional)"
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
                  disabled={adminLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  {adminLoading ? 'Processing...' : `Create ${bulkRows.filter(r => r.name).length} Categories`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, slug: null })}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category?"
        confirmText="Delete Category"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete ALL Categories?"
        message={`Are you sure you want to permanently delete ALL ${categories.length} categories?`}
        confirmText="Yes, Delete All Categories"
        variant="danger"
      />

    </div>
  );
};

export default Categories;
