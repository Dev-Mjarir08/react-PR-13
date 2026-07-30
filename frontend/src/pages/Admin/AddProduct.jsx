import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchCategories } from '../../features/category/categorySlice.js';
import { adminCreateProduct, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiPlus, FiTrash } from 'react-icons/fi';

const AddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { categories } = useSelector((state) => state.category);
  const { loading, success, error } = useSelector((state) => state.admin);

  // Specifications array to support dynamic spec additions
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageMode, setImageMode] = useState('file'); // 'file' or 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Product created successfully!');
      dispatch(clearAdminStates());
      navigate('/admin/products');
    }
  }, [success, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const handleSpecChange = (index, field, val) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addSpecField = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpecField = (idx) => setSpecs(specs.filter((_, i) => i !== idx));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('brand', data.brand);
    formData.append('category', data.category);
    formData.append('price', data.price);
    formData.append('discountPrice', data.discountPrice || '');
    formData.append('stock', data.stock);
    formData.append('sku', data.sku);
    formData.append('warranty', data.warranty);
    formData.append('description', data.description);

    // Map specs to backend specifications object
    const specificationsObj = {};
    specs.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specificationsObj[item.key.toLowerCase()] = item.value;
      }
    });
    formData.append('specifications', JSON.stringify(specificationsObj));

    if (imageMode === 'file' && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    } else if (imageMode === 'url' && imageUrlInput.trim()) {
      formData.append('imageUrl', imageUrlInput.trim());
    }

    dispatch(adminCreateProduct(formData));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/admin/products')}
          className="text-sm font-semibold text-gray-500 hover:text-gray-900 inline-flex items-center"
        >
          <FiChevronLeft className="mr-1" /> Back to Products
        </button>
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight border-b border-gray-100 pb-3">
        Add New Product
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        
        {/* Core fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Product Title</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              placeholder="E.g., OLED Smart TV 55 Inch"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Brand</label>
            <input
              type="text"
              {...register('brand', { required: 'Brand name is required' })}
              placeholder="Sony, Samsung, LG"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Category</label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">SKU Code</label>
            <input
              type="text"
              {...register('sku', { required: 'SKU code is required' })}
              placeholder="E.g., SNY-55-OLED"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Base Price (INR)</label>
            <input
              type="number"
              {...register('price', { required: 'Price is required' })}
              placeholder="95000"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Discount Price (INR, Optional)</label>
            <input
              type="number"
              {...register('discountPrice')}
              placeholder="E.g., 85000"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Available Stock Quantity</label>
            <input
              type="number"
              {...register('stock', { required: 'Stock count is required' })}
              placeholder="20"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Warranty Details</label>
            <input
              type="text"
              {...register('warranty')}
              placeholder="E.g., 1 Year Manufacturer Warranty"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Overview Description</label>
          <textarea
            rows={4}
            {...register('description', { required: 'Description is required' })}
            placeholder="Detailed features, design aspects, and functions..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
          ></textarea>
        </div>

        {/* Dynamic Specifications */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Specifications</h3>
            <button
              type="button"
              onClick={addSpecField}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
            >
              <FiPlus className="mr-1" /> Add Detail
            </button>
          </div>

          <div className="space-y-3">
            {specs.map((spec, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Key (e.g., Resolution)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 4K Ultra HD)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => removeSpecField(idx)}
                  className="p-2.5 border border-gray-200 rounded text-gray-400 hover:text-red-600 transition cursor-pointer"
                >
                  <FiTrash size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Image Selector / URL Switcher */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-gray-700">Catalog Product Image</label>
            <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  imageMode === 'file' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                📁 Upload Files
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`px-2.5 py-1 rounded cursor-pointer transition ${
                  imageMode === 'url' ? 'bg-white text-blue-600 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                🔗 Image URL
              </button>
            </div>
          </div>

          {imageMode === 'file' ? (
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs font-medium text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
            />
          ) : (
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm font-medium"
            />
          )}
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition cursor-pointer"
          >
            Create Product
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;
