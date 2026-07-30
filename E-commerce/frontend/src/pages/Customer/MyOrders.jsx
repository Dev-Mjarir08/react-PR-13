import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../../features/order/orderSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { FiInfo, FiArrowRight } from 'react-icons/fi';

const MyOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (loading && orders.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 font-sans pb-16">
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight">My Orders & Purchase History</h1>
        <p className="text-xs text-[#757575] font-medium mt-0.5">Track shipment status and order details</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200/80 rounded-3xl max-w-md mx-auto space-y-4 shadow-xs p-8">
          <FiInfo className="mx-auto text-slate-300" size={44} />
          <h2 className="text-base font-black text-[#212121]">No Orders Found</h2>
          <p className="text-xs text-[#757575] font-medium max-w-xs mx-auto">You haven't placed any orders with us yet.</p>
          <div className="pt-2">
            <Link to="/products" className="inline-flex items-center py-2.5 px-6 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold text-xs rounded-full shadow-xs transition">
              Browse Catalog <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-[#757575] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Total Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-[#212121]">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-purple-50/30 transition">
                    <td className="px-6 py-4 font-bold text-[#212121]">
                      #{order._id.substring(0, 10)}...
                    </td>
                    <td className="px-6 py-4 text-[#757575] font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {order.isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">Paid</span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">Unpaid</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        order.status === 'Delivered'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : order.status === 'Cancelled'
                          ? 'text-red-700 bg-red-50 border border-red-200'
                          : 'text-[#9C27B0] bg-purple-50 border border-purple-200'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[#9C27B0]">
                      ₹{order.totalPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-xs font-bold text-[#9C27B0] hover:underline inline-flex items-center"
                      >
                        View Details <FiArrowRight className="ml-1" />
                      </Link>
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

export default MyOrders;
