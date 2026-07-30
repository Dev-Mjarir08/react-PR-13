import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Dashboard Thunk
export const fetchDashboardStats = createAsyncThunk(
  'admin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Users Management Thunks
export const fetchUsersList = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/admin/users');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserBlock = createAsyncThunk(
  'admin/toggleUserBlock',
  async ({ id, isBlocked }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/users/admin/users/${id}/block`, { isBlocked });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/users/admin/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Category Management Thunks
export const adminCreateCategory = createAsyncThunk(
  'admin/createCategory',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminUpdateCategory = createAsyncThunk(
  'admin/updateCategory',
  async ({ slug, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/categories/${slug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminDeleteCategory = createAsyncThunk(
  'admin/deleteCategory',
  async (slug, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/categories/${slug}`);
      return slug;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Product Management Thunks
export const adminCreateProduct = createAsyncThunk(
  'admin/createProduct',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminBulkCreateProducts = createAsyncThunk(
  'admin/bulkCreateProducts',
  async (productsArray, { rejectWithValue }) => {
    try {
      const CHUNK_SIZE = 50;
      let result = [];
      for (let i = 0; i < productsArray.length; i += CHUNK_SIZE) {
        const chunk = productsArray.slice(i, i + CHUNK_SIZE);
        const response = await axiosInstance.post('/products/bulk', { products: chunk });
        if (response.data?.data) {
          result = result.concat(response.data.data);
        }
      }
      return result;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create bulk products.';
      return rejectWithValue(msg);
    }
  }
);

export const adminBulkCreateCategories = createAsyncThunk(
  'admin/bulkCreateCategories',
  async (categoriesArray, { rejectWithValue }) => {
    try {
      const CHUNK_SIZE = 50;
      let result = [];
      for (let i = 0; i < categoriesArray.length; i += CHUNK_SIZE) {
        const chunk = categoriesArray.slice(i, i + CHUNK_SIZE);
        const response = await axiosInstance.post('/categories/bulk', { categories: chunk });
        if (response.data?.data) {
          result = result.concat(response.data.data);
        }
      }
      return result;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create bulk categories.';
      return rejectWithValue(msg);
    }
  }
);

export const adminBulkCreateSubCategories = createAsyncThunk(
  'admin/bulkCreateSubCategories',
  async (subCategoriesArray, { rejectWithValue }) => {
    try {
      const CHUNK_SIZE = 50;
      let result = [];
      for (let i = 0; i < subCategoriesArray.length; i += CHUNK_SIZE) {
        const chunk = subCategoriesArray.slice(i, i + CHUNK_SIZE);
        const response = await axiosInstance.post('/subcategories/bulk', { subCategories: chunk });
        if (response.data?.data) {
          result = result.concat(response.data.data);
        }
      }
      return result;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create bulk subcategories.';
      return rejectWithValue(msg);
    }
  }
);

export const adminBulkCreateBrands = createAsyncThunk(
  'admin/bulkCreateBrands',
  async (brandsArray, { rejectWithValue }) => {
    try {
      const CHUNK_SIZE = 50;
      let result = [];
      for (let i = 0; i < brandsArray.length; i += CHUNK_SIZE) {
        const chunk = brandsArray.slice(i, i + CHUNK_SIZE);
        const response = await axiosInstance.post('/brands/bulk', { brands: chunk });
        if (response.data?.data) {
          result = result.concat(response.data.data);
        }
      }
      return result;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create bulk brands.';
      return rejectWithValue(msg);
    }
  }
);

export const adminBulkCreateBanners = createAsyncThunk(
  'admin/bulkCreateBanners',
  async (bannersArray, { rejectWithValue }) => {
    try {
      const CHUNK_SIZE = 50;
      let result = [];
      for (let i = 0; i < bannersArray.length; i += CHUNK_SIZE) {
        const chunk = bannersArray.slice(i, i + CHUNK_SIZE);
        const response = await axiosInstance.post('/banners/bulk', { banners: chunk });
        if (response.data?.data) {
          result = result.concat(response.data.data);
        }
      }
      return result;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to create bulk banners.';
      return rejectWithValue(msg);
    }
  }
);

// Delete All Thunks
export const adminDeleteAllProducts = createAsyncThunk(
  'admin/deleteAllProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/products/all/clear');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminDeleteAllCategories = createAsyncThunk(
  'admin/deleteAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/categories/all/clear');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminDeleteAllSubCategories = createAsyncThunk(
  'admin/deleteAllSubCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/subcategories/all/clear');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminDeleteAllBrands = createAsyncThunk(
  'admin/deleteAllBrands',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/brands/all/clear');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminDeleteAllBanners = createAsyncThunk(
  'admin/deleteAllBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/banners/all/clear');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminDeleteAllCoupons = createAsyncThunk(
  'admin/deleteAllCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete('/coupons/all/clear');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const adminUpdateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ slug, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/products/${slug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const adminDeleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (slug, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${slug}`);
      return slug;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Orders Management Thunks
export const fetchAllOrders = createAsyncThunk(
  'admin/fetchAllOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/orders/admin/all');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'admin/updateOrderStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Coupons Management Thunks
export const fetchCoupons = createAsyncThunk(
  'admin/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/coupons');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCoupon = createAsyncThunk(
  'admin/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/coupons', couponData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteCoupon = createAsyncThunk(
  'admin/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Banners Management Thunks
export const fetchBanners = createAsyncThunk(
  'admin/fetchBanners',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/banners/admin/all');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createBanner = createAsyncThunk(
  'admin/createBanner',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateBanner = createAsyncThunk(
  'admin/updateBanner',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/banners/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteBanner = createAsyncThunk(
  'admin/deleteBanner',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/banners/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  dashboardStats: null,
  users: [],
  orders: [],
  coupons: [],
  banners: [],
  loading: false,
  error: null,
  success: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminStates: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Users
      .addCase(fetchUsersList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersList.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle block user
      .addCase(toggleUserBlock.fulfilled, (state, action) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index > -1) {
          state.users[index] = action.payload;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      // Fetch Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o._id === action.payload._id);
        if (index > -1) {
          state.orders[index] = action.payload;
        }
      })
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.unshift(action.payload);
        state.success = true;
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Coupon
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
      })
      // Fetch Banners
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Banner
      .addCase(createBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.loading = false;
        state.banners.unshift(action.payload);
        state.success = true;
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Banner
      .addCase(updateBanner.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.banners.findIndex((b) => b._id === action.payload._id);
        if (idx !== -1) {
          state.banners[idx] = action.payload;
        }
        state.success = true;
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Banner
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter((b) => b._id !== action.payload);
      })
      // Create Category
      .addCase(adminCreateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminCreateCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminCreateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Category
      .addCase(adminDeleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Category
      .addCase(adminUpdateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminUpdateCategory.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminUpdateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Product
      .addCase(adminCreateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminCreateProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminCreateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Create Products
      .addCase(adminBulkCreateProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminBulkCreateProducts.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminBulkCreateProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Create Categories
      .addCase(adminBulkCreateCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminBulkCreateCategories.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminBulkCreateCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Create SubCategories
      .addCase(adminBulkCreateSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminBulkCreateSubCategories.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminBulkCreateSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Create Brands
      .addCase(adminBulkCreateBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminBulkCreateBrands.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminBulkCreateBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Bulk Create Banners
      .addCase(adminBulkCreateBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminBulkCreateBanners.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminBulkCreateBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All Products
      .addCase(adminDeleteAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteAllProducts.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All Categories
      .addCase(adminDeleteAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteAllCategories.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All SubCategories
      .addCase(adminDeleteAllSubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteAllSubCategories.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteAllSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All Brands
      .addCase(adminDeleteAllBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteAllBrands.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteAllBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All Banners
      .addCase(adminDeleteAllBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteAllBanners.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteAllBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete All Coupons
      .addCase(adminDeleteAllCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteAllCoupons.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteAllCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(adminUpdateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminUpdateProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminUpdateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(adminDeleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(adminDeleteProduct.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(adminDeleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminStates } = adminSlice.actions;
export default adminSlice.reducer;
