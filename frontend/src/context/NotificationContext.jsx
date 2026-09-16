import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setNotifications((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addNotification('success', msg), [addNotification]);
  const showError = useCallback((msg) => addNotification('error', msg), [addNotification]);
  const showInfo = useCallback((msg) => addNotification('info', msg), [addNotification]);

  return (
    <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {notifications.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md animate-fade-in transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-stone-900/95 border-emerald-500/40 text-stone-100'
                : toast.type === 'error'
                ? 'bg-stone-900/95 border-rose-500/40 text-stone-100'
                : 'bg-stone-900/95 border-amber-500/40 text-stone-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-sm font-medium leading-snug">{toast.message}</div>

            <button
              onClick={() => removeNotification(toast.id)}
              className="text-stone-400 hover:text-stone-200 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
