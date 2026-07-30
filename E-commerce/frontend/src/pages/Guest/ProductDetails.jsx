import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, createProductReview, clearProductStates } from '../../features/product/productSlice.js';
import { addItemToCart } from '../../features/cart/cartSlice.js';
import { addItemToWishlist, removeItemFromWishlist } from '../../features/wishlist/wishlistSlice.js';
import { addToCompare } from '../../features/compare/compareSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { toast } from 'react-toastify';
import { FiHeart, FiShoppingCart, FiInfo, FiUser, FiShare2, FiCopy, FiCheck, FiTruck, FiShield, FiCreditCard, FiLayers } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

const ProductDetails = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error, success } = useSelector((state) => state.product);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });

  // Delivery checker states
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    dispatch(fetchProductDetails(slug));
    return () => {
      dispatch(clearProductStates());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (product) {
      setActiveImage(getImageUrl(product));

      // Save to Recently Viewed Products in localStorage
      try {
        const savedRecent = JSON.parse(localStorage.getItem('croma_recently_viewed') || '[]');
        const filtered = [product, ...savedRecent.filter((p) => p._id !== product._id)].slice(0, 8);
        localStorage.setItem('croma_recently_viewed', JSON.stringify(filtered));
      } catch (e) {
        console.error('Failed to update recently viewed', e);
      }
    }
  }, [product]);

  useEffect(() => {
    if (success) {
      toast.success('Review submitted successfully!');
      setReviewComment('');
      setReviewRating(5);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductStates());
    }
  }, [error, dispatch]);

  const isWishlisted = wishlist?.products?.some((p) => p._id === product?._id) || false;
  const isCompared = compareItems?.some((p) => p._id === product?._id) || false;

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to add to wishlist.');
      return;
    }
    if (isWishlisted) {
      dispatch(removeItemFromWishlist(product._id))
        .unwrap()
        .then(() => toast.success('Removed from wishlist.'));
    } else {
      dispatch(addItemToWishlist(product._id))
        .unwrap()
        .then(() => toast.success('Added to wishlist.'));
    }
  };

  const handleCompare = () => {
    if (isCompared) {
      toast.info('Item is already in your compare list.');
      return;
    }
    dispatch(addToCompare(product));
    toast.success('Added to compare list!');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product link copied to clipboard!');
  };

  const handleDeliveryCheck = (e) => {
    e.preventDefault();
    if (!pincode || pincode.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit postal code.');
      return;
    }
    const days = Math.floor(Math.random() * 3) + 2;
    setDeliveryStatus(`Available! Standard Delivery in ${days} days.`);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to add to cart.');
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity }))
      .unwrap()
      .then(() => toast.success('Added to cart!'))
      .catch((err) => toast.error(err));
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to proceed to checkout & payment.');
      navigate('/login?redirect=/checkout');
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity }))
      .unwrap()
      .then(() => {
        navigate('/checkout');
      })
      .catch((err) => toast.error(err));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.warning('Please sign in to leave reviews.');
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please enter a review description.');
      return;
    }
    dispatch(createProductReview({ slug, rating: reviewRating, comment: reviewComment }));
  };

  if (loading || !product) {
    return <Loader />;
  }

  return (
    <div className="space-y-10 font-sans pb-16">
      
      {/* Product top showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        
        {/* Left Column: Image Gallery with Interactive Zoom */}
        <div className="space-y-4">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoomPos((prev) => ({ ...prev, show: false }))}
            className="relative aspect-square bg-[#FAFAFA] border border-slate-100 rounded-2xl overflow-hidden p-6 flex items-center justify-center cursor-crosshair group shadow-xs"
          >
            <img
              src={activeImage || '/placeholder.png'}
              alt={product.title}
              className="w-full h-full object-contain pointer-events-none"
            />
            {zoomPos.show && (
              <div
                className="absolute inset-0 pointer-events-none bg-no-repeat bg-white z-20 transition-opacity duration-150"
                style={{
                  backgroundImage: `url(${activeImage})`,
                  backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                  backgroundSize: '250%',
                }}
              />
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
              {product.images.map((imgObj, idx) => {
                const imgUrl = getImageUrl(imgObj);
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 border rounded-2xl p-1.5 flex items-center justify-center bg-white shrink-0 cursor-pointer transition ${
                      activeImage === imgUrl ? 'border-[#9C27B0] ring-2 ring-[#9C27B0]/20' : 'border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#9C27B0] uppercase tracking-widest">{product.brand || 'ShopIndia'}</span>
                <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight leading-snug">{product.title}</h1>
                <p className="text-xs text-[#757575] font-medium">Category: {product.category?.name}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 text-[#757575] hover:text-[#9C27B0] border border-slate-200 rounded-full shadow-xs cursor-pointer hover:bg-purple-50 transition"
                title="Copy Product Link"
              >
                <FiCopy size={16} />
              </button>
            </div>

            {/* Ratings summary */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-xs font-black">
                <span>{product.ratings ? Number(product.ratings).toFixed(1) : '4.5'}</span>
                <span className="text-amber-500">★</span>
              </div>
              <span className="text-xs text-[#757575] font-semibold">
                ({product.numReviews || product.reviewCount || 0} customer reviews)
              </span>
            </div>

            {/* Pricing & Badges */}
            <div className="border-t border-b border-slate-100 py-4 space-y-3">
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-[#212121]">₹{product.price.toLocaleString('en-IN')}</span>
                {product.discountPrice > 0 && (
                  <span className="text-sm text-[#757575] line-through font-semibold">₹{product.discountPrice.toLocaleString('en-IN')}</span>
                )}
              </div>

              {/* Badges: Warranty & EMI */}
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center space-x-1.5 bg-purple-50 text-[#9C27B0] px-3 py-1 rounded-full border border-purple-100">
                  <FiCreditCard size={14} />
                  <span>No Cost EMI starting ₹{Math.round(product.price / 6)}/mo</span>
                </div>
                <div className="flex items-center space-x-1.5 bg-pink-50 text-[#FF4FA3] px-3 py-1 rounded-full border border-pink-100">
                  <FiShield size={14} />
                  <span>1 Year Brand Warranty</span>
                </div>
              </div>

              <div>
                {product.stock > 0 ? (
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block">
                    In Stock ({product.stock} items available)
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-full inline-block">
                    Out Of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Availability Checker */}
            <div className="bg-[#FAFAFA] border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#212121] uppercase tracking-wider">
                <FiTruck size={16} className="text-[#9C27B0]" />
                <span>Check Delivery Pincode</span>
              </div>
              <form onSubmit={handleDeliveryCheck} className="flex space-x-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9C27B0] bg-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#212121] hover:bg-[#9C27B0] text-white text-xs font-bold rounded-full transition cursor-pointer"
                >
                  Check
                </button>
              </form>
              {deliveryStatus && (
                <p className="text-xs font-bold text-emerald-600 flex items-center space-x-1 pt-1">
                  <FiCheck size={14} /> <span>{deliveryStatus}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-2">
              <h3 className="text-xs font-black text-[#212121] uppercase tracking-wider">Description</h3>
              <p className="text-xs text-[#757575] leading-relaxed font-medium">{product.description}</p>
            </div>

          </div>

          {/* User actions */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {product.stock > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-[#212121]">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-1 text-slate-700 font-black hover:bg-purple-100 transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-xs font-black text-[#212121]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3.5 py-1 text-slate-700 font-black hover:bg-purple-100 transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {/* Add to Wishlist */}
              <button
                onClick={handleWishlist}
                className={`p-3 border rounded-2xl shadow-xs transition cursor-pointer ${
                  isWishlisted
                    ? 'bg-pink-50 border-[#FF4FA3] text-[#FF4FA3]'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-[#FF4FA3] hover:border-[#FF4FA3]'
                }`}
                title="Wishlist"
              >
                <FiHeart className={isWishlisted ? 'fill-current' : ''} size={20} />
              </button>

              {/* Compare Button */}
              <button
                onClick={handleCompare}
                className={`p-3 border rounded-2xl shadow-xs transition cursor-pointer ${
                  isCompared
                    ? 'bg-purple-50 border-[#9C27B0] text-[#9C27B0]'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-[#9C27B0] hover:border-[#9C27B0]'
                }`}
                title="Compare"
              >
                <FiLayers size={20} />
              </button>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock < 1}
                className="flex-1 py-3 px-4 rounded-full text-xs font-bold text-white bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FiShoppingCart size={17} />
                <span>Add to Cart</span>
              </button>

              {/* Buy Now */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock < 1}
                className="flex-1 py-3 px-4 rounded-full text-xs font-bold text-[#212121] bg-white border-2 border-[#212121] hover:bg-[#212121] hover:text-white disabled:border-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Buy Now
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Specifications details */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-base font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Technical Specifications</h2>
          <div className="max-w-2xl">
            <table className="min-w-full divide-y divide-slate-100">
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <tr key={key}>
                    <td className="py-3 pr-4 font-bold text-[#212121] w-1/3 capitalize">{key}</td>
                    <td className="py-3 pl-4 text-[#757575]">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {(() => {
        try {
          const recent = JSON.parse(localStorage.getItem('croma_recently_viewed') || '[]').filter((p) => p._id !== product._id);
          if (recent.length === 0) return null;
          return (
            <section className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Recently Viewed Items</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {recent.slice(0, 6).map((item) => (
                  <Link
                    key={item._id}
                    to={`/products/${item.slug}`}
                    className="group border border-slate-100 rounded-2xl p-3 hover:border-[#9C27B0] transition bg-white block text-center space-y-2 shadow-xs"
                  >
                    <div className="h-24 flex items-center justify-center p-1">
                      <img src={getImageUrl(item.images)} alt={item.title} className="max-h-full max-w-full object-contain group-hover:scale-105 transition" />
                    </div>
                    <p className="text-xs font-bold text-[#212121] line-clamp-1 group-hover:text-[#9C27B0] transition">{item.title}</p>
                    <p className="text-xs font-black text-[#9C27B0]">₹{(item.discountPrice > 0 ? item.discountPrice : item.price).toLocaleString('en-IN')}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        } catch (e) {
          return null;
        }
      })()}

      {/* Reviews & Ratings Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Review list */}
        <div className="lg:col-span-2 space-y-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h2 className="text-base font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Customer Reviews</h2>
          
          {product.reviews && product.reviews.length === 0 ? (
            <div className="text-center py-12 text-[#757575]">
              <FiInfo className="mx-auto mb-2 text-slate-300" size={28} />
              <p className="text-xs font-bold">No reviews submitted yet for this product.</p>
            </div>
          ) : (
            <div className="space-y-6 divide-y divide-slate-100">
              {product.reviews?.map((review, idx) => (
                <div key={idx} className={`${idx > 0 ? 'pt-6' : ''} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-purple-100 p-2 rounded-full text-[#9C27B0]">
                        <FiUser size={14} />
                      </div>
                      <span className="text-xs font-bold text-[#212121]">{review.name || review.user?.name || 'Verified Buyer'}</span>
                    </div>
                    <span className="text-[11px] text-[#757575] font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-400 text-xs">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </div>
                  <p className="text-xs text-[#757575] font-medium leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post new Review form */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6 h-fit shadow-xs">
          <h2 className="text-base font-black text-[#212121] uppercase tracking-wider border-b border-slate-100 pb-3">Submit Review</h2>
          
          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#212121]">Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-bold bg-slate-50"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Bad</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121]">Your Review</label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this item..."
                  className="mt-1 block w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full text-xs font-bold text-white bg-[#9C27B0] hover:bg-[#7B1FA2] shadow-xs transition cursor-pointer"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <div className="text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-xs font-semibold text-[#757575] mb-4">Please sign in to submit a rating.</p>
              <Link to="/login" className="inline-block py-2.5 px-5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-xs">
                Sign In
              </Link>
            </div>
          )}
        </div>

      </section>

    </div>
  );
};

export default ProductDetails;
