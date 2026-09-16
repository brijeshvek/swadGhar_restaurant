import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, X, Calendar, Percent } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { showSuccess, showError } = useNotification();

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 300,
    maxDiscount: 150,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Special seasonal promotion',
    usageLimit: 500,
  });

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      if (res?.data) {
        setCoupons(res.data);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', formData);
      showSuccess(`Coupon '${formData.code.toUpperCase()}' created!`);
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      showError(err.message || 'Failed to create coupon.');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Delete coupon '${code}'?`)) return;
    try {
      await api.delete(`/coupons/${id}`);
      showSuccess(`Coupon '${code}' deleted.`);
      fetchCoupons();
    } catch (err) {
      showError(err.message || 'Cannot delete coupon.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-stone-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Coupons & Promotional Offers ({coupons.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Launch discount campaigns, set minimum basket sizes, and track coupon redemption
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c._id}
            className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-lg flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                  {c.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
                  {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                </span>
              </div>

              <p className="text-xs text-stone-300">{c.description}</p>

              <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 space-y-1 text-[11px] text-stone-400">
                <div className="flex justify-between">
                  <span>Min Order:</span>
                  <span className="text-white font-bold">₹{c.minOrderAmount}</span>
                </div>
                {c.discountType === 'percentage' && (
                  <div className="flex justify-between">
                    <span>Max Discount Cap:</span>
                    <span className="text-white font-bold">₹{c.maxDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Redemptions:</span>
                  <span className="text-amber-400 font-bold">{c.usedCount || 0} / {c.usageLimit}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
              <span className="text-stone-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Exp: {new Date(c.expiryDate).toLocaleDateString()}
              </span>

              <button
                onClick={() => handleDeleteCoupon(c._id, c.code)}
                className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-900/40 text-stone-400 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-3xl bg-stone-900 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-xl font-serif font-bold text-white">Create Promo Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE30"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white uppercase font-bold tracking-widest focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-stone-300">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-stone-300">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 20% off up to ₹150 for dinner orders"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-md transition-colors"
                >
                  Create Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
