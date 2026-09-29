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
  RotateCcw,
  Store,
  ChefHat,
  Plus,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CountUp, SpotlightCard, AnimatedContent } from '../../components/animations';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const statsRes = await api.get('/admin/dashboard-stats', { cache: false });
      if (statsRes?.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
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
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-amber-400 text-xs tracking-wider uppercase font-bold">
          Synchronizing SwadGhar Operations...
        </p>
      </div>
    );
  }

  // Branch info for Staff / Branch Manager
  const branchCity = stats?.branchCity || (user?.name?.includes('(')
    ? user.name.split('(')[1].replace(')', '')
    : (user?.role === 'staff' ? 'Branch' : 'Central'));

  const primaryCards = [
    {
      title: isAdmin ? 'Total Revenue (All Branches)' : `${branchCity} Branch Revenue`,
      value: stats?.totalRevenue || 0,
      prefix: '₹',
      sub: `Today: ₹${stats?.todayRevenue || 0}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20 shadow-glow',
      link: '/admin/orders',
    },
    {
      title: isAdmin ? 'Total Orders' : `${branchCity} Orders`,
      value: stats?.totalOrders || 0,
      sub: `Today: ${stats?.todayOrders || 0} orders`,
      icon: ShoppingBag,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
      link: '/admin/orders',
    },
    {
      title: isAdmin ? 'Active Diners' : `${branchCity} Guest Diners`,
      value: stats?.totalCustomers || 0,
      sub: 'Registered food lovers',
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: isAdmin ? '/admin/customers' : '/admin/reservations',
    },
    {
      title: 'Kitchen Queue',
      value: stats?.pendingOrders || 0,
      sub: 'Active cooking & prep',
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      link: '/admin/orders',
    },
  ];

  const secondaryCards = [
    {
      title: 'Menu Delicacies',
      value: stats?.totalFoods || 0,
      sub: 'Active dishes in catalog',
      icon: UtensilsCrossed,
      color: 'text-orange-400',
      link: '/admin/foods',
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      sub: 'Gujarati & Punjabi sections',
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
    isAdmin
      ? {
          title: '5 Franchises',
          value: stats?.totalFranchises || 5,
          sub: 'Ahmedabad, Surat, Baroda, Rajkot, Mumbai',
          icon: Store,
          color: 'text-purple-400',
          link: '/admin/franchises',
        }
      : {
          title: `${branchCity} Staff Team`,
          value: stats?.branchStaffCount || stats?.myBranch?.staffTeam?.length || 10,
          sub: 'Active branch roster',
          icon: ChefHat,
          color: 'text-purple-400',
          link: '/admin/franchises',
        },
  ];

  const filteredOrders = stats?.recentOrders?.filter((ord) => {
    if (orderFilter === 'pending') {
      return ['pending', 'confirmed', 'preparing'].includes(ord.orderStatus);
    }
    if (orderFilter === 'delivered') {
      return ord.orderStatus === 'delivered';
    }
    return true;
  }) || [];

  return (
    <div className="space-y-8 text-stone-100 max-w-7xl mx-auto">
      {/* Top Banner & Context Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {isAdmin ? 'Super Admin HQ' : `Branch Manager Desk • ${branchCity}`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {isAdmin ? 'Executive Restaurant Operations' : (stats?.branchName || `SwadGhar ${branchCity} Management`)}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            {isAdmin
              ? 'Real-time analytics for revenue, live kitchen stream, table reservations & all 5 branch networks'
              : `Live branch operations, kitchen stream, staff team & guest reservations for ${branchCity}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Refresh Live Metrics"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>

          <Link
            to="/admin/foods"
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-brand-400" />
            <span>Menu Catalog</span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:shadow-glow transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Live Kitchen Desk</span>
          </Link>
        </div>
      </div>

      {/* Primary Metric Cards Grid */}
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

      {/* Secondary Operational Quick-Access Cards */}
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

      {/* Franchise Section: All 5 Franchises for Superadmin OR Single Branch Card for Branch Manager */}
      {isAdmin ? (
        <AnimatedContent delay={0.3}>
          <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>5 Dedicated Restaurant Franchises</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Live branch management, floor managers & executive chef teams
                </p>
              </div>
              <Link
                to="/admin/franchises"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Manage Branches & Staff</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
              {(stats?.franchises && stats.franchises.length > 0 ? stats.franchises : [
                { city: 'Ahmedabad', area: 'SG Highway', managerName: 'Rajesh Patel', staffTeam: [1,2,3,4,5,6,7,8,9] },
                { city: 'Surat', area: 'Ghod Dod Road', managerName: 'Ketan Vaghani', staffTeam: [1,2,3,4,5,6,7,8,9] },
                { city: 'Vadodara', area: 'Alkapuri', managerName: 'Hardik Shah', staffTeam: [1,2,3,4,5,6,7,8,9] },
                { city: 'Rajkot', area: 'Kalawad Road', managerName: 'Bhavesh Jadeja', staffTeam: [1,2,3,4,5,6,7,8,9] },
                { city: 'Mumbai', area: 'Borivali West', managerName: 'Nitin Mehta', staffTeam: [1,2,3,4,5,6,7,8,9] },
              ]).map((b, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 hover:border-amber-500/40 transition-all space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{b.city}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Open
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block truncate">{b.name || `${b.city} Branch`}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-stone-300 pt-1 border-t border-stone-800/80">
                    <div className="flex items-center justify-between text-stone-400 text-[10px]">
                      <span>Manager:</span>
                      <span className="font-semibold text-stone-200 truncate">{b.managerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-stone-400 text-[10px]">
                      <span>Team:</span>
                      <span className="font-bold text-amber-400">{b.staffTeam?.length || 9} Staff</span>
                    </div>
                  </div>

                  <Link
                    to="/admin/franchises"
                    className="w-full py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-center text-[10px] font-bold text-stone-300 hover:text-white transition-colors block"
                  >
                    View Team Roster
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </AnimatedContent>
      ) : (
        /* Single Branch Operational Overview for Branch Manager */
        <AnimatedContent delay={0.3}>
          <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>{stats?.myBranch?.name || `${branchCity} Branch Information`}</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Your designated location details, seating capacity & team roster
                </p>
              </div>
              <Link
                to="/admin/franchises"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <span>Manage Branch Staff ({stats?.myBranch?.staffTeam?.length || 0})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Branch Location</span>
                <p className="text-xs text-stone-200 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{stats?.myBranch?.address || `${branchCity}, Gujarat`}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2">
                <span className="text-[10px] text-stone-400 uppercase font-bold block">Capacity & Service Type</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{stats?.myBranch?.branchType || 'Family Dining'}</span>
                  <span className="text-xs text-amber-400 font-semibold">{stats?.myBranch?.seatingCapacity || 120} Seats</span>
                </div>
                <p className="text-[11px] text-stone-400">{stats?.myBranch?.timings || '11:00 AM - 11:30 PM'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">Branch Manager Contact</span>
                  <span className="text-xs font-bold text-white block">{stats?.myBranch?.managerName || user?.name}</span>
                  <span className="text-[11px] text-stone-400 font-mono">{stats?.myBranch?.phone || stats?.myBranch?.managerPhone || '+91 98250 11234'}</span>
                </div>
                <Link
                  to="/admin/franchises"
                  className="w-full py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-center text-xs font-bold transition-all block mt-2"
                >
                  Manage Branch Staff Team →
                </Link>
              </div>
            </div>
          </div>
        </AnimatedContent>
      )}

      {/* Weekly Revenue & Volume Chart Preview */}
      <AnimatedContent delay={0.4}>
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <span>{isAdmin ? '7 Days Revenue & Volume Trend (All Branches)' : `Last 7 Days Trend • ${branchCity} Branch`}</span>
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
        {/* Recent Orders Queue */}
        <AnimatedContent delay={0.5}>
          <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800/80">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                  <h3 className="text-base font-serif font-bold text-white">
                    {isAdmin ? 'Live Order Stream' : `${branchCity} Live Orders`}
                  </h3>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-[11px]">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'all' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setOrderFilter('pending')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'pending' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setOrderFilter('delivered')}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'delivered' ? 'bg-amber-500 text-stone-900' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Delivered
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-3">
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 6).map((ord) => (
                    <div
                      key={ord._id}
                      className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between text-xs hover:border-brand-500/30 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-stone-300 font-semibold">{ord.customer?.name || 'Customer'}</span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {ord.items?.length || 0} item(s) • ₹{ord.pricing?.total} • {ord.paymentInfo?.method || 'UPI'}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] border ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : ord.orderStatus === 'preparing'
                            ? 'bg-sky-950 text-sky-400 border-sky-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 py-6 text-center">No orders matching filter.</p>
                )}
              </div>
            </div>

            <Link
              to="/admin/orders"
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-center text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors block border border-stone-800 mt-3"
            >
              Open Live Orders Desk →
            </Link>
          </div>
        </AnimatedContent>

        {/* Top Delicacies Leaderboard */}
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
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
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
                        loading="lazy"
                      />
                      <div>
                        <h4 className="font-bold text-white line-clamp-1">{f.name}</h4>
                        <span className="text-stone-400 text-[11px]">
                          ₹{f.discountPrice > 0 ? f.discountPrice : f.price} • {f.category?.name || 'Signature'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-amber-400 flex items-center justify-end gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {f.rating?.toFixed(1) || '4.9'}
                      </span>
                      <span className="text-[10px] text-stone-500">{f.numReviews || 0} reviews</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/admin/foods"
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-center text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors block border border-stone-800 mt-3"
            >
              Browse Complete Food Catalog →
            </Link>
          </div>
        </AnimatedContent>
      </div>
    </div>
  );
};

export default AdminDashboard;
