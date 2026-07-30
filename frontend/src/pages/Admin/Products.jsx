import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../features/product/productSlice.js';
import { adminDeleteProduct, adminDeleteAllProducts, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { Link } from 'react-router-dom';
import { FiPlus, FiTrash2, FiEdit, FiInfo, FiLayers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import { getImageUrl } from '../../utils/imageUtils.js';

const Products = () => {
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.product);
  const { success, error } = useSelector((state) => state.admin);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, slug: null });
  const [deleteAllModal, setDeleteAllModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Catalog updated successfully!');
      dispatch(clearAdminStates());
      dispatch(fetchProducts({ limit: 100 }));
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const handleDelete = (slug) => {
    setDeleteModal({ isOpen: true, slug });
  };

  const confirmDelete = () => {
    if (!deleteModal.slug) return;
    dispatch(adminDeleteProduct(deleteModal.slug));
    setDeleteModal({ isOpen: false, slug: null });
  };

  const confirmDeleteAll = () => {
    dispatch(adminDeleteAllProducts());
    setDeleteAllModal(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-3 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Products</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">Create single or bulk products, update or remove devices from catalog.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {products.length > 0 && (
            <button
              onClick={() => setDeleteAllModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-200 text-xs font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
            >
              <FiTrash2 className="mr-1.5" size={16} /> Delete All Products
            </button>
          )}
          <Link
            to="/admin/products/bulk-add"
            className="inline-flex items-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-800 bg-white hover:bg-slate-50 transition shadow-xs"
          >
            <FiLayers className="mr-1.5 text-blue-600" size={16} /> Add Multiple Products
          </Link>
          <Link
            to="/admin/products/add"
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition shadow-xs"
          >
            <FiPlus className="mr-1.5" size={16} /> Add Single Product
          </Link>
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 bg-white rounded-lg">
          <FiInfo className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-500">No products inside store catalog.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs font-semibold text-gray-700">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Brand</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={getImageUrl(prod.images?.[0])}
                          alt={prod.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="font-bold text-gray-900 line-clamp-1">{prod.title}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{prod.brand}</td>
                    <td className="px-6 py-4 text-gray-900 font-extrabold">₹{prod.price}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          prod.stock > 0
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/admin/products/edit/${prod.slug}`}
                        className="inline-flex p-1.5 border border-gray-200 rounded-md text-gray-600 hover:text-blue-600 hover:border-blue-300 transition"
                      >
                        <FiEdit size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(prod.slug)}
                        className="p-1.5 border border-gray-200 rounded-md text-gray-400 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Single Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, slug: null })}
        onConfirm={confirmDelete}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        variant="danger"
      />

      {/* Delete All Modal */}
      <ConfirmModal
        isOpen={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete ALL Products?"
        message={`Are you sure you want to permanently delete ALL ${products.length} products from the store catalog?`}
        confirmText="Yes, Delete All Products"
        variant="danger"
      />

    </div>
  );
};

export default Products;
