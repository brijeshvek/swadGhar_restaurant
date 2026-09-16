import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Clock,
  Calendar,
  Star,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue || 0}`,
      sub: `Today: ₹${stats?.todayRevenue || 0}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      sub: `Today: ${stats?.todayOrders || 0} orders`,
      icon: ShoppingBag,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      title: 'Active Customers',
      value: stats?.totalCustomers || 0,
      sub: 'Verified food lovers',
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Pending In Kitchen',
      value: stats?.pendingOrders || 0,
      sub: 'Orders needing prep',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Admin Overview & Insights
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Real-time analytics for orders, daily revenue, table bookings and kitchen load
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border ${card.bg} backdrop-blur-md space-y-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-bold font-sans text-white block">
                  {card.value}
                </span>
                <span className="text-[11px] text-stone-400">{card.sub}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly Revenue & Trend Chart Preview */}
      <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-500" />
            <span>Last 7 Days Revenue & Volume Trend</span>
          </h3>
          <span className="text-xs text-stone-400">Live updated</span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-stone-800 pb-2">
          {stats?.weeklyTrends?.map((item, idx) => {
            const maxRev = Math.max(...(stats.weeklyTrends.map((t) => t.revenue) || [1]), 1000);
            const heightPercent = Math.max(12, Math.min(100, (item.revenue / maxRev) * 100));

            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                  ₹{item.revenue}
                </span>
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-brand-600 to-amber-500 rounded-xl group-hover:brightness-125 transition-all shadow-glow"
                  style={{ height: `${heightPercent}%` }}
                ></div>
                <div className="text-center">
                  <span className="text-xs font-bold text-stone-300 block">{item.day}</span>
                  <span className="text-[10px] text-stone-500">{item.orders} ord</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders & Popular Dishes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white">
              Recent Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-stone-300 font-semibold">{ord.customer?.name || 'Customer'}</span>
                    </div>
                    <p className="text-[11px] text-stone-500">{ord.items?.length || 0} item(s) • ₹{ord.pricing?.total}</p>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      ord.orderStatus === 'delivered'
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                        : 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                    }`}
                  >
                    {ord.orderStatus}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-500">No recent orders yet.</p>
            )}
          </div>
        </div>

        {/* Top Delicacies */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white">
              Top Rated Dishes
            </h3>
            <Link
              to="/admin/foods"
              className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Menu</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats?.popularFoods?.map((f) => (
              <div
                key={f._id}
                className="p-3 rounded-2xl bg-stone-900 border border-stone-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white">{f.name}</h4>
                    <span className="text-stone-400 text-[11px]">{f.category?.name || 'Category'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-amber-400 flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {f.rating?.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-stone-500">{f.numReviews || 0} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
