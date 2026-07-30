import React from 'react';
import Modal from './Modal.jsx';
import { FiAlertTriangle, FiInfo, FiTrash2 } from 'react-icons/fi';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  loading = false,
}) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bgIcon: 'bg-red-50 text-red-600',
      btn: 'bg-red-600 hover:bg-red-700 text-white',
      icon: FiTrash2,
    },
    warning: {
      bgIcon: 'bg-amber-50 text-amber-600',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: FiAlertTriangle,
    },
    info: {
      bgIcon: 'bg-blue-50 text-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      icon: FiInfo,
    },
  };

  const style = variantStyles[variant] || variantStyles.danger;
  const IconComponent = style.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 text-center space-y-4 max-w-sm mx-auto">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${style.bgIcon}`}>
          <IconComponent size={28} />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-gray-900">{title}</h3>
          <p className="text-xs font-medium text-gray-500">{message}</p>
        </div>

        <div className="flex items-center space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer ${style.btn}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
