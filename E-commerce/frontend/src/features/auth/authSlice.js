import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance, { extractErrorMessage } from '../../api/axios.js';

// Thunks
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      // Save token returned
      const { accessToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      return user;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const { accessToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      return user;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('accessToken');
      return null;
    } catch (error) {
      localStorage.removeItem('accessToken'); // force logout on client
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
  {
    // Skip fetch if user is already loaded (prevents duplicate API calls on re-renders)
    condition: (_, { getState }) => {
      const { auth } = getState();
      if (auth.user && auth.isAuthenticated) {
        return false; // Cancel the thunk — data already in state
      }
    },
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords, { rejectWithValue }) => {
    try {
      const payload = {
        oldPassword: passwords.oldPassword || passwords.currentPassword,
        currentPassword: passwords.currentPassword || passwords.oldPassword,
        newPassword: passwords.newPassword,
      };
      const response = await axiosInstance.put('/auth/change-password', payload);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ otp, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { otp, email });
      return response.data.data; // updated user
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async ({ email } = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/resend-otp', { email });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', emailData);
      return response.data.message;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  profileLoading: false,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      // Fetch Me
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.user = action.payload;
        state.success = true;
      });
  },
});

export const { clearErrors } = authSlice.actions;
export default authSlice.reducer;
