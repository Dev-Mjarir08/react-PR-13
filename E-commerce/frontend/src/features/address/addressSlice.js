import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { extractErrorMessage } from '../../api/axios.js';

export const fetchAddresses = createAsyncThunk(
  'address/fetchList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/addresses');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/add',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/users/addresses', addressData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/update',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/addresses/${addressId}`, addressData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/users/addresses/${addressId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'address/setDefault',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/users/addresses/${addressId}/default`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const initialState = {
  addresses: [],
  loading: false,
  error: null,
  success: false,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    clearAddressStates: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.success = true;
      })
      // Update
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
        state.success = true;
      })
      // Delete
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      // Set Default
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.addresses = action.payload;
      });
  },
});

export const { clearAddressStates } = addressSlice.actions;
export default addressSlice.reducer;
