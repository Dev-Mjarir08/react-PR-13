import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearErrors } from '../../features/auth/authSlice.js';
import { toast } from 'react-toastify';

const Register = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const onSubmit = (data) => {
    dispatch(registerUser(data))
      .unwrap()
      .then(() => {
        toast.success('Registration successful! A verification OTP has been sent to your email.');
        navigate('/profile');
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
          <h2 className="text-2xl font-black text-[#212121]">Create an Account</h2>
          <p className="text-xs text-[#757575] font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-[#9C27B0] font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          
          <div className="space-y-4">
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#212121] mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Full name is required' })}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
              />
              {errors.name && (
                <p className="mt-1.5 text-[11px] text-red-600 font-bold ml-3">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
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
                    message: 'Invalid email format',
                  },
                })}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
              />
              {errors.email && (
                <p className="mt-1.5 text-[11px] text-red-600 font-bold ml-3">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-[#212121] mb-1">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+-\s()]{8,15}$/,
                    message: 'Please provide a valid phone number (8-15 digits)',
                  },
                })}
                placeholder="+919876543210"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
              />
              {errors.phone && (
                <p className="mt-1.5 text-[11px] text-red-600 font-bold ml-3">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#212121] mb-1">
                Password
              </label>
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
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-full text-xs font-bold text-white bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Register;
