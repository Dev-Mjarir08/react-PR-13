import React from 'react';
import { toast } from 'react-toastify';
import { FiTag, FiCopy } from 'react-icons/fi';

const AVAILABLE_VOUCHERS = [
  { code: 'WELCOME200', title: 'Flat ₹200 OFF', desc: 'On your first order above ₹1,999' },
  { code: 'CROMA10', title: '10% Instant Discount', desc: 'Max discount ₹1,000 on Laptops' },
  { code: 'FESTIVE500', title: 'Flat ₹500 Cashback', desc: 'On Smart TVs above ₹15,000' },
];

const VoucherTray = () => {
  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 font-sans">
      <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
        <FiTag className="mr-2 text-[#9C27B0]" size={16} /> Exclusive Vouchers
      </h2>
      <div className="space-y-3">
        {AVAILABLE_VOUCHERS.map((v) => (
          <div key={v.code} className="p-3 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black text-[#9C27B0] uppercase bg-purple-100 px-2.5 py-0.5 rounded-full">{v.code}</span>
              <p className="text-xs font-bold text-[#212121] pt-1">{v.title}</p>
              <p className="text-[10px] text-[#757575] font-medium">{v.desc}</p>
            </div>
            <button
              onClick={() => copyCouponCode(v.code)}
              className="p-2 text-[#9C27B0] hover:bg-purple-100 rounded-full transition cursor-pointer"
              title="Copy Coupon Code"
            >
              <FiCopy size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoucherTray;
