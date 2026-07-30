import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { updateProfile, verifyOtp, resendOtp, clearErrors } from '../../features/auth/authSlice.js';
import Modal from '../common/Modal.jsx';
import { toast } from 'react-toastify';
import { FiUser, FiCheckCircle, FiAlertCircle, FiSend, FiGrid } from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils.js';

const PersonalDetails = () => {
  const dispatch = useDispatch();
  const { user, error } = useSelector((state) => state.auth);

  const { register, handleSubmit, setValue } = useForm();
  const [avatarPreview, setAvatarPreview] = useState('/placeholder.png');
  const [avatarFile, setAvatarFile] = useState(null);

  // OTP Modal State
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone || '');
      if (user.avatar) {
        setAvatarPreview(getImageUrl(user.avatar));
      }
    }
  }, [user, setValue]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        toast.success('Personal details saved successfully!');
      });
  };

  const handleVerifyOtpSubmit = (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }

    setOtpSubmitting(true);
    dispatch(verifyOtp({ otp: otpCode.trim(), email: user?.email }))
      .unwrap()
      .then(() => {
        toast.success('Email verified successfully!');
        setOtpModalOpen(false);
        setOtpCode('');
      })
      .catch((err) => {
        toast.error(err || 'Invalid OTP code.');
      })
      .finally(() => setOtpSubmitting(false));
  };

  const handleResendOtp = () => {
    dispatch(resendOtp({ email: user?.email }))
      .unwrap()
      .then((msg) => {
        toast.success(msg || 'New OTP sent to your registered email.');
      })
      .catch((err) => {
        toast.error(err || 'Failed to resend OTP.');
      });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 font-sans">
      
      {/* Admin Dashboard Control Banner */}
      {user?.role === 'Admin' && (
        <div className="bg-[#212121] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-[#9C27B0]/20 border border-[#9C27B0]/40 text-[#FF4FA3] text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
              <FiGrid size={12} className="mr-1" />
              <span>ADMINISTRATOR CONTROL PANEL</span>
            </div>
            <h3 className="text-sm font-black text-white">Admin Privileges Active</h3>
            <p className="text-xs text-slate-300">Manage orders, products, categories, and site settings.</p>
          </div>
          <a
            href="/admin/dashboard"
            className="px-5 py-2.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-xs transition whitespace-nowrap cursor-pointer"
          >
            Go to Admin Dashboard →
          </a>
        </div>
      )}

      {/* Header & Verification Status */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center">
          <FiUser className="mr-2 text-[#9C27B0]" size={16} /> Personal Details
        </h2>
        {user?.isVerified ? (
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <FiCheckCircle className="mr-1 text-emerald-600" size={13} /> Verified Account
          </span>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              <FiAlertCircle className="mr-1 text-amber-600" size={13} /> Unverified Email
            </span>
            <button
              type="button"
              onClick={() => setOtpModalOpen(true)}
              className="text-xs font-bold text-[#9C27B0] hover:underline cursor-pointer"
            >
              Verify OTP
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Avatar Selection */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#FAFAFA] border-2 border-[#9C27B0]/20 shadow-xs shrink-0 flex items-center justify-center">
            <img src={avatarPreview} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
          </div>
          <div className="text-center sm:text-left space-y-1.5">
            <label className="inline-block px-4 py-2 border border-slate-200 text-xs font-bold text-[#212121] bg-slate-50 hover:bg-purple-50 hover:border-[#9C27B0] rounded-full cursor-pointer transition">
              Upload Profile Image
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <p className="text-[10px] text-[#757575] font-medium">JPEG, PNG up to 2MB supported.</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-[#212121]">Email Address</label>
              {user?.isVerified ? (
                <span className="text-[10px] font-bold text-emerald-600">✓ Verified</span>
              ) : (
                <span className="text-[10px] font-bold text-amber-600">⚠️ Unverified</span>
              )}
            </div>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 border border-slate-100 bg-slate-100/70 text-slate-400 rounded-full cursor-not-allowed text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#212121] mb-1">Phone Number</label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone is required' })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-3 px-8 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
        >
          Save Details
        </button>

      </form>

      {/* OTP Verification Modal */}
      <Modal isOpen={otpModalOpen} onClose={() => setOtpModalOpen(false)}>
        <div className="p-4 space-y-6 font-sans">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-purple-50 text-[#9C27B0] border border-purple-100 rounded-full flex items-center justify-center mx-auto">
              <FiSend size={24} />
            </div>
            <h2 className="text-lg font-black text-[#212121]">Email Verification OTP</h2>
            <p className="text-xs text-[#757575] max-w-sm mx-auto">
              Enter the 6-digit code sent to <span className="font-bold text-[#212121]">{user?.email}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-2xl font-black tracking-widest px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9C27B0] bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={otpSubmitting}
              className="w-full py-3.5 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white font-bold text-xs rounded-full transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {otpSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-[#757575]">Didn't receive code?</span>
            <button
              type="button"
              onClick={handleResendOtp}
              className="font-bold text-[#9C27B0] hover:underline cursor-pointer"
            >
              Resend Code
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default PersonalDetails;
