import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../features/cart/cartSlice.js';
import { addItemToWishlist, removeItemFromWishlist } from '../../features/wishlist/wishlistSlice.js';
import { addToCompare } from '../../features/compare/compareSlice.js';
import { FiHeart, FiShoppingCart, FiEye, FiLayers, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/imageUtils.js';

const ProductCard = ({ product, onQuickView }) => {
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state) => state.wishlist);
  const { compareItems } = useSelector((state) => state.compare);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const isWishlisted = wishlist?.products?.some((p) => p._id === product._id) || false;
  const isCompared = compareItems?.some((p) => p._id === product._id) || false;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('Please sign in to add items to your wishlist.');
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

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      toast.info('Item is already in your comparison list.');
      return;
    }
    dispatch(addToCompare(product));
    toast.success('Added to comparison list!');
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('Please sign in to add items to your cart.');
      return;
    }

    if (product.stock < 1) {
      toast.error('This item is currently out of stock.');
      return;
    }

    dispatch(addItemToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success(`${product.title} added to cart!`);
      })
      .catch((err) => {
        toast.error(err || 'Failed to add to cart.');
      });
  };

  const currentPrice = product.price;
  const originalPrice = product.discountPrice ? product.discountPrice : null;
  const discountPercent = originalPrice && originalPrice > currentPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-[#FAFAFA] border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      {/* Floating Wishlist Button */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={handleWishlist}
        className={`absolute right-3 top-3 z-10 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 cursor-pointer ${
          isWishlisted
            ? 'bg-[#FCE4EC] text-[#FF4FA3] border border-[#FF4FA3]/30'
            : 'bg-white/90 text-slate-400 hover:text-[#FF4FA3] border border-slate-100 hover:bg-white'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <FiHeart className={isWishlisted ? 'fill-current text-[#FF4FA3]' : ''} size={16} />
      </motion.button>

      {/* Product Image Container */}
      <Link to={`/products/${product.slug}`} className="relative block bg-white aspect-square overflow-hidden p-4">
        <img
          src={getImageUrl(product)}
          alt={product.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';
          }}
          className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Discount Badge Pill */}
        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 bg-[#FF4FA3] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
            {discountPercent}% OFF
          </span>
        )}
      </Link>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white border-t border-slate-100">
        <div className="space-y-1.5">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-bold text-[#757575]">
            <span className="uppercase tracking-wider text-[#9C27B0] font-black truncate">{product.brand || 'ShopIndia'}</span>
            <span className="truncate max-w-[100px]">{product.category?.name}</span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug}`}
            className="block text-xs sm:text-sm font-bold text-[#212121] line-clamp-2 hover:text-[#9C27B0] transition-colors leading-snug"
          >
            {product.title}
          </Link>

          {/* Rating Badge */}
          <div className="flex items-center space-x-1.5 pt-0.5">
            <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
              <span>{product.ratings ? Number(product.ratings).toFixed(1) : '4.5'}</span>
              <FiStar className="fill-current text-amber-500" size={11} />
            </div>
            <span className="text-[11px] font-semibold text-[#757575]">
              ({product.numReviews || product.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100/80">
          <div className="flex items-baseline space-x-2">
            <span className="text-base sm:text-lg font-black text-[#212121]">
              ₹{currentPrice ? currentPrice.toLocaleString('en-IN') : 0}
            </span>
            {originalPrice && originalPrice > currentPrice && (
              <span className="text-xs font-semibold text-[#757575] line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Buttons Row */}
          <div className="mt-3 flex items-center space-x-2">
            {/* Compare Button */}
            <button
              onClick={handleCompare}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isCompared
                  ? 'bg-purple-50 border-[#9C27B0] text-[#9C27B0]'
                  : 'border-slate-200 text-slate-500 hover:text-[#9C27B0] hover:border-[#9C27B0]/50 hover:bg-slate-50'
              }`}
              title="Compare Product"
            >
              <FiLayers size={16} />
            </button>

            {/* Quick View Button */}
            {onQuickView && (
              <button
                onClick={() => onQuickView(product)}
                className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-[#9C27B0] hover:border-[#9C27B0]/50 hover:bg-slate-50 transition cursor-pointer"
                title="Quick View"
              >
                <FiEye size={16} />
              </button>
            )}

            {/* Add to Cart CTA */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock < 1}
              className="flex-1 py-2 px-3 rounded-full text-xs font-bold text-white bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <FiShoppingCart size={13} />
              <span>{product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
