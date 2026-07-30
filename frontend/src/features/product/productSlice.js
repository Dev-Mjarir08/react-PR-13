import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Thunks
export const fetchProducts = createAsyncThunk(
  'product/fetchList',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/products', { params });
      return response.data.data; // contains products, total, pages, currentPage
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'product/fetchDetails',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/products/${slug}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProductReview = createAsyncThunk(
  'product/createReview',
  async ({ slug, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/products/${slug}/reviews`, { rating, comment });
      return response.data.data; // updated product
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  products: [],
  product: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    total: 0,
    pages: 1,
    currentPage: 1,
  },
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearProductStates: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.currentPage,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Product Details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.product = null;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Review
      .addCase(createProductReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createProductReview.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload; // update product details in state with new review
        state.success = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductStates } = productSlice.actions;
export default productSlice.reducer;
