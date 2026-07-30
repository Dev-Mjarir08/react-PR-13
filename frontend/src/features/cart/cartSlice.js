import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Thunks
export const fetchCart = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/cart');
      return response.data.data; // contains user, items: [{ product: {}, quantity }]
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/cart', { productId, quantity });
      return response.data.data; // returns updated cart
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/cart', { productId, quantity });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/cart/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/cart');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  cart: null, // contains { user, items: [] }
  loading: false, // Initial fetch loading
  operationLoading: false, // Mutation loading (addItem, updateQuantity, etc)
  error: null,
  success: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartStates: (state) => {
      state.success = false;
      state.error = null;
    },
    resetCartOnLogout: (state) => {
      state.cart = null;
      state.loading = false;
      state.operationLoading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Item
      .addCase(addItemToCart.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.cart = action.payload;
        state.success = true;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      // Update Quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.cart = action.payload;
        state.success = true;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      // Remove Item
      .addCase(removeItemFromCart.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.cart = action.payload;
        state.success = true;
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.cart = action.payload;
        state.success = true;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCartStates, resetCartOnLogout } = cartSlice.actions;
export default cartSlice.reducer;
