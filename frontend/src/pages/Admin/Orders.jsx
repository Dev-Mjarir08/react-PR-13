import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Orders = () => {
  const dispatch = useDispatch();

  const { orders, loading, success, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Order status updated successfully!');
      dispatch(clearAdminStates());
      dispatch(fetchAllOrders());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const handleStatusChange = (id, newStatus) => {
    dispatch(updateOrderStatus({ id, status: newStatus }));
  };

  if (loading && orders.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Orders</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Verify transactions and dispatch shipments.</p>
      </div>

      {/* Orders List Table */}
      {orders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 bg-white rounded-lg">
          <FiInfo className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-500">No order records registered yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm font-semibold text-gray-700">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Payment</th>
                  <th className="px-6 py-3">Total Charged</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">#{order._id.substring(0, 10)}...</td>
                    <td className="px-6 py-4 text-gray-500">{order.user?.name}</td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Paid</span>
                      ) : (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Unpaid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-gray-950">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'text-green-600 bg-green-50'
                          : order.status === 'Cancelled'
                          ? 'text-red-600 bg-red-50'
                          : 'text-blue-600 bg-blue-50'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status || 'Pending'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
