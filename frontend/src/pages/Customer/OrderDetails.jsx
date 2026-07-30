import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../../features/order/orderSlice.js';
import Loader from '../../components/common/Loader.jsx';
import axiosInstance from '../../api/axios.js';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiMapPin, FiCreditCard, FiPrinter, FiCheck, FiTruck, FiPackage, FiBox, FiRotateCcw, FiXCircle } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const OrderDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orderDetails, loading } = useSelector((state) => state.order);

  const [actionLoading, setActionLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    onConfirm: null,
  });

  useEffect(() => {
    dispatch(fetchOrderDetails(id));
  }, [dispatch, id]);

  const handleCancelOrder = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Order?',
      message: 'Are you sure you want to cancel this order? Item inventory stock will be restored.',
      variant: 'danger',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await axiosInstance.patch(`/orders/${id}/cancel`);
          toast.success('Order cancelled successfully.');
          dispatch(fetchOrderDetails(id));
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to cancel order.');
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleReturnOrder = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Request Return?',
      message: 'Are you sure you want to request a return for this delivered order?',
      variant: 'warning',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await axiosInstance.post(`/orders/${id}/return`, { reason: 'Customer Return' });
          toast.success('Return request submitted successfully.');
          dispatch(fetchOrderDetails(id));
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to request return.');
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading || !orderDetails) {
    return <Loader />;
  }

  const order = orderDetails;

  // Timeline Stepper Logic
  const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentStepIdx = STATUS_STEPS.indexOf(order.status || 'Pending');

  return (
    <div className="space-y-6 font-sans pb-16">
      
      {/* Header Back & Actions */}
      <div className="flex items-center justify-between">
        <Link to="/orders/my-orders" className="text-xs font-bold text-[#757575] hover:text-[#9C27B0] inline-flex items-center transition">
          <FiChevronLeft size={16} /> Back to My Orders
        </Link>
        <button
          onClick={handlePrintInvoice}
          className="flex items-center space-x-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#212121] text-xs font-bold rounded-full transition cursor-pointer print:hidden"
        >
          <FiPrinter size={14} /> <span>Print Invoice PDF</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight">Order Details</h1>
          <p className="text-xs text-[#757575] font-medium mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-xs font-bold text-[#757575]">
          Order ID: <span className="text-[#9C27B0] font-black">#{order._id}</span>
        </div>
      </div>

      {/* Visual Tracking Timeline Stepper */}
      {order.status !== 'Cancelled' && order.status !== 'Returned' ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider">Order Timeline</h2>
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { label: 'Ordered', icon: FiBox },
              { label: 'Packed', icon: FiPackage },
              { label: 'Shipped', icon: FiTruck },
              { label: 'Delivered', icon: FiCheck },
            ].map((st, idx) => {
              const isDone = currentStepIdx >= idx;
              const StepIcon = st.icon;
              return (
                <React.Fragment key={st.label}>
                  <div className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <StepIcon size={16} />
                    </div>
                    <span className={`text-[11px] font-bold ${isDone ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {st.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 transition ${currentStepIdx > idx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={`border rounded-2xl p-4 font-bold text-xs uppercase tracking-wider flex items-center space-x-2 ${
          order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {order.status === 'Cancelled' ? <FiXCircle size={18} /> : <FiRotateCcw size={18} />}
          <span>This order status is {order.status}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Products & Shipping/Payment Summaries) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Products List Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Products Ordered</h2>
            
            <div className="divide-y divide-slate-100">
              {order.orderItems?.map((item) => (
                <div key={item.product?._id || item._id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 w-2/3">
                    <div className="flex-shrink-0 w-16 h-16 bg-[#FAFAFA] border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden p-1">
                      <img src={getImageUrl(item.image || item.product?.images || item.product?.image)} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#212121] line-clamp-1">{item.name}</p>
                      <p className="text-[11px] text-[#757575]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#9C27B0] w-1/3 text-right">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Delivery Address */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
              <h3 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
                <FiMapPin className="mr-1.5 text-[#9C27B0]" /> Delivery Address
              </h3>
              <div className="text-xs font-medium text-[#757575] space-y-1">
                <p className="text-[#212121] font-bold">{order.user?.name}</p>
                <p>{order.shippingAddress?.address}</p>
                <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                <p>{order.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-3 shadow-xs">
              <h3 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
                <FiCreditCard className="mr-1.5 text-[#9C27B0]" /> Payment Details
              </h3>
              <div className="text-xs font-medium text-[#757575] space-y-2">
                <div>
                  <p className="text-[10px] text-[#757575] font-bold uppercase">Payment Method</p>
                  <p className="text-[#212121] font-bold uppercase">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#757575] font-bold uppercase">Payment Status</p>
                  {order.isPaid ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-block mt-0.5">Paid on {new Date(order.paidAt).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-block mt-0.5">Unpaid</span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Total Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Payment Summary</h2>
            
            <div className="space-y-2.5 text-xs font-semibold text-[#757575]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-[#212121]">₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
              </div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span>- ₹{order.discountPrice?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="text-[#212121]">₹{order.taxPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-[#212121]">
                  {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
              <span className="text-xs font-black text-[#212121]">Grand Total</span>
              <span className="text-2xl font-black text-[#9C27B0]">₹{order.totalPrice?.toLocaleString('en-IN')}</span>
            </div>

            {/* Cancel & Return Action Buttons */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              {['Pending', 'Processing'].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
                >
                  Cancel Order
                </button>
              )}
              {order.status === 'Delivered' && (
                <button
                  onClick={handleReturnOrder}
                  disabled={actionLoading}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
                >
                  Request Return
                </button>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        loading={actionLoading}
      />

    </div>
  );
};

export default OrderDetails;
