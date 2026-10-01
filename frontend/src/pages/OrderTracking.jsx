import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Truck,
  ChefHat,
  PackageCheck,
  MapPin,
  Phone,
  RefreshCw,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  Store,
  Navigation,
  ExternalLink,
  Receipt,
  Bike,
  ShieldCheck,
  UserCheck,
  Radio,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import CookingLoader from '../components/common/CookingLoader';
import { useTranslation } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import LiveTrackingMap from '../components/tracking/LiveTrackingMap';

const OrderTracking = () => {
  const { id } = useParams(); // Can be orderNumber or ObjectId
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo } = useNotification();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await api.get(`/orders/${id}`);
      if (res?.data) {
        setOrder(res.data);
        if (isManualRefresh) {
          showSuccess(t('orderTracking.statusRefreshed', 'Live order and kitchen stream refreshed!'));
        }
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
      if (isManualRefresh) {
        showError('Could not refresh order status. Please check your connection.');
      }
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto poll every 15 seconds for live status updates
    const interval = setInterval(() => fetchOrder(false), 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <CookingLoader
          text={t('orderTracking.title', 'Tracking Kitchen Preparation...')}
          subtext={t('orderTracking.subtitle', 'Connecting to live kitchen status and chef progress...')}
          size="md"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-stone-900">{t('common.error', 'Order Not Found')}</h2>
        <p className="text-stone-500 text-sm">{t('checkout.subtitle', 'Please verify your order number and try again.')}</p>
        <Link to="/my-orders" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          {t('nav.myOrders', 'View My Orders')}
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: t('orderTracking.statusPlaced', 'Order Placed'), desc: t('orderTracking.statusPlaced', 'Received in system'), icon: ShoppingBag },
    { key: 'confirmed', label: t('orderTracking.statusConfirmed', 'Kitchen Confirmed'), desc: t('orderTracking.statusConfirmed', 'Order accepted'), icon: CheckCircle2 },
    { key: 'preparing', label: t('orderTracking.statusPreparing', 'Cooking & Simmering'), desc: t('orderTracking.statusPreparing', 'Handcrafted fresh'), icon: ChefHat },
    {
      key: order.orderType === 'pickup' ? 'ready_for_pickup' : 'ready',
      label: order.orderType === 'pickup' ? t('orderTracking.statusReady', 'Ready for Pickup') : t('orderTracking.statusReady', 'Food Packed'),
      desc: t('orderTracking.statusReady', 'Boxed with hygiene'),
      icon: PackageCheck,
    },
    { key: 'out_for_delivery', label: t('orderTracking.statusOutForDelivery', 'Out for Delivery'), desc: t('orderTracking.statusOutForDelivery', 'Valet on the way'), icon: Truck },
    {
      key: order.orderType === 'pickup' ? 'completed' : 'delivered',
      label: order.orderType === 'pickup' ? t('orderTracking.statusDelivered', 'Order Picked Up') : t('orderTracking.statusDelivered', 'Delivered Fresh'),
      desc: t('orderTracking.statusDelivered', 'Enjoy your meal!'),
      icon: CheckCircle2,
    },
  ];

  const statusOrder = [
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'completed',
  ];

  const currentStatusIndex = statusOrder.indexOf(order.orderStatus);

  const isStepCompleted = (stepKey) => {
    const stepIdx = statusOrder.indexOf(stepKey);
    return currentStatusIndex >= stepIdx && order.orderStatus !== 'cancelled';
  };

  const isStepActive = (stepKey) => {
    return order.orderStatus === stepKey;
  };

  // Progress percentage calculation for Map Rider Transit
  const getProgressPercentage = () => {
    switch (order.orderStatus) {
      case 'pending':
        return 10;
      case 'confirmed':
        return 25;
      case 'preparing':
        return 50;
      case 'ready':
      case 'ready_for_pickup':
        return 70;
      case 'out_for_delivery':
        return 88;
      case 'delivered':
      case 'completed':
        return 100;
      default:
        return 20;
    }
  };

  const progressPercent = getProgressPercentage();

  // Outlet & Customer address strings for navigation
  const outletAddress = order.franchiseDetails?.address || 'Grand Imperial Complex, Opp. Iscon Mall, SG Highway, Bodakdev, Ahmedabad - 380054';
  const customerAddress = order.deliveryAddress
    ? [order.deliveryAddress.houseNo, order.deliveryAddress.street, order.deliveryAddress.area, order.deliveryAddress.city, order.deliveryAddress.pincode].filter(Boolean).join(', ')
    : 'Customer Address';

  const googleMapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(outletAddress)}&destination=${encodeURIComponent(customerAddress)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      
      {/* 1. Header Bar with Title, Order Badge & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200/90 shadow-sm">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {t('orderTracking.title', 'Live Order Tracker & Kitchen Stream')}
            </h1>
            <span className="inline-flex items-center shrink-0 whitespace-nowrap font-mono font-bold text-xs sm:text-sm bg-amber-500/10 text-amber-800 px-3 py-1 rounded-xl border border-amber-400/40 shadow-xs">
              #{order.orderNumber}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 line-clamp-2">
            Real-time kitchen preparation telemetry and doorstep GPS dispatch tracking.
          </p>
        </div>

        {/* 3 Unified Action Buttons in Clean Even Row */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Button 1: Return to My Orders */}
          <Link
            to="/my-orders"
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-3.5 sm:px-4 rounded-xl bg-stone-100 hover:bg-stone-200/80 active:scale-95 text-stone-700 hover:text-stone-900 text-xs sm:text-sm font-semibold transition-all border border-stone-200/60 shadow-xs whitespace-nowrap cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600 shrink-0" />
            <span>{t('nav.myOrders', 'My Orders')}</span>
          </Link>

          {/* Button 2: View Tax Invoice */}
          <Link
            to={`/orders/${order._id || order.orderNumber}/invoice`}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-3.5 sm:px-4 rounded-xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-300/80 text-xs sm:text-sm font-semibold transition-all shadow-xs whitespace-nowrap cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{t('orderSuccess.viewInvoiceBtn', 'View Invoice')}</span>
          </Link>

          {/* Button 3: Live Status Refresh */}
          <button
            type="button"
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 h-10 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-glow whitespace-nowrap cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? t('common.processing', 'Refreshing...') : t('common.refresh', 'Refresh')}</span>
          </button>
        </div>
      </div>

      {/* 2. Live Stepper Progress Tracker */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-md space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              {t('common.status', 'Current Preparation State')}
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-lg font-bold text-brand-600 capitalize">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-xs text-stone-400 block">{t('orderSuccess.estimatedDeliveryTime', 'Estimated Arrival')}</span>
            <span className="text-base font-bold text-stone-900 font-sans">
              ~ {new Date(order.estimatedDeliveryTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Horizontal Stepper Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 relative">
          {steps.map((step, idx) => {
            const completed = isStepCompleted(step.key);
            const active = isStepActive(step.key);
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    active
                      ? 'bg-brand-600 text-white shadow-glow scale-110 ring-4 ring-brand-500/20 animate-pulse'
                      : completed
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-400 border border-stone-200/60'
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold leading-tight ${
                      completed || active ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Live Swiggy & Zomato Style GPS Order Tracking Map */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Live Kitchen Dispatch & Valet Telemetry Map
              </h3>
              <p className="text-xs text-stone-500">
                Live GPS route navigation from <strong className="text-stone-800">{order.franchiseDetails?.name || 'SwadGhar Outlet'}</strong> to your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* Live Interactive Map Component */}
        <LiveTrackingMap order={order} />
      </div>

      {/* 4. Details Grid: Delivery Information & Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery / Address Information */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>{t('orderTracking.deliveryAddress', 'Delivery & Destination Details')}</span>
          </h3>

          {order.deliveryAddress ? (
            <div className="space-y-2 text-xs text-stone-600">
              <p className="font-bold text-stone-900 text-sm">
                {order.deliveryAddress.fullName}
              </p>
              <p>{order.deliveryAddress.address || `${order.deliveryAddress.houseNo || ''} ${order.deliveryAddress.street || ''} ${order.deliveryAddress.area || ''}`}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
              {order.deliveryAddress.landmark && (
                <p className="text-stone-400">{t('checkout.landmark', 'Landmark')}: {order.deliveryAddress.landmark}</p>
              )}
              <div className="pt-2 flex items-center gap-2 text-stone-700">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-semibold">{order.deliveryAddress.phone}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              {t('checkout.deliveryInstructions', 'Order Type')}: <strong className="capitalize">{order.orderType}</strong> (Ready at SwadGhar Front Counter)
            </p>
          )}

          {order.franchiseDetails && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 text-xs text-stone-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span>🏬 Preparing Kitchen Outlet:</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded uppercase">{order.franchiseDetails.city}</span>
              </div>
              <p className="font-semibold text-stone-900">{order.franchiseDetails.name}</p>
              <p className="text-stone-600 text-[11px]">{order.franchiseDetails.address}</p>
              {order.franchiseDetails.phone && (
                <p className="text-stone-600 text-[11px] flex items-center gap-1 pt-0.5">
                  <Phone className="w-3 h-3 text-amber-700" />
                  <span>Branch Contact: {order.franchiseDetails.phone}</span>
                </p>
              )}
            </div>
          )}

          {order.specialInstructions && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>{t('checkout.deliveryInstructions', 'Special Requests')}:</strong> {order.specialInstructions}
            </div>
          )}
        </div>

        {/* Ordered Delicacies Summary */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900">
              {t('orderTracking.itemsOrdered', 'Order Items')} ({order.items.length})
            </h3>
            <span className="text-xs font-bold text-stone-900 font-sans">
              {t('common.total', 'Total')}: ₹{order.pricing.total}
            </span>
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-1 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-stone-700">
                <div className="flex items-center gap-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span>
                    {item.name} <strong className="text-stone-900">x{item.quantity}</strong>
                  </span>
                </div>
                <span className="font-bold font-sans">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">{t('admin.payment', 'Payment Status')}:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                order.paymentInfo.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {order.paymentInfo.method.toUpperCase()} • {order.paymentInfo.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
