import axios from 'axios';

const getNormalizedBaseUrl = () => {
  const rawUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1').trim();
  if (/^https?:\/[^\/]/i.test(rawUrl)) {
    return rawUrl.replace(/^(https?:\/)/i, '$1/');
  }
  if (!/^https?:\/\//i.test(rawUrl)) {
    return `http://${rawUrl}`;
  }
  return rawUrl;
};

// Create a reusable Axios instance
const axiosInstance = axios.create({
  baseURL: getNormalizedBaseUrl(),
  timeout: 30000, // 30s timeout — prevents hung requests from consuming resources
  withCredentials: true, // Send cookies along with cross-origin requests
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Access Token automatically if present in localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally and manage silent token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip retry logic for login/register/refresh endpoints to avoid infinite loops
    const isAuthRequest = originalRequest.url.includes('/auth/login') || 
                          originalRequest.url.includes('/auth/register') || 
                          originalRequest.url.includes('/auth/refresh-token');

    // If unauthorized (401) and request hasn't been retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        // Attempt silent token refresh via HTTP-only cookies refresh-token endpoint
        const response = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (response.status === 200) {
          const { accessToken } = response.data.data;
          
          // Save new token to local storage
          localStorage.setItem('accessToken', accessToken);
          
          // Update headers and retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login or clear auth state
        localStorage.removeItem('accessToken');
        // We can dispatch user logout event or trigger window refresh if required
        console.warn('Session expired. User needs to re-authenticate.');
      }
    }

    // Standardize error message extraction for Redux Toolkit selectors
    const message = error.response?.data?.message || 'A network error occurred. Please try again.';
    const errors = error.response?.data?.errors || [];
    
    // Attach details to error object
    error.message = message;
    error.errors = errors;

    return Promise.reject(error);
  }
);

// Helper function to extract error message safely inside thunks
export const extractErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'An error occurred';
};

export default axiosInstance;
