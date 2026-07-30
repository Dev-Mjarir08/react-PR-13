import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchWishlist, removeItemFromWishlist } from '../../features/wishlist/wishlistSlice.js';
import { addItemToCart } from '../../features/cart/cartSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { FiTrash2, FiShoppingCart, FiHeart, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { getImageUrl } from '../../utils/imageUtils.js';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { wishlist, loading } = useSelector((state) => state.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const handleRemove = (productId) => {
    dispatch(removeItemFromWishlist(productId))
      .unwrap()
      .then(() => toast.success('Removed from wishlist.'));
  };

  const handleAddToCart = (product) => {
    if (product.stock < 1) {
      toast.error('This product is currently out of stock.');
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => {
        toast.success(`${product.title} added to cart!`);
        dispatch(removeItemFromWishlist(product._id));
      })
      .catch((err) => toast.error(err));
  };

  if (loading && !wishlist) {
    return <Loader />;
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#212121] tracking-tight flex items-center space-x-2">
            <FiHeart className="text-[#FF4FA3] fill-current" />
            <span>My Wishlist ({wishlist?.products?.length || 0})</span>
          </h1>
          <p className="text-xs text-[#757575] font-medium mt-0.5">Bookmarked items saved for quick checkout</p>
        </div>
      </div>

      {!wishlist?.products || wishlist.products.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl max-w-md mx-auto space-y-4 shadow-xs p-8">
          <div className="w-16 h-16 bg-pink-50 text-[#FF4FA3] rounded-full flex items-center justify-center mx-auto border border-pink-100">
            <FiHeart size={28} />
          </div>
          <h2 className="text-base font-black text-[#212121]">Your Wishlist is Empty</h2>
          <p className="text-xs text-[#757575] font-medium max-w-xs mx-auto">Explore products and click the heart icon to save items here.</p>
          <div className="pt-2">
            <Link to="/products" className="inline-flex items-center py-2.5 px-6 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold text-xs rounded-full shadow-xs transition">
              Explore Products <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.products.map((product) => (
            <div
              key={product._id}
              className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              {/* Product Image */}
              <Link to={`/products/${product.slug}`} className="block relative aspect-square bg-[#FAFAFA] p-4 border-b border-slate-100 overflow-hidden group">
                <img src={getImageUrl(product.images && product.images.length > 0 ? product.images : product.image)} alt={product.title} className="w-full h-full object-contain group-hover:scale-108 transition duration-500" />
              </Link>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#9C27B0] uppercase tracking-widest">{product.brand || 'ShopIndia'}</span>
                  <Link to={`/products/${product.slug}`} className="block text-xs font-bold text-[#212121] line-clamp-2 hover:text-[#9C27B0] transition">
                    {product.title}
                  </Link>
                  <div className="pt-1">
                    <span className="text-base font-black text-[#212121]">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-200 transition cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 py-2 px-3 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-xs"
                  >
                    <FiShoppingCart size={14} />
                    <span>Move to Cart</span>
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Wishlist;
