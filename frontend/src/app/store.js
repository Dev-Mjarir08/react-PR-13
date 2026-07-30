import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import productReducer from '../features/product/productSlice.js';
import categoryReducer from '../features/category/categorySlice.js';
import cartReducer from '../features/cart/cartSlice.js';
import wishlistReducer from '../features/wishlist/wishlistSlice.js';
import orderReducer from '../features/order/orderSlice.js';
import adminReducer from '../features/admin/adminSlice.js';
import compareReducer from '../features/compare/compareSlice.js';
import addressReducer from '../features/address/addressSlice.js';
import subCategoryReducer from '../features/subcategory/subCategorySlice.js';
import brandReducer from '../features/brand/brandSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    brand: brandReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    order: orderReducer,
    admin: adminReducer,
    compare: compareReducer,
    address: addressReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check to prevent errors with File/FormData objects
    }),
});
export default store;
