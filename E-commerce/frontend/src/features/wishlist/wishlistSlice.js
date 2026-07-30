import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/wishlist');
      return response.data.data; // contains user, products: []
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItemToWishlist = createAsyncThunk(
  'wishlist/addItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/wishlist', { productId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeItemFromWishlist = createAsyncThunk(
  'wishlist/removeItem',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/wishlist/${productId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  wishlist: null,
  loading: false,
  error: null,
  success: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistStates: (state) => {
      state.success = false;
      state.error = null;
    },
    resetWishlistOnLogout: (state) => {
      state.wishlist = null;
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addItemToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(addItemToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.success = true;
      })
      .addCase(addItemToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove
      .addCase(removeItemFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(removeItemFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlist = action.payload;
        state.success = true;
      })
      .addCase(removeItemFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlistStates, resetWishlistOnLogout } = wishlistSlice.actions;
export default wishlistSlice.reducer;
