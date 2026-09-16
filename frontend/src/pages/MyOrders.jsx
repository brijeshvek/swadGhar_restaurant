import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronRight,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/cancel`, { cancelReason: 'Customer requested cancellation' });
      showSuccess('Order cancelled successfully.');
      fetchOrders();
    } catch (err) {
      showError(err.message || 'Cannot cancel order.');
    }
  };

  const openReviewModal = (foodItem, order) => {
    setSelectedFood(foodItem);
    setSelectedOrder(order);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        foodId: selectedFood.food,
        orderId: selectedOrder._id,
        rating,
        comment,
      });
      showSuccess(`Review submitted for ${selectedFood.name}! Thank you.`);
      setReviewModalOpen(false);
    } catch (err) {
      showError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            My Order History
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            View all your past culinary experiences and live active deliveries
          </p>
        </div>

        <Link
          to="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order Food</span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4 max-w-md mx-auto">
          <Receipt className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-stone-800">
            No Orders Placed Yet
          </h3>
          <p className="text-stone-500 text-xs">
            Indulge in our authentic handcrafted dishes today and enjoy fast doorstep delivery.
          </p>
          <Link
            to="/menu"
            className="inline-block px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-xs shadow-md"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-4 hover:border-brand-500/30 transition-all"
            >
              {/* Order Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                    #{order.orderNumber}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    order.orderStatus === 'delivered' || order.orderStatus === 'completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'cancelled'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Items List Brief */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <span className="font-bold text-stone-900 block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-stone-400">Qty: {item.quantity}</span>
                      </div>
                    </div>

                    {/* Allow Review if Delivered */}
                    {(order.orderStatus === 'delivered' || order.orderStatus === 'completed') && (
                      <button
                        onClick={() => openReviewModal(item, order)}
                        className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-[10px] font-bold flex items-center gap-1 shrink-0"
                      >
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>Rate</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Footer & Actions */}
              <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-stone-500">
                  <span>
                    Total: <strong className="text-stone-900 font-sans text-sm">₹{order.pricing.total}</strong>
                  </span>
                  <span className="ml-3 capitalize">({order.orderType})</span>
                </div>

                <div className="flex items-center gap-3">
                  {order.orderStatus === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}

                  <Link
                    to={`/orders/track/${order.orderNumber}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Track Live</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalOpen && selectedFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-white p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Verified Customer Review
              </span>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                Review: {selectedFood.name}
              </h3>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Your Dining Experience</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the flavor, aroma, texture, and presentation..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:outline-none focus:border-brand-500 resize-none"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
