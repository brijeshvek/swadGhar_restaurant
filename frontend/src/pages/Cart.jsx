import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const Cart = () => {
  const {
    cartItems,
    subtotal,
    discountAmount,
    tax,
    deliveryFee,
    grandTotal,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { showSuccess, showError } = useNotification();
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const navigate = useNavigate();

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/coupons');
        if (res?.data) {
          setAvailableCoupons(res.data);
        }
      } catch (err) {
        console.error('Error fetching coupons:', err);
      }
    };
    fetchCoupons();
  }, []);

  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCodeInput.trim(),
        subtotal,
      });

      if (res?.data) {
        applyCoupon(res.data);
        setCouponCodeInput('');
      }
    } catch (err) {
      showError(err.message || 'Invalid or expired coupon code.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleQuickApply = async (code) => {
    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate', {
        code,
        subtotal,
      });
      if (res?.data) {
        applyCoupon(res.data);
      }
    } catch (err) {
      showError(err.message || 'Coupon requirements not met.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Your Plate is Empty
          </h2>
          <p className="text-stone-500 text-sm">
            You haven’t added any appetizing delicacies to your plate yet.
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all"
        >
          <span>Explore Delicious Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const freeDeliveryThreshold = 499;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Your Dining Plate
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            {cartItems.length} unique dish item(s) selected
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-stone-400 hover:text-rose-500 font-semibold transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Plate</span>
        </button>
      </div>

      {/* Free Delivery Banner Progress */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-amber-800">
            <Truck className="w-4 h-4 text-brand-600" />
            {remainingForFreeDelivery === 0
              ? '🎉 Congratulations! You have unlocked FREE Express Delivery!'
              : `Add ₹${remainingForFreeDelivery} more to enjoy FREE Delivery!`}
          </span>
          <span className="text-stone-500">{Math.round(freeDeliveryProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-500 transition-all duration-500"
            style={{ width: `${freeDeliveryProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.food._id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/80 shadow-sm flex items-center justify-between gap-4"
            >
              {/* Image & Title */}
              <div className="flex items-center gap-4">
                <img
                  src={item.food.image}
                  alt={item.food.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-100"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                        item.food.foodType === 'veg'
                          ? 'border-emerald-600'
                          : 'border-rose-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.food.foodType === 'veg'
                            ? 'bg-emerald-600'
                            : 'bg-rose-600'
                        }`}
                      ></span>
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 leading-snug">
                      {item.food.name}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">
                    ₹{item.price} each
                  </p>
                </div>
              </div>

              {/* Quantity Controls & Total */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2 bg-stone-100 rounded-xl p-1 border border-stone-200">
                  <button
                    onClick={() => updateQuantity(item.food._id, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 shadow-sm flex items-center justify-center text-stone-800 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.food._id, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white hover:bg-stone-200 shadow-sm flex items-center justify-center text-stone-800 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[70px]">
                  <span className="text-base font-bold text-stone-900 font-sans block">
                    ₹{item.price * item.quantity}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.food._id)}
                  className="text-stone-400 hover:text-rose-500 transition-colors p-1"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Add More Delicacies from Menu</span>
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Summary & Coupons */}
        <div className="space-y-6">
          {/* Coupon Box */}
          <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Apply Discount Coupon</span>
            </h4>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Coupon '{appliedCoupon.code}' Applied!
                  </span>
                  <p className="text-emerald-700 text-[11px]">
                    You saved ₹{discountAmount} on this order
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-stone-400 hover:text-rose-600 p-1"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs uppercase font-bold tracking-wider focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon || !couponCodeInput.trim()}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold transition-colors"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {/* Quick Coupon Suggestions */}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Available Offers:
                </span>
                <div className="space-y-1.5">
                  {availableCoupons.map((c) => (
                    <div
                      key={c._id || c.code}
                      className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-[11px]"
                    >
                      <div>
                        <span className="font-bold text-stone-800 font-mono tracking-wide">
                          {c.code}
                        </span>
                        <p className="text-stone-500 text-[10px]">{c.description}</p>
                      </div>
                      <button
                        onClick={() => handleQuickApply(c.code)}
                        className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-bold hover:bg-brand-100 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bill Breakdown Box */}
          <div className="p-6 rounded-3xl bg-white border border-stone-200 shadow-md space-y-4">
            <h4 className="text-base font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
              Bill Summary
            </h4>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-stone-900 font-sans">₹{subtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold text-stone-900 font-sans">₹{tax}</span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    <span className="font-bold text-stone-900 font-sans">₹{deliveryFee}</span>
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-900">Grand Total</span>
                <span className="text-2xl font-bold text-brand-600 font-sans">
                  ₹{grandTotal}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-lg shadow-brand-500/25 hover:shadow-glow transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
