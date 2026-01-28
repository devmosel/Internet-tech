'use client';

import { createContext, useContext, useState } from 'react';
import Toast from '@/component/Toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ 
    title: '', 
    message: '', 
    type: 'success',
    duration: 5000 
  });

  const showToastMessage = ({ title, message, type = 'success', duration = 5000 }) => {
    setToastData({ title, message, type, duration });
    setShowToast(true);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  return (
    <ToastContext.Provider value={{ showToastMessage, hideToast }}>
      {children}
      <Toast
        show={showToast}
        type={toastData.type}
        title={toastData.title}
        message={toastData.message}
        duration={toastData.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
