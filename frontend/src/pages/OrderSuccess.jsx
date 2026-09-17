import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Truck, Clock, MapPin, Receipt, ArrowRight } from 'lucide-react';

const OrderSuccess = () => {
  const { orderNumber } = useParams();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center space-y-8 animate-fade-in">
      {/* Success Icon */}
      <div className="relative inline-block">
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-glow animate-bounce duration-1000">
          <CheckCircle2 className="w-14 h-14" />
        </div>
      </div>

      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
          Order Confirmed & Dispatched to Kitchen
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          Thank You for Dining with SwadGhar!
        </h1>
        <p className="text-stone-500 text-sm sm:text-base max-w-lg mx-auto">
          Your authentic delicacies are being prepared with fresh ingredients and royal Indian spices.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-lg text-left space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <span className="text-xs font-semibold text-stone-500">Order Reference</span>
          <span className="font-mono font-bold text-sm text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg">
            #{orderNumber}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800 block">Est. Delivery Time</span>
              <span className="text-stone-500">30 – 40 Minutes</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-800 block">Live Status</span>
              <span className="text-amber-700 font-semibold">Preparing in Kitchen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          to={`/orders/track/${orderNumber}`}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2"
        >
          <Truck className="w-4 h-4" />
          <span>Track Live Order</span>
        </Link>

        <Link
          to={`/orders/${orderNumber}/invoice`}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Receipt className="w-4 h-4" />
          <span>View Tax Invoice</span>
        </Link>

        <Link
          to="/my-orders"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
        >
          <span>Order History</span>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
