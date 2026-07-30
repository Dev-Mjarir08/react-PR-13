import React from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { changePassword } from '../../features/auth/authSlice.js';
import { toast } from 'react-toastify';
import { FiLock } from 'react-icons/fi';

const SecuritySettings = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    dispatch(changePassword({
      oldPassword: data.currentPassword,
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }))
      .unwrap()
      .then((msg) => {
        toast.success(msg || 'Password updated successfully!');
        reset();
      })
      .catch((err) => {
        toast.error(err || 'Failed to update password.');
      });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 font-sans">
      <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
        <FiLock className="mr-2 text-[#9C27B0]" size={16} /> Security & Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#212121] mb-1">Current Password</label>
          <input
            type="password"
            {...register('currentPassword', { required: 'Current password is required' })}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#212121] mb-1">New Password</label>
          <input
            type="password"
            {...register('newPassword', {
              required: 'New password is required',
              minLength: {
                value: 6,
                message: 'Must be at least 6 characters',
              },
            })}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#9C27B0] text-xs font-medium bg-slate-50"
          />
          {errors.newPassword && (
            <p className="mt-1.5 text-[11px] text-red-600 font-bold ml-3">{errors.newPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#212121] hover:bg-[#9C27B0] text-white text-xs font-bold rounded-full shadow-xs transition cursor-pointer"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;
