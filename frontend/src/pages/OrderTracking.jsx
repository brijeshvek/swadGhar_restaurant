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
} from 'lucide-react';
import api from '../services/api';

const OrderTracking = () => {
  const { id } = useParams(); // Can be orderNumber or ObjectId
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await api.get(`/orders/${id}`);
      if (res?.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error('Error fetching order status:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto poll every 20 seconds for live updates
    const interval = setInterval(() => fetchOrder(), 20000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-2xl font-serif font-bold text-stone-900">Order Not Found</h2>
        <p className="text-stone-500 text-sm">Please verify your order number and try again.</p>
        <Link to="/my-orders" className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
          View My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'pending', label: 'Order Placed', desc: 'Received in system', icon: ShoppingBag },
    { key: 'confirmed', label: 'Kitchen Confirmed', desc: 'Order accepted', icon: CheckCircle2 },
    { key: 'preparing', label: 'Cooking & Simmering', desc: 'Handcrafted fresh', icon: ChefHat },
    {
      key: order.orderType === 'pickup' ? 'ready_for_pickup' : 'ready',
      label: order.orderType === 'pickup' ? 'Ready for Pickup' : 'Food Packed',
      desc: 'Boxed with hygiene',
      icon: PackageCheck,
    },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on the way', icon: Truck },
    {
      key: order.orderType === 'pickup' ? 'completed' : 'delivered',
      label: order.orderType === 'pickup' ? 'Order Picked Up' : 'Delivered Fresh',
      desc: 'Enjoy your meal!',
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-600 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>My Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Live Order Tracking
            </h1>
            <span className="font-mono font-bold text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-200">
              #{order.orderNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/orders/${order._id || order.orderNumber}/invoice`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-xs"
          >
            <span>View Tax Invoice</span>
          </Link>
          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Live Status Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Live Stepper Tracker */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-md space-y-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Current Progress
            </span>
            <span className="text-lg font-bold text-brand-600 capitalize">
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400 block">Estimated Arrival</span>
            <span className="text-sm font-bold text-stone-900 font-sans">
              ~ {new Date(order.estimatedDeliveryTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Vertical/Horizontal Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative">
          {steps.map((step, idx) => {
            const completed = isStepCompleted(step.key);
            const active = isStepActive(step.key);
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center text-center space-y-2 relative">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-brand-600 text-white shadow-glow scale-110 ring-4 ring-brand-500/20'
                      : completed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  <StepIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4
                    className={`text-xs font-bold leading-tight ${
                      completed || active ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  <p className="text-[10px] text-stone-400">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details & Delivery Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery / Address Information */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>Delivery Information</span>
          </h3>

          {order.deliveryAddress ? (
            <div className="space-y-2 text-xs text-stone-600">
              <p className="font-bold text-stone-900 text-sm">
                {order.deliveryAddress.fullName}
              </p>
              <p>{order.deliveryAddress.address}</p>
              <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}</p>
              {order.deliveryAddress.landmark && (
                <p className="text-stone-400">Landmark: {order.deliveryAddress.landmark}</p>
              )}
              <div className="pt-2 flex items-center gap-2 text-stone-700">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-semibold">{order.deliveryAddress.phone}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-500">
              Order Type: <strong className="capitalize">{order.orderType}</strong> (Ready at SwadGhar Front Counter)
            </p>
          )}

          {order.specialInstructions && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <strong>Instructions:</strong> {order.specialInstructions}
            </div>
          )}
        </div>

        {/* Ordered Delicacies Summary */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-stone-900">
              Order Items ({order.items.length})
            </h3>
            <span className="text-xs font-bold text-stone-900 font-sans">
              Total: ₹{order.pricing.total}
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
            <span className="text-stone-500">Payment Status:</span>
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
