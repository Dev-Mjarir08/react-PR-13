import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchProductDetails } from '../../features/product/productSlice.js';
import { fetchCategories } from '../../features/category/categorySlice.js';
import { adminUpdateProduct, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiPlus, FiTrash } from 'react-icons/fi';

const EditProduct = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm();

  const { product, loading: productLoading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category);
  const { loading: adminLoading, success, error } = useSelector((state) => state.admin);

  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [imageFiles, setImageFiles] = useState([]);

  // Fetch product and categories
  useEffect(() => {
    dispatch(fetchProductDetails(slug));
    dispatch(fetchCategories());
  }, [dispatch, slug]);

  // Set default form values
  useEffect(() => {
    if (product) {
      setValue('title', product.title);
      setValue('brand', product.brand);
      setValue('category', product.category?._id || product.category);
      setValue('sku', product.sku);
      setValue('price', product.price);
      setValue('discountPrice', product.discountPrice || '');
      setValue('stock', product.stock);
      setValue('warranty', product.warranty || '');
      setValue('description', product.description);

      if (product.specifications && Object.keys(product.specifications).length > 0) {
        const specList = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value,
        }));
        setSpecs(specList);
      }
    }
  }, [product, setValue]);

  useEffect(() => {
    if (success) {
      toast.success('Product updated successfully!');
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

    const specificationsObj = {};
    specs.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specificationsObj[item.key.toLowerCase()] = item.value;
      }
    });
    formData.append('specifications', JSON.stringify(specificationsObj));

    imageFiles.forEach((file) => {
      formData.append('images', file);
    });

    dispatch(adminUpdateProduct({ slug, formData }));
  };

  if (productLoading || adminLoading) {
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
        Edit Product Details
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-200 rounded-lg p-6 space-y-6 shadow-sm">
        
        {/* Core fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Product Title</label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Brand</label>
            <input
              type="text"
              {...register('brand', { required: 'Brand name is required' })}
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Base Price (INR)</label>
            <input
              type="number"
              {...register('price', { required: 'Price is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Discount Price (INR, Optional)</label>
            <input
              type="number"
              {...register('discountPrice')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Available Stock Quantity</label>
            <input
              type="number"
              {...register('stock', { required: 'Stock count is required' })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Warranty Details</label>
            <input
              type="text"
              {...register('warranty')}
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
                  placeholder="Key"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <input
                  type="text"
                  placeholder="Value"
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

        {/* Image File Selector */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700">Replace Media Images (Optional)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-xs font-medium text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
          />
        </div>

        {/* Submit button */}
        <div className="pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-sm transition cursor-pointer"
          >
            Update Product
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditProduct;
