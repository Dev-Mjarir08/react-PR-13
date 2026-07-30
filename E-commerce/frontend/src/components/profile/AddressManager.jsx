import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../features/address/addressSlice.js';
import { toast } from 'react-toastify';
import { FiMapPin, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';

const AddressManager = () => {
  const dispatch = useDispatch();
  const { addresses } = useSelector((state) => state.address);
  const { user } = useSelector((state) => state.auth);

  // Address Modal State (Add & Edit)
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    address: '',
    city: '',
    postalCode: '',
    country: 'India',
    phone: user?.phone || '',
    isDefault: false,
  });

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setNewAddr({
      label: 'Home',
      address: '',
      city: '',
      postalCode: '',
      country: 'India',
      phone: user?.phone || '',
      isDefault: addresses.length === 0,
    });
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setNewAddr({
      label: addr.label || 'Home',
      address: addr.address || '',
      city: addr.city || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      phone: addr.phone || user?.phone || '',
      isDefault: addr.isDefault || false,
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddressSubmit = (e) => {
    e.preventDefault();
    if (!newAddr.address || !newAddr.city || !newAddr.postalCode) {
      toast.error('Please fill in all required address fields.');
      return;
    }

    if (editingAddressId) {
      dispatch(updateAddress({ addressId: editingAddressId, addressData: newAddr }))
        .unwrap()
        .then(() => {
          toast.success('Delivery address updated!');
          setAddressModalOpen(false);
        })
        .catch((err) => toast.error(err));
    } else {
      dispatch(addAddress(newAddr))
        .unwrap()
        .then(() => {
          toast.success('New delivery address added!');
          setAddressModalOpen(false);
        })
        .catch((err) => toast.error(err));
    }
  };

  const handleDeleteAddress = (e, addressId) => {
    e.stopPropagation();
    dispatch(deleteAddress(addressId))
      .unwrap()
      .then(() => toast.success('Address removed.'));
  };

  const handleSetDefaultAddress = (addressId) => {
    dispatch(setDefaultAddress(addressId))
      .unwrap()
      .then(() => toast.success('Selected primary delivery address.'));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xs font-black text-[#212121] uppercase tracking-wider flex items-center">
          <FiMapPin className="mr-2 text-[#9C27B0]" size={16} /> Delivery Addresses ({addresses?.length || 0})
        </h2>
        <button
          type="button"
          onClick={handleOpenAddAddress}
          className="inline-flex items-center space-x-1 text-xs font-bold text-[#9C27B0] hover:text-[#7B1FA2] bg-purple-50 px-3 py-1.5 rounded-full transition cursor-pointer"
        >
          <FiPlus /> <span>Add Address</span>
        </button>
      </div>

      {addresses?.length === 0 ? (
        <p className="text-xs font-medium text-[#757575] text-center py-6">No delivery addresses saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses?.map((addr) => (
            <div
              key={addr._id}
              onClick={() => handleSetDefaultAddress(addr._id)}
              className={`p-4 border rounded-2xl space-y-3 relative flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                addr.isDefault
                  ? 'border-[#9C27B0] bg-purple-50/40 ring-2 ring-[#9C27B0]/20 shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 hover:border-purple-300 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#9C27B0] uppercase bg-purple-100 px-2.5 py-0.5 rounded-full">{addr.label || 'Home'}</span>
                  
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="radio"
                      name="selectedProfileAddress"
                      checked={Boolean(addr.isDefault)}
                      onChange={() => handleSetDefaultAddress(addr._id)}
                      className="w-4 h-4 text-[#9C27B0] focus:ring-[#9C27B0] cursor-pointer"
                    />
                    <span className={`text-[10px] font-bold ${addr.isDefault ? 'text-[#9C27B0]' : 'text-slate-400'}`}>
                      {addr.isDefault ? 'Primary' : 'Select'}
                    </span>
                  </div>
                </div>

                <p className="text-xs font-bold text-[#212121] pt-1">{addr.address}</p>
                <p className="text-[11px] text-[#757575]">{addr.city}, {addr.postalCode}</p>
                <p className="text-[11px] text-[#757575]">{addr.country || 'India'}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditAddress(addr);
                  }}
                  className="inline-flex items-center space-x-1 font-bold text-[#9C27B0] hover:underline transition cursor-pointer"
                >
                  <FiEdit size={13} /> <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteAddress(e, addr._id)}
                  className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                  title="Delete Address"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100">
            <h3 className="text-sm font-black text-[#212121] border-b border-slate-100 pb-3">
              {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>
            <form onSubmit={handleSaveAddressSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#757575]">Address Type</label>
                <select
                  value={newAddr.label}
                  onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-bold bg-slate-50 mt-1"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#757575]">Street Address</label>
                <input
                  type="text"
                  required
                  value={newAddr.address}
                  onChange={(e) => setNewAddr({ ...newAddr, address: e.target.value })}
                  placeholder="123 Park Street, Flat 4B"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium bg-slate-50 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#757575]">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    placeholder="Mumbai"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium bg-slate-50 mt-1"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#757575]">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    placeholder="400001"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-medium bg-slate-50 mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-[#212121] text-xs font-bold rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#9C27B0] hover:bg-[#7B1FA2] text-white text-xs font-bold rounded-full cursor-pointer shadow-xs"
                >
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManager;
