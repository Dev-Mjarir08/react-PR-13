import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItemQuantity, removeItemFromCart } from '../../features/cart/cartSlice.js';
import Loader from '../../components/common/Loader.jsx';
import axiosInstance from '../../api/axios.js';
import { FiTrash2, FiInfo, FiPercent, FiArrowRight, FiShoppingBag, FiShield, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { getImageUrl } from '../../utils/imageUtils.js';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector((state) => state.cart);

  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (productId, currentQty, stock, increment) => {
    const newQty = increment ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.error('Cannot select quantity higher than available stock.');
      return;
    }
    dispatch(updateCartItemQuantity({ productId, quantity: newQty }))
      .unwrap()
      .then(() => toast.success('Cart updated.'));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeItemFromCart(productId))
      .unwrap()
      .then(() => toast.success('Item removed from cart.'));
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }

    const currentSubtotal = cart?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

    setCouponLoading(true);
    axiosInstance.post('/coupons/validate', { code: couponCode, cartAmount: currentSubtotal })
      .then((res) => {
        const couponData = res.data.data;
        setActiveCoupon(couponData);
        toast.success(`Coupon "${couponData.couponCode || couponCode}" applied!`);
      })
      .catch((err) => {
        toast.error(err.message || 'Invalid coupon code.');
        setActiveCoupon(null);
        setDiscountAmount(0);
      })
      .finally(() => setCouponLoading(false));
  };

  if (loading && !cart) {
    return <Loader />;
  }

  // Calculate pricing
  const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

  // Calculate discount based on active coupon
  let calculatedDiscount = 0;
  if (activeCoupon) {
    if (activeCoupon.discountAmount !== undefined) {
      calculatedDiscount = activeCoupon.discountAmount;
    } else {
      const type = (activeCoupon.discountType || '').toLowerCase();
      const val = activeCoupon.discountValue || activeCoupon.value || 0;
      if (type === 'flat') {
        calculatedDiscount = val;
      } else if (type === 'percentage' || type === 'percent') {
        calculatedDiscount = (subtotal * val) / 100;
      }
    }
    calculatedDiscount = Math.min(calculatedDiscount, subtotal);
  }

  const taxAmount = (subtotal - calculatedDiscount) * 0.05; // 5% GST standard rate
  const shippingCharges = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal - calculatedDiscount + taxAmount + shippingCharges;

  const handleProceed = () => {
    navigate('/checkout', { state: { couponCode: activeCoupon?.code } });
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight flex items-center space-x-2">
            <FiShoppingBag className="text-[#9C27B0]" />
            <span>My Shopping Cart ({cart?.items?.length || 0})</span>
          </h1>
          <p className="text-xs text-[#757575] font-medium mt-0.5">Review items in your cart before checkout</p>
        </div>
      </div>

      {!cart?.items || cart.items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl max-w-md mx-auto space-y-4 shadow-xs p-8">
          <div className="w-16 h-16 bg-purple-50 text-[#9C27B0] rounded-full flex items-center justify-center mx-auto border border-purple-100">
            <FiShoppingBag size={28} />
          </div>
          <h2 className="text-base font-black text-[#212121]">Your Cart is Empty</h2>
          <p className="text-xs text-[#757575] font-medium max-w-xs mx-auto">Explore products and add them to your cart.</p>
          <div className="pt-2">
            <Link to="/products" className="inline-flex items-center py-2.5 px-6 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold text-xs rounded-full shadow-xs transition">
              Start Shopping <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.product._id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs hover:shadow-md transition duration-300"
              >
                {/* Product Detail */}
                <div className="flex items-center space-x-4 w-full sm:w-2/3">
                  <div className="w-20 h-20 bg-[#FAFAFA] rounded-2xl border border-slate-100 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                    <img src={getImageUrl(item.product.images && item.product.images.length > 0 ? item.product.images : item.product.image)} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-[#9C27B0] uppercase tracking-widest">{item.product.brand || 'ShopIndia'}</span>
                    <h3 className="text-xs font-bold text-[#212121] line-clamp-1">{item.product.title}</h3>
                    <div className="flex items-baseline space-x-2 pt-1">
                      <span className="text-sm font-extrabold text-[#212121]">₹{item.product.price.toLocaleString('en-IN')}</span>
                      {item.product.discountPrice > 0 && (
                        <span className="text-[11px] text-[#757575] line-through">₹{item.product.discountPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adjustments & Totals */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-1/3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">

                  {/* Quantity adjustments */}
                  <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-slate-50">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, false)}
                      className="px-3 py-1 text-slate-700 font-black hover:bg-purple-100 transition cursor-pointer text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-[#212121]">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity, item.product.stock, true)}
                      className="px-3 py-1 text-slate-700 font-black hover:bg-purple-100 transition cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Total price & Delete */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-black text-[#9C27B0] w-20 text-right">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-slate-400 hover:text-red-600 transition cursor-pointer p-1"
                      title="Remove Item"
                    >
                      <FiTrash2 size={17} />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Pricing Summary Side Panel */}
          <div className="space-y-6">

            {/* Coupon Code section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-3.5 shadow-xs">
              <h3 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center">
                <FiPercent className="mr-1.5 text-[#FF4FA3]" /> Apply Coupon Code
              </h3>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="COUPON CODE"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={couponLoading}
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-full text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#9C27B0] bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-5 py-2 bg-[#212121] hover:bg-[#9C27B0] text-white text-xs font-bold rounded-full transition cursor-pointer"
                >
                  Apply
                </button>
              </form>
              {activeCoupon && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center justify-between">
                  <span>Applied: {activeCoupon.code}</span>
                  <button onClick={() => setActiveCoupon(null)} className="text-red-500 font-bold hover:underline cursor-pointer">Remove</button>
                </div>
              )}
            </div>

            {/* Calculations Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs sticky top-24">
              <h3 className="text-xs font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Order Price Summary</h3>

              <div className="space-y-2.5 text-xs font-semibold text-[#757575]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#212121] font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">- ₹{calculatedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST Tax (5%)</span>
                  <span className="text-[#212121] font-bold">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-[#212121] font-bold">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges.toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
                <span className="text-sm font-black text-[#212121]">Grand Total</span>
                <span className="text-2xl font-black text-[#9C27B0]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={handleProceed}
                className="w-full py-3.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Cart;
