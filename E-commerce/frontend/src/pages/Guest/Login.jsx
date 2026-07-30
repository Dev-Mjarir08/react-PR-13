import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, clearErrors } from '../../features/auth/authSlice.js';
import { toast } from 'react-toastify';

const Login = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || (user?.role === 'Admin' ? '/admin/dashboard' : '/');
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  // Display errors if any
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap()
      .then(() => {
        toast.success('Logged in successfully!');
      });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-slate-200/80 rounded-3xl shadow-xs">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1 font-black text-xl tracking-tight text-[#9C27B0] mb-2">
            <span>ShopIndia</span>
          </div>
          <h2 className="text-2xl font-black text-[#212121]">Welcome Back!</h2>
          <p className="text-xs text-[#757575] font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#9C27B0] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#212121] mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address format',
                  },
                })}
                placeholder="name@domain.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-red-600 font-bold ml-3">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-bold text-[#212121]">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[11px] font-bold text-[#FF4FA3] hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
              />
              {errors.password && (
                <p className="mt-1.5 text-[11px] text-red-600 font-bold ml-3">{errors.password.message}</p>
              )}
            </div>

          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="w-full py-3.5 px-4 rounded-full text-xs font-bold text-white bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              {loading || isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Login;
