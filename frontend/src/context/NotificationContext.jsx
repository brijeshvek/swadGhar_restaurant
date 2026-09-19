import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  ShoppingBag,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addNotification = useCallback((type, message, options = {}) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const duration = options.duration !== undefined ? options.duration : (type === 'error' ? 5000 : 4000);
    const title = options.title || (
      type === 'success' ? 'Success!' :
      type === 'error' ? 'Something went wrong' :
      type === 'warning' ? 'Notice' :
      type === 'cart' ? 'Added to Cart!' :
      'Information'
    );

    const newToast = {
      id,
      type,
      message,
      title,
      duration,
      createdAt: Date.now(),
      action: options.action, // { label: string, onClick: () => void, url?: string }
      food: options.food, // optional food item thumbnail & details
    };

    setNotifications((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 toasts active
  }, []);

  const showSuccess = useCallback((msg, options) => {
    const opts = typeof options === 'string' ? { title: options } : options || {};
    addNotification('success', msg, opts);
  }, [addNotification]);

  const showError = useCallback((msg, options) => {
    const opts = typeof options === 'string' ? { title: options } : options || {};
    addNotification('error', msg, opts);
  }, [addNotification]);

  const showWarning = useCallback((msg, options) => {
    const opts = typeof options === 'string' ? { title: options } : options || {};
    addNotification('warning', msg, opts);
  }, [addNotification]);

  const showInfo = useCallback((msg, options) => {
    const opts = typeof options === 'string' ? { title: options } : options || {};
    addNotification('info', msg, opts);
  }, [addNotification]);

  const showCartToast = useCallback((foodItem, message = 'Item added to your culinary order', actionUrl = '/cart') => {
    addNotification('cart', message, {
      title: foodItem?.name ? `Added ${foodItem.name}` : 'Added to Cart',
      food: foodItem,
      duration: 4500,
      action: actionUrl ? { label: 'View Cart', url: actionUrl } : undefined,
    });
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showCartToast,
        addNotification,
        removeNotification,
      }}
    >
      {children}

      {/* Modern Stacked Toast Notification Viewport */}
      <div
        aria-live="polite"
        className="fixed top-20 sm:top-24 right-4 sm:right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none select-none"
      >
        {notifications.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() => removeNotification(toast.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Individual Toast Item with Timer Progress Bar & Hover-to-Pause
const ToastCard = ({ toast, onClose }) => {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast.duration <= 0) return;

    const intervalTime = 40;
    const step = (intervalTime / toast.duration) * 100;

    const timer = setInterval(() => {
      if (!paused) {
        setProgress((prev) => {
          if (prev <= step) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - step;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast.duration, paused, onClose]);

  const handleActionClick = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
    } else if (toast.action?.url) {
      navigate(toast.action.url);
    }
    onClose();
  };

  const getThemeConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/30',
          bg: 'bg-stone-900/95 shadow-emerald-950/20',
          accent: 'bg-emerald-500',
          titleColor: 'text-emerald-400',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          border: 'border-rose-500/30',
          bg: 'bg-stone-900/95 shadow-rose-950/20',
          accent: 'bg-rose-500',
          titleColor: 'text-rose-400',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          border: 'border-amber-500/30',
          bg: 'bg-stone-900/95 shadow-amber-950/20',
          accent: 'bg-amber-500',
          titleColor: 'text-amber-400',
        };
      case 'cart':
        return {
          icon: <ShoppingBag className="w-5 h-5 text-brand-400 shrink-0" />,
          border: 'border-brand-500/40',
          bg: 'bg-stone-900/95 shadow-brand-950/30',
          accent: 'bg-brand-500',
          titleColor: 'text-brand-400',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
          border: 'border-sky-500/30',
          bg: 'bg-stone-900/95 shadow-sky-950/20',
          accent: 'bg-sky-500',
          titleColor: 'text-sky-400',
        };
    }
  };

  const theme = getThemeConfig();

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${theme.border} ${theme.bg} shadow-2xl backdrop-blur-xl transition-all duration-300 transform translate-y-0 opacity-100 animate-fade-in text-stone-100 flex flex-col`}
      role="alert"
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Food thumbnail if cart toast */}
        {toast.food?.image ? (
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm relative">
            <img
              src={toast.food.image}
              alt={toast.food.name || 'Dish'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ) : (
          <div className="mt-0.5">{theme.icon}</div>
        )}

        {/* Text Content */}
        <div className="flex-1 min-w-0 pr-1 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h5 className={`text-xs sm:text-sm font-bold tracking-tight ${theme.titleColor}`}>
              {toast.title}
            </h5>
            {toast.type === 'cart' && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                Hot
              </span>
            )}
          </div>

          <p className="text-xs text-stone-300 font-normal leading-relaxed line-clamp-2">
            {toast.message}
          </p>

          {/* Action button if provided */}
          {toast.action && (
            <div className="pt-2">
              <button
                onClick={handleActionClick}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 shadow-sm group"
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-brand-300" />
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 -mr-1 -mt-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto Dismiss Progress Bar */}
      {toast.duration > 0 && (
        <div className="w-full h-1 bg-white/10 overflow-hidden">
          <div
            className={`h-full ${theme.accent} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
