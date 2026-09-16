import React, { useEffect, useState } from 'react';
import { Settings, Save, Store, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res?.data) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      setSettings(res.data);
      showSuccess('Restaurant settings updated successfully!');
    } catch (err) {
      showError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in text-stone-100">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Restaurant Settings & Policies
        </h1>
        <p className="text-xs sm:text-sm text-stone-400">
          Configure financial GST rates, delivery fees, business timings, and store availability
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Brand & Contact Information */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-brand-500" />
            <span>Store Profile & Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">Restaurant Name</label>
              <input
                type="text"
                value={settings.restaurantName || ''}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">Tagline</label>
              <input
                type="text"
                value={settings.tagline || ''}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">Direct Phone</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">Contact Email</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-stone-300">Street Address</label>
              <input
                type="text"
                value={settings.address?.street || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    address: { ...settings.address, street: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Financial Rates & Delivery */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span>Financials, Taxes & Delivery</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">GST Rate (%)</label>
              <input
                type="number"
                value={settings.financial?.taxRatePercentage || 5}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      taxRatePercentage: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">Flat Delivery Fee (₹)</label>
              <input
                type="number"
                value={settings.financial?.deliveryFee || 40}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      deliveryFee: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-300">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={settings.financial?.freeDeliveryThreshold || 499}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    financial: {
                      ...settings.financial,
                      freeDeliveryThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Availability Toggles */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-lg">
          <h3 className="text-sm font-serif font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Service Toggles</span>
          </h3>

          <div className="flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isOnlineOrderingOpen !== false}
                onChange={(e) => setSettings({ ...settings, isOnlineOrderingOpen: e.target.checked })}
                className="w-4 h-4 rounded bg-stone-900 border-stone-800 text-brand-600 focus:ring-0"
              />
              <div>
                <span className="font-bold text-white block">Online Food Ordering Open</span>
                <span className="text-[10px] text-stone-400">Allows customers to add to cart & checkout</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.isTableBookingOpen !== false}
                onChange={(e) => setSettings({ ...settings, isTableBookingOpen: e.target.checked })}
                className="w-4 h-4 rounded bg-stone-900 border-stone-800 text-brand-600 focus:ring-0"
              />
              <div>
                <span className="font-bold text-white block">Table Reservations Open</span>
                <span className="text-[10px] text-stone-400">Accepts dine-in seating requests</span>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 active:scale-95 text-white font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Global Restaurant Settings'}</span>
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
