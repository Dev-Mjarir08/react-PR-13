import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.js';

// Thunks
export const sendOrderOtp = createAsyncThunk(
  'order/sendOtp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/orders/send-otp');
      return response.data.message;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  'order/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/orders', orderData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/orders/my-orders');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOrderDetails = createAsyncThunk(
  'order/fetchDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  orders: [],
  orderDetails: null,
  loading: false,
  error: null,
  success: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderStates: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.orderDetails = null;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderStates } = orderSlice.actions;
export default orderSlice.reducer;
