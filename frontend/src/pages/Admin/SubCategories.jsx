import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/category/categorySlice.js';
import {
  fetchSubCategories,
  adminCreateSubCategory,
  adminUpdateSubCategory,
  adminDeleteSubCategory,
  clearSubCategoryStates,
} from '../../features/subcategory/subCategorySlice.js';
import { adminBulkCreateSubCategories, adminDeleteAllSubCategories, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiEdit, FiInfo, FiLayers, FiX, FiDownload, FiUpload, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const SubCategories = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, setValue } = useForm();

  const { categories } = useSelector((state) => state.category);
  const { subCategories, loading, success, error } = useSelector((state) => state.subCategory);
  const { loading: adminLoading, success: adminSuccess, error: adminError } = useSelector((state) => state.admin);

  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');

  // Bulk Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [globalCategory, setGlobalCategory] = useState('');
  const [bulkRows, setBulkRows] = useState([
    { id: 1, name: '', category: '', description: '' },
    { id: 2, name: '', category: '', description: '' },
  ]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategories(selectedCategoryFilter));
  }, [dispatch, selectedCategoryFilter]);

  useEffect(() => {
    if (success || adminSuccess) {
      toast.success(
        editingSubCategory ? 'Subcategory updated successfully!' : 'Subcategories processed successfully!'
      );
      dispatch(clearSubCategoryStates());
      dispatch(clearAdminStates());
      dispatch(fetchSubCategories(selectedCategoryFilter));
      handleCancelEdit();
      setIsBulkModalOpen(false);
    }
  }, [success, adminSuccess, dispatch, editingSubCategory, selectedCategoryFilter]);

  useEffect(() => {
    if (error || adminError) {
      toast.error(error || adminError);
      dispatch(clearSubCategoryStates());
      dispatch(clearAdminStates());
    }
  }, [error, adminError, dispatch]);

  const handleEditClick = (subCat) => {
    setEditingSubCategory(subCat);
    setValue('name', subCat.name);
    setValue('category', subCat.category?._id || subCat.category);
    setValue('description', subCat.description || '');
  };

  const handleCancelEdit = () => {
    setEditingSubCategory(null);
    reset({ name: '', category: '', description: '' });
  };

  const onSubmit = (data) => {
    if (!data.name || !data.category) {
      toast.error('Subcategory name and parent category are required.');
      return;
    }

    if (editingSubCategory) {
      dispatch(adminUpdateSubCategory({ id: editingSubCategory._id, data }));
    } else {
      dispatch(adminCreateSubCategory(data));
    }
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (!deleteModal.id) return;
    dispatch(adminDeleteSubCategory(deleteModal.id));
    setDeleteModal({ isOpen: false, id: null });
  };

  // Helper to map category name or slug string to category _id from categories state
  const resolveCategoryId = (categoryInput) => {
    if (!categoryInput) return '';
    const cleanInput = String(categoryInput).trim();
    if (categories && categories.length > 0) {
      const match = categories.find(
        (c) =>
          c._id === cleanInput ||
          c.name.toLowerCase() === cleanInput.toLowerCase() ||
          c.slug.toLowerCase() === cleanInput.toLowerCase()
      );
      if (match) return match._id;
    }
    return cleanInput;
  };

  // Bulk Handlers
  const handleBulkRowChange = (index, field, val) => {
    const updated = [...bulkRows];
    updated[index][field] = val;
    setBulkRows(updated);
  };

  const handleGlobalCategoryChange = (catId) => {
    setGlobalCategory(catId);
    if (catId) {
      // Apply selected global category to all rows that don't have a category set
      const updated = bulkRows.map((row) => ({
        ...row,
        category: row.category || catId,
      }));
      setBulkRows(updated);
    }
  };

  const addBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      { id: Date.now() + Math.random(), name: '', category: globalCategory || '', description: '' },
    ]);
  };

  const removeBulkRow = (index) => {
    if (bulkRows.length === 1) return;
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const downloadSampleCSV = () => {
    const defaultCatName = categories && categories.length > 0 ? categories[0].name : 'Electronics';
    const content = `name,category,description\n"Televisions","${defaultCatName}","Smart OLED & LED Televisions"\n"Speakers","${defaultCatName}","Bluetooth wireless speakers"\n"Projectors","${defaultCatName}","4K Home Theatre Projectors"\n`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'subcategories_template.csv';
    link.click();
  };

  // Robust CSV parser supporting quotes, commas, escaped quotes and CRLF
  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return [];

    const parseLine = (line) => {
      const values = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    };

    const headers = parseLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.every((v) => !v)) continue;
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] !== undefined ? values[idx] : '';
      });
      data.push(row);
    }
    return data;
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
          imported = JSON.parse(text);
        } else {
          imported = parseCSV(text);
        }

        if (Array.isArray(imported) && imported.length > 0) {
          const rows = imported.map((item, idx) => {
            // Flexible property extraction
            const getItemVal = (...keys) => {
              for (const k of keys) {
                for (const ik of Object.keys(item)) {
                  if (ik.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')) {
                    if (item[ik] !== undefined && item[ik] !== null) return String(item[ik]).trim();
                  }
                }
              }
              return '';
            };

            const rawName = getItemVal('name', 'title', 'subcategory', 'sub_category');
            const rawCat = getItemVal('category', 'cat', 'parentcategory', 'parent_category', 'parent');
            const rawDesc = getItemVal('description', 'desc', 'details');

            // Resolve category string to category ID if matched in store categories
            const resolvedCatId = resolveCategoryId(rawCat) || globalCategory || '';

            return {
              id: Date.now() + idx,
              name: rawName,
              category: resolvedCatId,
              description: rawDesc,
            };
          });

          setBulkRows(rows);
          toast.success(`Loaded ${rows.length} subcategory rows from file!`);
        } else {
          toast.error('File is empty or missing data rows.');
        }
      } catch (err) {
        toast.error('Failed to parse uploaded file: ' + err.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();

    const valid = [];
    for (let i = 0; i < bulkRows.length; i++) {
      const r = bulkRows[i];
      if (!r.name || !r.name.trim()) continue;

      const catId = r.category || globalCategory;
      if (!catId) {
        toast.error(`Row ${i + 1} ("${r.name}") is missing a Parent Category. Please select a Parent Category.`);
        return;
      }

      valid.push({
        name: r.name.trim(),
        category: catId,
        description: r.description ? r.description.trim() : '',
      });
    }

    if (valid.length === 0) {
      toast.error('Please enter at least one subcategory name.');
      return;
    }

    dispatch(adminBulkCreateSubCategories(valid));
  };

  const [deleteAllModal, setDeleteAllModal] = useState(false);

  const confirmDeleteAll = () => {
    dispatch(adminDeleteAllSubCategories());
    setDeleteAllModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FiLayers className="text-blue-600" />
            <span>Subcategory Management</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Organize subcategories under parent categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {subCategories.length > 0 && (
            <button
              onClick={() => setDeleteAllModal(true)}
              className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <FiTrash2 className="mr-1.5" size={16} /> Delete All Subcategories
            </button>
          )}
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiLayers className="mr-1.5" size={16} /> Bulk Add Subcategories
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Create / Edit SubCategory Form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              {editingSubCategory ? 'Edit Subcategory' : 'Create Single Subcategory'}
            </h2>
            {editingSubCategory && (
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
              <label className="block mb-1 font-bold text-slate-900">Subcategory Name *</label>
              <input
                type="text"
                placeholder="e.g. Wireless Earbuds"
                {...register('name', { required: true })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Parent Category *</label>
              <select
                {...register('category', { required: true })}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
              >
                <option value="">Select Parent Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-900">Description</label>
              <textarea
                rows="3"
                placeholder="Brief description..."
                {...register('description')}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center space-x-1.5"
            >
              {loading ? (
                <Loader fullPage={false} size="sm" />
              ) : (
                <span>{editingSubCategory ? 'Update Subcategory' : 'Create Subcategory'}</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Subcategory Catalog ({subCategories.length})
            </h2>

            {/* Filter by Category */}
            <div className="w-full sm:w-64">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">All Parent Categories</option>
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
          ) : subCategories.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 bg-white rounded-3xl">
              <FiInfo className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500">No subcategories found.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Subcategory</th>
                    <th className="px-6 py-3">Parent Category</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subCategories.map((sub) => {
                    const isBeingEdited = editingSubCategory?._id === sub._id;
                    return (
                      <tr
                        key={sub._id}
                        className={`transition ${isBeingEdited ? 'bg-blue-50/60' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="px-6 py-4 font-bold text-slate-900">{sub.name}</td>
                        <td className="px-6 py-4 text-blue-600 font-extrabold">
                          {sub.category?.name || 'General'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                          {sub.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(sub)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                            title="Edit Subcategory"
                          >
                            <FiEdit size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(sub._id)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                            title="Delete Subcategory"
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
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <FiLayers className="text-blue-600" />
                <span>Bulk Create Subcategories</span>
              </h2>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Global Parent Category Selector & Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2">
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

              {/* Default Parent Category Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Default Parent:</span>
                <select
                  value={globalCategory}
                  onChange={(e) => handleGlobalCategoryChange(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold border border-blue-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
                >
                  <option value="">Select for All Rows...</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="max-h-[360px] overflow-y-auto space-y-3 pr-1">
                {bulkRows.map((row, idx) => (
                  <div key={row.id} className="flex items-center gap-2 bg-slate-50/70 p-2.5 rounded-2xl border border-slate-200/60">
                    <span className="w-6 text-center text-xs font-black text-slate-400">{idx + 1}</span>
                    
                    {/* Subcategory Name */}
                    <input
                      type="text"
                      placeholder="Subcategory Name *"
                      value={row.name}
                      onChange={(e) => handleBulkRowChange(idx, 'name', e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />

                    {/* Parent Category Dropdown per row */}
                    <select
                      value={row.category}
                      onChange={(e) => handleBulkRowChange(idx, 'category', e.target.value)}
                      className={`flex-1 px-3 py-1.5 text-xs font-bold border rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 ${
                        !row.category ? 'border-amber-400 text-amber-600 bg-amber-50/30' : 'border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">Parent Category *</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    {/* Description */}
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={row.description}
                      onChange={(e) => handleBulkRowChange(idx, 'description', e.target.value)}
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

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={addBulkRow}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition inline-flex items-center cursor-pointer"
                >
                  <FiPlus className="mr-1" size={14} /> Add Row
                </button>

                <div className="flex items-center space-x-2">
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
                    {adminLoading ? 'Processing...' : `Create ${bulkRows.filter((r) => r.name).length} Subcategories`}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Subcategory?"
        message="Are you sure you want to delete this subcategory?"
        confirmText="Delete Subcategory"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete ALL Subcategories?"
        message={`Are you sure you want to permanently delete ALL ${subCategories.length} subcategories?`}
        confirmText="Yes, Delete All Subcategories"
        variant="danger"
      />
    </div>
  );
};

export default SubCategories;
