import React, { useEffect, useState } from 'react';
import { Star, Trash2, CheckCircle2, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      if (res?.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      showSuccess('Review deleted.');
      fetchReviews();
    } catch (err) {
      showError(err.message || 'Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Customer Reviews Moderation ({reviews.length})
        </h1>
        <p className="text-xs sm:text-sm text-stone-400">
          Monitor diner ratings, feedback on delicacies, and moderate public comments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-stone-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{rev.customerName}</h4>
                    <p className="text-[10px] text-stone-400">{rev.customer?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              {rev.food && (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-900 text-xs">
                  <img
                    src={rev.food.image}
                    alt={rev.food.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="text-brand-400 font-bold">{rev.food.name}</span>
                </div>
              )}

              <p className="text-xs text-stone-300 italic leading-relaxed">
                "{rev.comment}"
              </p>
            </div>

            <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
              <span className="text-[10px] text-stone-500">
                {new Date(rev.createdAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => handleDeleteReview(rev._id)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-400 hover:text-rose-400 transition-colors"
                title="Delete Review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;
