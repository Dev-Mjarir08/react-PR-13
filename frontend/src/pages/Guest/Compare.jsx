import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeFromCompare, clearCompare } from '../../features/compare/compareSlice.js';
import { addItemToCart } from '../../features/cart/cartSlice.js';
import { getImageUrl } from '../../utils/imageUtils.js';
import { FiX, FiShoppingCart, FiCheck, FiTrash2, FiLayers } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Compare = () => {
  const dispatch = useDispatch();
  const { compareItems } = useSelector((state) => state.compare);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.warning('Please sign in to add items to cart.');
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }))
      .unwrap()
      .then(() => toast.success(`${product.title} added to cart!`))
      .catch((err) => toast.error(err));
  };

  if (compareItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center bg-white border border-gray-200 rounded-lg space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <FiLayers size={32} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Your Comparison Tray is Empty</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Select up to 4 electronics items across our catalog to compare specifications, prices, and features side-by-side.
        </p>
        <Link
          to="/products"
          className="inline-block mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-md shadow-sm transition"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Compare Products</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">Comparing {compareItems.length} of 4 maximum items</p>
        </div>
        <button
          onClick={() => dispatch(clearCompare())}
          className="flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded transition"
        >
          <FiTrash2 size={14} />
          <span>Clear Comparison</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-44">Product Details</th>
              {compareItems.map((item) => (
                <th key={item._id} className="p-4 w-64 align-top relative border-l border-gray-200">
                  <button
                    onClick={() => dispatch(removeFromCompare(item._id))}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 bg-white p-1 rounded-full border border-gray-200 shadow-xs"
                    title="Remove from compare"
                  >
                    <FiX size={16} />
                  </button>
                  <div className="space-y-3 text-center">
                    <div className="h-36 flex items-center justify-center p-2 bg-white rounded border border-gray-100">
                      <img
                        src={getImageUrl(item.images)}
                        alt={item.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">{item.brand}</span>
                      <Link to={`/products/${item.slug}`} className="text-xs font-bold text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight">
                        {item.title}
                      </Link>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock < 1}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-xs font-bold rounded flex items-center justify-center space-x-1.5 transition"
                    >
                      <FiShoppingCart size={14} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs font-medium">
            {/* Price Comparison */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Price</td>
              {compareItems.map((item) => {
                const effectivePrice = item.discountPrice > 0 ? item.discountPrice : item.price;
                return (
                  <td key={item._id} className="p-4 border-l border-gray-200">
                    <span className="text-base font-extrabold text-gray-900">₹{effectivePrice.toLocaleString('en-IN')}</span>
                    {item.discountPrice > 0 && (
                      <span className="text-xs text-gray-400 line-through block">₹{item.price.toLocaleString('en-IN')}</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Brand */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Brand</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200 text-gray-800 font-semibold">{item.brand || 'N/A'}</td>
              ))}
            </tr>

            {/* Customer Rating */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Customer Rating</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200">
                  <div className="flex items-center space-x-1 text-amber-500 font-bold">
                    <span>{item.ratings ? item.ratings.toFixed(1) : '0.0'}★</span>
                    <span className="text-gray-400 font-normal">({item.numReviews || 0})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Availability Stock */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Stock Availability</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200">
                  {item.stock > 0 ? (
                    <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded text-[11px]">In Stock ({item.stock})</span>
                  ) : (
                    <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[11px]">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Category */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Category</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200 text-gray-700">{item.category?.name || 'Electronics'}</td>
              ))}
            </tr>

            {/* RAM */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">RAM Size</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200 text-gray-700 font-semibold">{item.ram || 'Standard'}</td>
              ))}
            </tr>

            {/* Storage */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Storage Capacity</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200 text-gray-700 font-semibold">{item.storage || 'Standard'}</td>
              ))}
            </tr>

            {/* Color */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Color Option</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200 text-gray-700 capitalize">{item.color || 'Default'}</td>
              ))}
            </tr>

            {/* Warranty */}
            <tr>
              <td className="p-4 font-bold text-gray-900 bg-gray-50/50">Warranty Period</td>
              {compareItems.map((item) => (
                <td key={item._id} className="p-4 border-l border-gray-200 text-gray-700 font-semibold">1 Year Brand Warranty</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Compare;
