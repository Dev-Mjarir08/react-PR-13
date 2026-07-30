import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Public Thunk
export const fetchBrands = createAsyncThunk(
  'brand/fetchBrands',
  async (categoryId, { rejectWithValue }) => {
    try {
      const url = categoryId ? `/brands?category=${categoryId}` : '/brands';
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin Thunks
export const adminCreateBrand = createAsyncThunk(
  'brand/adminCreateBrand',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminUpdateBrand = createAsyncThunk(
  'brand/adminUpdateBrand',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/brands/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminDeleteBrand = createAsyncThunk(
  'brand/adminDeleteBrand',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/brands/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  brands: [],
  loading: false,
  error: null,
  success: false,
};

const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    clearBrandStates: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Brands
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Brand
      .addCase(adminCreateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminCreateBrand.fulfilled, (state, action) => {
        state.loading = false;
        state.brands.unshift(action.payload);
        state.success = true;
      })
      .addCase(adminCreateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Brand
      .addCase(adminUpdateBrand.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminUpdateBrand.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.brands.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) {
          state.brands[idx] = action.payload;
        }
        state.success = true;
      })
      .addCase(adminUpdateBrand.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Brand
      .addCase(adminDeleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
        state.success = true;
      });
  },
});

export const { clearBrandStates } = brandSlice.actions;
export default brandSlice.reducer;
