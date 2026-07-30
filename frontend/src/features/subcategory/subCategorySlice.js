import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Public Thunks
export const fetchSubCategories = createAsyncThunk(
  'subCategory/fetchSubCategories',
  async (categoryId, { rejectWithValue }) => {
    try {
      const url = categoryId ? `/subcategories?category=${categoryId}` : '/subcategories';
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin Thunks
export const adminCreateSubCategory = createAsyncThunk(
  'subCategory/adminCreateSubCategory',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/subcategories', data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminUpdateSubCategory = createAsyncThunk(
  'subCategory/adminUpdateSubCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/subcategories/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminDeleteSubCategory = createAsyncThunk(
  'subCategory/adminDeleteSubCategory',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/subcategories/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  subCategories: [],
  loading: false,
  error: null,
  success: false,
};

const subCategorySlice = createSlice({
  name: 'subCategory',
  initialState,
  reducers: {
    clearSubCategoryStates: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch SubCategories
      .addCase(fetchSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories = action.payload;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create SubCategory
      .addCase(adminCreateSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminCreateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.subCategories.unshift(action.payload);
        state.success = true;
      })
      .addCase(adminCreateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update SubCategory
      .addCase(adminUpdateSubCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminUpdateSubCategory.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.subCategories.findIndex((sc) => sc._id === action.payload._id);
        if (idx !== -1) {
          state.subCategories[idx] = action.payload;
        }
        state.success = true;
      })
      .addCase(adminUpdateSubCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete SubCategory
      .addCase(adminDeleteSubCategory.fulfilled, (state, action) => {
        state.subCategories = state.subCategories.filter((sc) => sc._id !== action.payload);
        state.success = true;
      });
  },
});

export const { clearSubCategoryStates } = subCategorySlice.actions;
export default subCategorySlice.reducer;
