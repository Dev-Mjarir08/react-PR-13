import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fetchCart, clearCart } from '../../features/cart/cartSlice.js';
import { createOrder, sendOrderOtp, clearOrderStates } from '../../features/order/orderSlice.js';
import { fetchAddresses, addAddress } from '../../features/address/addressSlice.js';
import Loader from '../../components/common/Loader.jsx';
import axiosInstance from '../../api/axios.js';
import { toast } from 'react-toastify';
import {
  FiCheck,
  FiMapPin,
  FiCreditCard,
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiPlus,
  FiCheckCircle,
  FiSend,
  FiLock,
  FiSmartphone,
  FiGlobe,
  FiX,
  FiCheckSquare,
} from 'react-icons/fi';
import Modal from '../../components/common/Modal.jsx';

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentStep, setCurrentStep] = useState(1); // 1: Cart, 2: Address, 3: Payment, 4: Confirmation

  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { addresses } = useSelector((state) => state.address);
  const { loading: orderLoading, success: orderSuccess } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const appliedCouponCode = location.state?.couponCode || '';
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Address selection states
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: user?.phone || '',
  });

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [showMockRazorpayModal, setShowMockRazorpayModal] = useState(false);
  const [pendingRazorpayOrder, setPendingRazorpayOrder] = useState(null);

  // Razorpay Gateway Modal Internal States
  const [razorpayTab, setRazorpayTab] = useState('card'); // 'card' | 'upi' | 'netbanking' | 'wallet'
  const [cardDetails, setCardDetails] = useState({ number: '4532 •••• •••• 8910', name: user?.name || '', expiry: '08/28', cvv: '•••' });
  const [upiId, setUpiId] = useState(`${user?.email?.split('@')[0] || 'user'}@upi`);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Order Confirmation OTP Modal States
  const [showOrderOtpModal, setShowOrderOtpModal] = useState(false);
  const [orderOtpCode, setOrderOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // Load cart data & addresses
  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchAddresses());
  }, [dispatch]);

  // Set default selected address
  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Load coupon details if passed
  useEffect(() => {
    if (appliedCouponCode && cart) {
      const currentSubtotal = cart?.items?.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;
      setCouponLoading(true);
      axiosInstance
        .post('/coupons/validate', { code: appliedCouponCode, cartAmount: currentSubtotal })
        .then((res) => setActiveCoupon(res.data.data))
        .catch(() => toast.error('Failed to validate applied coupon.'))
        .finally(() => setCouponLoading(false));
    }
  }, [appliedCouponCode, cart]);

  const handleAddNewAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddr.address || !newAddr.city || !newAddr.postalCode) {
      toast.error('Please fill in required address fields.');
      return;
    }
    dispatch(addAddress(newAddr))
      .unwrap()
      .then((updatedAddresses) => {
        toast.success('New address added!');
        const newest = updatedAddresses[updatedAddresses.length - 1];
        if (newest) setSelectedAddressId(newest._id);
        setShowAddAddressModal(false);
        setNewAddr({ label: 'Home', address: '', city: '', postalCode: '', country: 'India', phone: user?.phone || '' });
      })
      .catch((err) => toast.error(err));
  };

  // Step A: Initiate Order Checkout -> Trigger Email OTP
  const handleInitiateOrderCheckout = () => {
    const activeAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!activeAddress) {
      toast.error('Please select or add a shipping address.');
      setCurrentStep(2);
      return;
    }

    setSendingOtp(true);
    dispatch(sendOrderOtp())
      .unwrap()
      .then((msg) => {
        toast.info(msg || `Order OTP sent to your registered email (${user?.email}).`);
        setOrderOtpCode('');
        setShowOrderOtpModal(true);
      })
      .catch((err) => {
        toast.error(err || 'Failed to send Order OTP.');
      })
      .finally(() => setSendingOtp(false));
  };

  // Helper to dynamically load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Step B: Submit Order with Verified OTP
  const handlePlaceOrderWithOtp = async (e) => {
    e.preventDefault();
    if (!orderOtpCode || orderOtpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    const activeAddress = addresses.find((a) => a._id === selectedAddressId);
    if (!activeAddress) {
      toast.error('Please select a shipping address.');
      setShowOrderOtpModal(false);
      setCurrentStep(2);
      return;
    }

    const orderPayload = {
      shippingAddress: {
        address: activeAddress.address,
        city: activeAddress.city,
        postalCode: activeAddress.postalCode,
        country: activeAddress.country || 'India',
      },
      paymentMethod,
      otp: orderOtpCode.trim(),
    };

    if (activeCoupon) {
      orderPayload.couponCode = activeCoupon.couponCode || activeCoupon.code;
    }

    try {
      // Step 1: Create Order in DB
      const resultOrder = await dispatch(createOrder(orderPayload)).unwrap();
      setShowOrderOtpModal(false);
      setPlacedOrder(resultOrder);

      // Step 2: Handle Razorpay Online Payment Gateway if selected
      if (paymentMethod === 'Razorpay' || paymentMethod === 'Card') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.info('Razorpay SDK failed to load. Proceeding with simulated digital confirmation.');
          completeOrderFlow(resultOrder);
          return;
        }

        // Fetch Razorpay order details from backend
        const razorpayRes = await axiosInstance.post('/payments/create-razorpay-order', {
          orderId: resultOrder._id,
          amount: resultOrder.totalPrice,
        });

        const rzpData = razorpayRes.data.data;

        // If mock key or test mode, use simulated interactive Razorpay modal
        if (rzpData.isMock || rzpData.key === 'rzp_test_mockkey123') {
          setPendingRazorpayOrder({
            dbOrderId: resultOrder._id,
            amount: resultOrder.totalPrice,
            razorpayOrderId: rzpData.orderId,
          });
          setShowMockRazorpayModal(true);
          return;
        }

        const options = {
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: rzpData.name,
          description: rzpData.description,
          order_id: rzpData.orderId,
          handler: async (response) => {
            try {
              await axiosInstance.post('/payments/verify-razorpay-payment', {
                dbOrderId: resultOrder._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              toast.success('Razorpay Payment Verified!');
              completeOrderFlow(resultOrder);
            } catch (verErr) {
              toast.error('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: user?.phone,
          },
          theme: {
            color: '#2563EB',
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
          toast.error(`Payment Failed: ${response.error.description || 'Transaction declined.'}`);
        });
        paymentObject.open();
      } else {
        // Cash on Delivery flow
        completeOrderFlow();
      }
    } catch (err) {
      toast.error(err || 'Invalid Order OTP or checkout failed.');
    }
  };

  const handleMockPaymentVerification = async () => {
    if (!pendingRazorpayOrder) return;
    setIsVerifyingPayment(true);
    try {
      await axiosInstance.post('/payments/verify-razorpay-payment', {
        dbOrderId: pendingRazorpayOrder.dbOrderId,
        razorpayOrderId: pendingRazorpayOrder.razorpayOrderId,
        razorpayPaymentId: `pay_rzp_${Date.now()}`,
        razorpaySignature: 'mock_signature_passed',
      });
      toast.success('Razorpay Payment Verified Successfully!');
      setShowMockRazorpayModal(false);
      completeOrderFlow();
    } catch (err) {
      toast.error('Payment verification failed.');
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const completeOrderFlow = () => {
    dispatch(clearCart());
    dispatch(clearOrderStates());
    setCurrentStep(4);
  };

  if ((cartLoading || couponLoading) && !cart) {
    return <Loader />;
  }

  // Cost calculations
  const subtotal = cart?.items?.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;

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

  const taxAmount = (subtotal - calculatedDiscount) * 0.05;
  const shippingCharges = subtotal > 5000 || subtotal === 0 ? 0 : 150;
  const grandTotal = subtotal - calculatedDiscount + taxAmount + shippingCharges;

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-16">
      
      {/* 4-Step Checkout Stepper UI */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {[
            { id: 1, label: 'Cart Items', icon: FiShoppingBag },
            { id: 2, label: 'Address', icon: FiMapPin },
            { id: 3, label: 'Payment', icon: FiCreditCard },
            { id: 4, label: 'Confirmation', icon: FiCheckCircle },
          ].map((step, idx) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const StepIcon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center space-y-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#9C27B0] text-white shadow-md ring-4 ring-purple-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <FiCheck size={18} /> : <StepIcon size={17} />}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isCurrent ? 'text-[#9C27B0]' : isCompleted ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition ${
                      currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Stepper Panels */}
      {currentStep === 4 ? (
        /* Step 4: Order Confirmation */
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <FiCheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#212121]">Order Placed Successfully!</h1>
            <p className="text-xs text-[#757575] font-medium leading-relaxed">
              Thank you for shopping with ShopIndia. We have received your order and sent confirmation to your email.
            </p>
            {placedOrder && (
              <p className="text-xs font-bold text-[#9C27B0] bg-purple-50 border border-purple-100 py-1.5 px-4 rounded-full inline-block mt-2">
                Order ID: #{placedOrder._id}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/orders/my-orders"
              className="px-6 py-3 bg-[#9C27B0] text-white text-xs font-bold rounded-full shadow-md hover:bg-[#7B1FA2] transition"
            >
              Track My Order
            </Link>
            <Link
              to="/products"
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#212121] text-xs font-bold rounded-full transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Interactive Steps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Cart Items Summary */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                <h2 className="text-sm font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
                  <FiShoppingBag className="mr-2 text-[#9C27B0]" /> Review Cart Items ({cart?.items?.length || 0})
                </h2>
                <div className="space-y-3 divide-y divide-slate-100">
                  {cart?.items?.map((item) => (
                    <div key={item.product._id} className="pt-3 flex items-center space-x-4">
                      <img
                        src={item.product.images?.[0]?.url || item.product.images?.[0] || '/placeholder.png'}
                        alt={item.product.title}
                        className="w-16 h-16 object-contain border border-slate-100 rounded-2xl p-1 bg-[#FAFAFA]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#212121] truncate">{item.product.title}</p>
                        <p className="text-[11px] text-[#757575]">Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="text-xs font-black text-[#9C27B0]">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-md transition cursor-pointer"
                  >
                    Proceed to Delivery Address
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Address Selection */}
            {currentStep === 2 && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-black text-[#212121] uppercase tracking-wider flex items-center">
                    <FiMapPin className="mr-2 text-[#9C27B0]" /> Select Delivery Address
                  </h2>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="flex items-center space-x-1 text-xs font-bold text-[#9C27B0] hover:text-[#7B1FA2] bg-purple-50 px-3 py-1.5 rounded-full transition cursor-pointer"
                  >
                    <FiPlus /> <span>Add New</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`p-4 border rounded-2xl cursor-pointer transition relative flex flex-col justify-between ${
                          isSelected ? 'border-[#9C27B0] bg-purple-50/40 ring-2 ring-[#9C27B0]/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-[#9C27B0] uppercase bg-purple-100 px-2.5 py-0.5 rounded-full">{addr.label || 'Home'}</span>
                            {addr.isDefault && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Default</span>}
                          </div>
                          <p className="text-xs font-bold text-[#212121] pt-1">{addr.address}</p>
                          <p className="text-[11px] text-[#757575] font-medium">{addr.city}, {addr.postalCode}</p>
                          <p className="text-[11px] text-[#757575]">{addr.country || 'India'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#212121] text-xs font-bold rounded-full transition cursor-pointer"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedAddressId) {
                        toast.error('Please select a shipping address.');
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    className="px-6 py-3 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-md transition cursor-pointer"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Method Selection */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 shadow-xs">
                <h2 className="text-sm font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
                  <FiCreditCard className="mr-2 text-[#9C27B0]" /> Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label
                    onClick={() => setPaymentMethod('COD')}
                    className={`border rounded-2xl p-4 flex items-center space-x-3 cursor-pointer transition ${
                      paymentMethod === 'COD' ? 'border-[#9C27B0] bg-purple-50/40 ring-2 ring-[#9C27B0]/20' : 'border-slate-200'
                    }`}
                  >
                    <input type="radio" checked={paymentMethod === 'COD'} readOnly className="text-[#9C27B0]" />
                    <div>
                      <p className="text-xs font-bold text-[#212121]">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-[#757575]">Pay cash upon arrival</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('Razorpay')}
                    className={`border rounded-2xl p-4 flex items-center space-x-3 cursor-pointer transition ${
                      paymentMethod === 'Razorpay' || paymentMethod === 'Card' ? 'border-[#9C27B0] bg-purple-50/40 ring-2 ring-[#9C27B0]/20' : 'border-slate-200'
                    }`}
                  >
                    <input type="radio" checked={paymentMethod === 'Razorpay' || paymentMethod === 'Card'} readOnly className="text-[#9C27B0]" />
                    <div>
                      <p className="text-xs font-bold text-[#212121]">Razorpay Online Payment</p>
                      <p className="text-[11px] text-[#757575]">UPI, Cards, NetBanking, Wallets</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#212121] text-xs font-bold rounded-full transition cursor-pointer"
                  >
                    Back to Address
                  </button>
                  <button
                    onClick={handleInitiateOrderCheckout}
                    disabled={sendingOtp || orderLoading}
                    className="px-7 py-3.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {sendingOtp ? 'Sending OTP to Email...' : `Send OTP & Confirm Order (₹${grandTotal.toLocaleString('en-IN')})`}
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs sticky top-24">
              <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Order Summary</h2>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs font-semibold text-[#757575]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#212121] font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Coupon</span>
                    <span>- ₹{calculatedDiscount.toLocaleString('en-IN')}</span>
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
                <span className="text-xs font-black text-[#212121]">Grand Total</span>
                <span className="text-2xl font-black text-[#9C27B0]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-[#212121] border-b border-slate-100 pb-3">Add New Shipping Address</h3>
            <form onSubmit={handleAddNewAddressSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#757575]">Address Type</label>
                <select
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-bold bg-slate-50 mt-1"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#757575]">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.address}
                  onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                  placeholder="123 Park Street, Flat 4B"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium bg-slate-50 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#757575]">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium bg-slate-50 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#757575]">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium bg-slate-50 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 bg-slate-100 text-[#212121] text-xs font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation OTP Verification Modal */}
      <Modal isOpen={showOrderOtpModal} onClose={() => setShowOrderOtpModal(false)}>
        <div className="p-4 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-purple-50 text-[#9C27B0] border border-purple-100 rounded-full flex items-center justify-center mx-auto">
              <FiSend size={24} />
            </div>
            <h2 className="text-lg font-black text-[#212121]">Enter Email OTP Code</h2>
            <p className="text-xs text-[#757575] max-w-sm mx-auto">
              We sent a 6-digit OTP code to your registered email <span className="font-bold text-[#212121]">{user?.email}</span> to authorize your order.
            </p>
          </div>

          <form onSubmit={handlePlaceOrderWithOtp} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={6}
                value={orderOtpCode}
                onChange={(e) => setOrderOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9C27B0] bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={orderLoading}
              className="w-full py-3.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold text-xs rounded-full transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {orderLoading ? 'Verifying & Placing Order...' : 'Verify OTP & Complete Order'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-[#757575]">Didn't receive code?</span>
            <button
              type="button"
              onClick={handleInitiateOrderCheckout}
              disabled={sendingOtp}
              className="font-bold text-[#9C27B0] hover:underline cursor-pointer"
            >
              {sendingOtp ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Enhanced Multi-Tab Secure Razorpay Payment Gateway Modal */}
      {showMockRazorpayModal && pendingRazorpayOrder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            
            {/* Gateway Header */}
            <div className="bg-[#9C27B0] text-white p-5 relative">
              <button
                onClick={() => {
                  setShowMockRazorpayModal(false);
                  toast.error('Razorpay payment cancelled by user.');
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 transition cursor-pointer"
              >
                <FiX size={18} />
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-white text-lg">
                  R
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xs font-black tracking-wide text-white">Razorpay Secure Gateway</h3>
                    <span className="bg-white/20 text-white border border-white/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                      256-Bit SSL
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-100 font-medium">Merchant: ShopIndia E-Commerce</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-purple-100">Amount Payable:</span>
                <span className="text-lg font-black text-white">₹{pendingRazorpayOrder.amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Interactive Payment Method Selector Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50 p-1">
              {[
                { id: 'card', label: 'Card', icon: FiCreditCard },
                { id: 'upi', label: 'UPI / QR', icon: FiSmartphone },
                { id: 'netbanking', label: 'NetBanking', icon: FiGlobe },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isActive = razorpayTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setRazorpayTab(tab.id)}
                    className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      isActive ? 'bg-white text-[#9C27B0] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TabIcon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="p-6 space-y-4">
              
              {/* Card Tab */}
              {razorpayTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value={cardDetails.number}
                      className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">Expiry Date</label>
                      <input
                        type="text"
                        readOnly
                        value={cardDetails.expiry}
                        className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600">CVV</label>
                      <input
                        type="password"
                        readOnly
                        value={cardDetails.cvv}
                        className="mt-1 block w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Tab */}
              {razorpayTab === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-[#9C27B0]"
                    />
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-between text-xs">
                    <span className="font-bold text-[#9C27B0]">Supported Apps:</span>
                    <span className="text-[11px] font-bold text-purple-900">Google Pay • PhonePe • Paytm • BHIM</span>
                  </div>
                </div>
              )}

              {/* NetBanking Tab */}
              {razorpayTab === 'netbanking' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Security Shield Notice */}
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
                <FiShield className="text-emerald-500" size={14} />
                <span>PCI-DSS Level 1 Verified • Encrypted Checkout Session</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleMockPaymentVerification}
                  disabled={isVerifyingPayment}
                  className="w-full py-3 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-black rounded-full shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifyingPayment ? 'Verifying Payment...' : `Authorize & Pay ₹${pendingRazorpayOrder.amount?.toLocaleString('en-IN')}`}
                </button>
                <button
                  onClick={() => {
                    setShowMockRazorpayModal(false);
                    toast.error('Payment failure simulated. Order remains unpaid.');
                  }}
                  className="w-full py-2 text-slate-400 hover:text-red-600 text-xs font-bold transition cursor-pointer"
                >
                  Simulate Payment Decline
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
