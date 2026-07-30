import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import store from './app/store.js';
import AppRoutes from './routes/AppRoutes.jsx';
import { fetchCurrentUser } from './features/auth/authSlice.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ScrollToTop from './components/common/ScrollToTop.jsx';

const AppContent = () => {
  const dispatch = useDispatch();

  // Attempt to restore user session if JWT token is stored locally
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      
      {/* Global Notifications Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="toast-container-custom"
      />
    </>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
