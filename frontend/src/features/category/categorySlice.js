import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/categories');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCategoryDetails = createAsyncThunk(
  'category/fetchDetails',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/categories/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  categories: [],
  category: null,
  loading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Category Details
      .addCase(fetchCategoryDetails.pending, (state) => {
        state.loading = true;
        state.category = null;
        state.error = null;
      })
      .addCase(fetchCategoryDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategoryDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
