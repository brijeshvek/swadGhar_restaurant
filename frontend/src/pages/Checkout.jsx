import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  ShoppingBag,
  CreditCard,
  Banknote,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    cartItems,
    subtotal,
    discountAmount,
    tax,
    deliveryFee,
    grandTotal,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // Form State
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'pickup' | 'dine-in'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'razorpay'

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(
    user?.addresses?.[0]?.street || ''
  );
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Ahmedabad');
  const [state, setState] = useState(user?.addresses?.[0]?.state || 'Gujarat');
  const [pincode, setPincode] = useState(user?.addresses?.[0]?.pincode || '380015');
  const [landmark, setLandmark] = useState(user?.addresses?.[0]?.landmark || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [processing, setProcessing] = useState(false);

  // Address Quick Select
  const handleSelectSavedAddress = (addr) => {
    setAddress(addr.street);
    setCity(addr.city);
    setState(addr.state || 'Gujarat');
    setPincode(addr.pincode);
    setLandmark(addr.landmark || '');
    showInfo('Selected saved address.');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      showError('Your plate is empty.');
      navigate('/menu');
      return;
    }

    if (!isAuthenticated) {
      showInfo('Please sign in or register to place your order.');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }

    if (orderType === 'delivery') {
      if (!fullName || !phone || !address || !city || !pincode) {
        showError('Please complete all delivery address fields.');
        return;
      }
    }

    setProcessing(true);

    try {
      // 1. Send Order to Backend
      const orderPayload = {
        items: cartItems.map((item) => ({
          food: item.food._id,
          quantity: item.quantity,
        })),
        orderType,
        deliveryAddress:
          orderType === 'delivery'
            ? {
                fullName,
                phone,
                email,
                address,
                city,
                state,
                pincode,
                landmark,
              }
            : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        paymentMethod,
        specialInstructions,
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data;

      // 2. Handle Razorpay Online Payment Flow
      if (paymentMethod === 'razorpay') {
        try {
          const rzpInitRes = await api.post('/payments/razorpay/create-order', {
            orderId: createdOrder._id,
          });

          const rzpData = rzpInitRes.data;

          // Check if Razorpay SDK script is loaded in window
          if (window.Razorpay && rzpData.orderId && !rzpData.orderId.startsWith('order_sim_')) {
            const options = {
              key: rzpData.key,
              amount: rzpData.amount,
              currency: rzpData.currency,
              name: 'SwadGhar Restaurant',
              description: `Order #${createdOrder.orderNumber}`,
              image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=150&q=80',
              order_id: rzpData.orderId,
              handler: async function (response) {
                try {
                  await api.post('/payments/razorpay/verify', {
                    orderId: createdOrder._id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  });
                  clearCart();
                  showSuccess('Payment Successful! Order Confirmed.');
                  navigate(`/order-success/${createdOrder.orderNumber}`);
                } catch (verifyErr) {
                  showError('Payment verification failed.');
                }
              },
              prefill: {
                name: fullName || user.name,
                email: email || user.email,
                contact: phone || user.phone,
              },
              theme: {
                color: '#ea580c',
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
              showError(`Payment failed: ${resp.error.description}`);
            });
            rzp.open();
            setProcessing(false);
            return;
          } else {
            // Simulated Test Payment Mode (Fallback when in Sandbox test without active gateway credentials)
            await api.post('/payments/razorpay/verify', {
              orderId: createdOrder._id,
              razorpay_order_id: rzpData.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: 'simulated_valid_signature',
            });
          }
        } catch (paymentErr) {
          console.warn('Razorpay initiation error, order placed in pending status:', paymentErr);
        }
      }

      // 3. Clear Cart & Navigate
      clearCart();
      showSuccess('Order Placed Successfully!');
      navigate(`/order-success/${createdOrder.orderNumber}`);
    } catch (err) {
      showError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mt-2">
          Secure Order Checkout
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Order Details Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Order Type Selection */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              1. Choose Dining Method
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'delivery', label: 'Home Delivery', icon: Truck, desc: 'Hot & fresh in 35m' },
                { id: 'pickup', label: 'Takeaway Pickup', icon: ShoppingBag, desc: 'Ready in 20m' },
                { id: 'dine-in', label: 'Dine-In Plate', icon: UtensilsCrossed, desc: 'Serve at table' },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setOrderType(type.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      orderType === type.id
                        ? 'bg-brand-500/10 border-brand-500 text-stone-900 ring-2 ring-brand-500/20 shadow-sm'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mb-2 ${
                        orderType === type.id ? 'text-brand-600' : 'text-stone-400'
                      }`}
                    />
                    <span className="block font-bold text-xs sm:text-sm">{type.label}</span>
                    <span className="text-[10px] text-stone-400">{type.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Customer & Address Details */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              2. {orderType === 'delivery' ? 'Delivery Information' : 'Customer Details'}
            </h3>

            {/* Saved Addresses Chips (If authenticated) */}
            {user?.addresses && user.addresses.length > 0 && orderType === 'delivery' && (
              <div className="space-y-2 pb-2">
                <span className="text-xs font-bold text-stone-500 block">
                  Select from Saved Addresses:
                </span>
                <div className="flex flex-wrap gap-2">
                  {user.addresses.map((addr) => (
                    <button
                      key={addr._id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-medium text-stone-800 border border-stone-200 flex items-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-600" />
                      <span>{addr.street.slice(0, 20)}...</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-700">Email Address (For Invoices)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {orderType === 'delivery' && (
                <>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-stone-700">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat 402, Shivalik High Street, Near Judges Bungalow"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="380015"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-stone-700">Landmark (Optional)</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Opposite Central Garden / Next to SBI Bank"
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-stone-700">Special Cooking / Delivery Request</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, pack extra mint chutney, ring bell twice..."
                  className="w-full px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-900">
              3. Select Payment Mode
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'cod'
                    ? 'bg-brand-500/10 border-brand-500 text-stone-900 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Banknote className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Pay with cash or UPI on delivery / pickup
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'bg-brand-500/10 border-brand-500 text-stone-900 ring-2 ring-brand-500/20'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-xs sm:text-sm block">
                    Online Payment (Razorpay)
                  </span>
                  <span className="text-[11px] text-stone-400">
                    UPI, Cards, NetBanking, Paytm & Wallets
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Summary & Place Order */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-md space-y-4">
            <h4 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
              Order Review
            </h4>

            {/* Item list brief */}
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.food._id}
                  className="flex justify-between items-center text-xs text-stone-700"
                >
                  <span className="line-clamp-1 flex-1">
                    {item.food.name} <span className="text-stone-400 font-bold">x{item.quantity}</span>
                  </span>
                  <span className="font-bold font-sans">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing Summary */}
            <div className="pt-3 border-t border-stone-100 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 font-sans">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold text-stone-900 font-sans">₹{tax}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>
                  {orderType !== 'delivery' || deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold text-stone-900 font-sans">₹{deliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Grand Total</span>
                <span className="text-2xl font-bold text-brand-600 font-sans">
                  ₹{orderType !== 'delivery' ? subtotal - discountAmount + tax : grandTotal}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Place Order • ₹
                    {orderType !== 'delivery'
                      ? subtotal - discountAmount + tax
                      : grandTotal}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
