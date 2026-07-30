import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersList, toggleUserBlock, deleteUser, clearAdminStates } from '../../features/admin/adminSlice.js';
import Loader from '../../components/common/Loader.jsx';
import { FiInfo, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

import ConfirmModal from '../../components/common/ConfirmModal.jsx';

const Users = () => {
  const dispatch = useDispatch();

  const { users, loading, success, error } = useSelector((state) => state.admin);
  const [deleteModal, setDeleteModal] = React.useState({ isOpen: false, id: null });

  useEffect(() => {
    dispatch(fetchUsersList());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success('Account permissions updated.');
      dispatch(clearAdminStates());
      dispatch(fetchUsersList());
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAdminStates());
    }
  }, [error, dispatch]);

  const handleToggleBlock = (id, currentStatus) => {
    dispatch(toggleUserBlock({ id, isBlocked: !currentStatus }));
  };

  const handleDeleteUser = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (!deleteModal.id) return;
    dispatch(deleteUser(deleteModal.id))
      .unwrap()
      .then(() => {
        toast.success('User deleted successfully.');
        dispatch(fetchUsersList());
      })
      .finally(() => {
        setDeleteModal({ isOpen: false, id: null });
      });
  };

  if (loading && users.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Manage Customers</h1>
        <p className="text-xs text-gray-400 font-semibold mt-1">Review profiles and manage access permissions.</p>
      </div>

      {/* Users List Table */}
      {users.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 bg-white rounded-lg">
          <FiInfo className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm font-semibold text-gray-500">No registered user profiles found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm font-semibold text-gray-700">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Customer Name</th>
                  <th className="px-6 py-3">Email Address</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-bold text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-gray-400">{user.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        user.role === 'Admin' ? 'text-purple-600 bg-purple-50' : 'text-blue-600 bg-blue-50'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.isBlocked ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">Blocked</span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      {/* Block/Unblock toggle */}
                      <button
                        onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                        className={`text-xs font-bold px-3 py-1.5 rounded border transition cursor-pointer ${
                          user.isBlocked
                            ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                            : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                        }`}
                      >
                        {user.isBlocked ? 'Activate' : 'Block'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 border border-gray-200 rounded text-gray-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete User"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete User Account?"
        message="Are you sure you want to permanently delete this user account?"
        confirmText="Delete Account"
        variant="danger"
      />

    </div>
  );
};

export default Users;
