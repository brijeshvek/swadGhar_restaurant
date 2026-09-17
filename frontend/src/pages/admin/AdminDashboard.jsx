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
  UtensilsCrossed,
  FolderTree,
  Tag,
  RotateCcw,
} from 'lucide-react';
import api from '../../services/api';
import { CountUp, SpotlightCard, AnimatedContent } from '../../components/animations';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await api.get('/admin/dashboard-stats');
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-400 text-xs tracking-wider uppercase font-semibold">Loading real-time analytics...</p>
      </div>
    );
  }

  const primaryCards = [
    {
      title: 'Total Revenue',
      value: stats?.totalRevenue || 0,
      prefix: '₹',
      sub: `Today: ₹${stats?.todayRevenue || 0}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      link: '/admin/orders',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      sub: `Today: ${stats?.todayOrders || 0} orders`,
      icon: ShoppingBag,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
      link: '/admin/orders',
    },
    {
      title: 'Active Customers',
      value: stats?.totalCustomers || 0,
      sub: 'Registered food lovers',
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: '/admin/customers',
    },
    {
      title: 'Pending in Kitchen',
      value: stats?.pendingOrders || 0,
      sub: 'Needing chef prep',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      link: '/admin/orders',
    },
  ];

  const secondaryCards = [
    {
      title: 'Menu Dishes',
      value: stats?.totalFoods || 0,
      sub: 'Active delicacies in catalog',
      icon: UtensilsCrossed,
      color: 'text-orange-400',
      link: '/admin/foods',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      sub: 'Organized menu sections',
      icon: FolderTree,
      color: 'text-teal-400',
      link: '/admin/categories',
    },
    {
      title: 'Table Bookings',
      value: stats?.totalReservations || 0,
      sub: `${stats?.pendingReservations || 0} pending confirmation`,
      icon: Calendar,
      color: 'text-sky-400',
      link: '/admin/reservations',
    },
    {
      title: 'Promotional Coupons',
      value: stats?.totalCoupons || 0,
      sub: 'Active marketing discount codes',
      icon: Tag,
      color: 'text-purple-400',
      link: '/admin/coupons',
    },
  ];

  return (
    <div className="space-y-8 text-stone-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2.5">
            <span>SwadGhar Real-time Operations</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            Live database telemetry for orders, revenue trends, customer reservations and inventory
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Metrics"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:shadow-glow transition-all"
          >
            Live Kitchen Queue
          </Link>
        </div>
      </div>

      {/* Primary Key Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {primaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <AnimatedContent key={idx} delay={idx * 0.05}>
              <SpotlightCard
                className={`p-5 rounded-3xl border ${card.bg} backdrop-blur-md space-y-3 h-full flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {card.title}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-stone-900/60 flex items-center justify-center border border-stone-800">
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-2xl sm:text-3xl font-bold font-sans text-white block">
                    <CountUp to={card.value} prefix={card.prefix || ''} duration={1.2} />
                  </span>
                  <span className="text-[11px] text-stone-400 block">{card.sub}</span>
                </div>
              </SpotlightCard>
            </AnimatedContent>
          );
        })}
      </div>

      {/* Secondary Metric Cards Grid (Total Dishes, Categories, Bookings, Coupons) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <AnimatedContent key={idx} delay={0.2 + idx * 0.05}>
              <Link
                to={card.link}
                className="p-4 rounded-2xl bg-stone-950 border border-stone-800/80 hover:border-brand-500/40 transition-all flex items-center justify-between group block"
              >
                <div className="space-y-1">
                  <span className="text-[11px] text-stone-400 font-semibold block">{card.title}</span>
                  <span className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">
                    <CountUp to={card.value} duration={1} />
                  </span>
                  <span className="text-[10px] text-stone-500 block truncate">{card.sub}</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center border border-stone-800 group-hover:scale-105 transition-transform">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </Link>
            </AnimatedContent>
          );
        })}
      </div>

      {/* Weekly Revenue & Volume Chart Preview */}
      <AnimatedContent delay={0.4}>
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <span>Last 7 Days Revenue & Volume Trend</span>
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">Dynamic Order Aggregation</span>
          </div>

          {/* Visual Bar Chart */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 pt-4 border-b border-stone-800 pb-2">
            {stats?.weeklyTrends?.map((item, idx) => {
              const maxRev = Math.max(...(stats.weeklyTrends.map((t) => t.revenue) || [1]), 1000);
              const heightPercent = Math.max(12, Math.min(100, (item.revenue / maxRev) * 100));

              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    ₹{item.revenue}
                  </span>
                  <div
                    className="w-full max-w-[40px] bg-gradient-to-t from-brand-600 via-amber-500 to-amber-400 rounded-xl group-hover:brightness-125 transition-all shadow-glow"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-stone-300 block">{item.day}</span>
                    <span className="text-[10px] text-stone-500 font-mono">{item.orders} ord</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AnimatedContent>

      {/* Recent Orders & Popular Dishes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <AnimatedContent delay={0.5}>
          <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                  <span>Recent Customer Orders</span>
                </h3>
                <Link
                  to="/admin/orders"
                  className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5 pt-3">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.map((ord) => (
                    <div
                      key={ord._id}
                      className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between text-xs hover:border-brand-500/30 transition-colors"
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
                  <p className="text-xs text-stone-500 py-4 text-center">No orders placed yet.</p>
                )}
              </div>
            </div>
          </div>
        </AnimatedContent>

        {/* Top Delicacies */}
        <AnimatedContent delay={0.6}>
          <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Top Rated Culinary Delicacies</span>
                </h3>
                <Link
                  to="/admin/foods"
                  className="text-xs font-bold text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>Manage Menu</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-2.5 pt-3">
                {stats?.popularFoods?.map((f, idx) => (
                  <div
                    key={f._id}
                    className="p-3 rounded-2xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between text-xs hover:border-brand-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center text-amber-400 font-mono font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <img
                        src={f.image}
                        alt={f.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-white">{f.name}</h4>
                        <span className="text-stone-400 text-[11px]">{f.category?.name || 'Signature'}</span>
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
        </AnimatedContent>
      </div>
    </div>
  );
};

export default AdminDashboard;
