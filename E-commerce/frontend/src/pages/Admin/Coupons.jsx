import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupons, createCoupon, deleteCoupon, adminDeleteAllCoupons, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const Coupons = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();

  const { coupons, loading, success, error } = useSelector((state) => state.admin);
  const [deleteModal, setDeleteModal] = React.useState({ isOpen: false, id: null });
  const [deleteAllModal, setDeleteAllModal] = React.useState(false);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Coupons action executed successfully!');
      dispatch(clearAdminStates());
      dispatch(fetchCoupons());
      reset();
    }
  }, [success, dispatch, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(createCoupon({
      code: data.code.toUpperCase(),
      discountType: data.discountType,
      discountValue: parseFloat(data.value),
      minCartAmount: parseFloat(data.minOrderValue || '0'),
      expiryDate: data.expiryDate,
    }));
  };

  const handleDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (!deleteModal.id) return;
    dispatch(deleteCoupon(deleteModal.id))
      .unwrap()
      .then(() => {
        toast.success('Coupon deleted.');
        dispatch(fetchCoupons());
      })
      .finally(() => {
        setDeleteModal({ isOpen: false, id: null });
      });
  };

  const confirmDeleteAll = () => {
    dispatch(adminDeleteAllCoupons());
    setDeleteAllModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Coupons</h1>
          <p className="text-xs text-gray-400 font-semibold mt-1">Configure customer discount codes.</p>
        </div>

        {coupons.length > 0 && (
          <button
            onClick={() => setDeleteAllModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <FiTrash2 className="mr-1.5" size={16} /> Delete All Coupons
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Coupon Creation Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Add Coupon</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Coupon Code</label>
              <input
                type="text"
                {...register('code', { required: 'Coupon code is required' })}
                placeholder="E.g., SAVE20"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Discount Type</label>
              <select
                {...register('discountType', { required: 'Discount type is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Flat">Flat Amount (INR)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Discount Value</label>
              <input
                type="number"
                {...register('value', { required: 'Discount value is required' })}
                placeholder="E.g., 10 for 10% or 500 for ₹500"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Minimum Purchase Value (INR)</label>
              <input
                type="number"
                {...register('minOrderValue')}
                placeholder="E.g., 2000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Expiry Date</label>
              <input
                type="date"
                {...register('expiryDate', { required: 'Expiry date is required' })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition disabled:bg-blue-400 cursor-pointer"
            >
              {loading ? 'Adding...' : 'Add Coupon'}
            </button>
          </form>
        </div>

        {/* Right Side: Coupon List Table */}
        <div className="lg:col-span-2 space-y-4">
          {loading && coupons.length === 0 ? (
            <Loader fullPage={false} />
          ) : coupons.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 bg-white rounded-lg">
              <FiInfo className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm font-semibold text-gray-500">No active coupons configured.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm font-semibold text-gray-700">
                <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Discount</th>
                    <th className="px-6 py-3">Min Order</th>
                    <th className="px-6 py-3">Expiry</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-bold text-gray-900">{coupon.code}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {coupon.discountType === 'Percentage' || coupon.discountType === 'percent'
                          ? `${coupon.discountValue || coupon.value}%`
                          : `₹${coupon.discountValue || coupon.value}`}
                      </td>
                      <td className="px-6 py-4 text-gray-400">₹{coupon.minCartAmount ?? coupon.minOrderValue ?? '0'}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-1.5 border border-gray-200 rounded text-gray-400 hover:text-red-600 transition cursor-pointer"
                          title="Delete Coupon"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Coupon?"
        message="Are you sure you want to delete this discount coupon?"
        confirmText="Delete Coupon"
        variant="danger"
      />

      <ConfirmModal
        isOpen={deleteAllModal}
        onClose={() => setDeleteAllModal(false)}
        onConfirm={confirmDeleteAll}
        title="Delete ALL Coupons?"
        message={`Are you sure you want to permanently delete ALL ${coupons.length} discount coupons?`}
        confirmText="Yes, Delete All Coupons"
        variant="danger"
      />

    </div>
  );
};

export default Coupons;
