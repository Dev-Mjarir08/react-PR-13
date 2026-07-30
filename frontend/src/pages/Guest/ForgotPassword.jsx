import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../../features/auth/authSlice.js';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    dispatch(forgotPassword({ email }))
      .unwrap()
      .then((msg) => {
        toast.success(msg || 'Reset password link sent to email!');
        setEmail('');
      })
      .catch((err) => {
        toast.error(err || 'Failed to dispatch reset email.');
      });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 border border-slate-200/80 rounded-3xl shadow-xs">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1 font-black text-xl tracking-tight text-[#9C27B0] mb-2">
            <span>ShopIndia</span>
          </div>
          <h2 className="text-2xl font-black text-[#212121]">Recover Password</h2>
          <p className="text-xs text-[#757575] font-medium">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-[#212121] mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full text-xs font-bold text-white bg-[#9C27B0] hover:bg-[#7B1FA2] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs cursor-pointer"
            >
              {loading ? 'Sending Link...' : 'Send Recovery Link'}
            </button>
          </div>

        </form>

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs font-bold text-[#9C27B0] hover:underline">
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
