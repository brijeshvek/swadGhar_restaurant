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
  ShieldCheck,
  FileSpreadsheet,
  PieChart,
  Download,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { CountUp, SpotlightCard, AnimatedContent } from '../../components/animations';
import ReportExportModal from '../../components/admin/ReportExportModal';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [dashboardPeriod, setDashboardPeriod] = useState('week');
  const [dashboardMetric, setDashboardMetric] = useState('revenue');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hoveredDashPoint, setHoveredDashPoint] = useState(null);

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
          {t('common.loading', 'Synchronizing SwadGhar Operations...')}
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
      title: isAdmin ? t('admin.totalRevenue', 'Total Revenue (All Branches)') : `${branchCity} ${t('admin.totalRevenue', 'Branch Revenue')}`,
      value: stats?.totalRevenue || 0,
      prefix: '₹',
      sub: `${t('periods.today', 'Today')}: ₹${stats?.todayRevenue || 0}`,
      icon: DollarSign,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20 shadow-glow',
      link: '/admin/orders',
    },
    {
      title: isAdmin ? t('admin.totalOrders', 'Total Orders') : `${branchCity} ${t('admin.totalOrders', 'Orders')}`,
      value: stats?.totalOrders || 0,
      sub: `${t('periods.today', 'Today')}: ${stats?.todayOrders || 0} ${t('admin.orders', 'orders')}`,
      icon: ShoppingBag,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
      link: '/admin/orders',
    },
    {
      title: isAdmin ? t('admin.activeDiners', 'Active Diners') : `${branchCity} ${t('admin.guestDiners', 'Guest Diners')}`,
      value: stats?.totalCustomers || 0,
      sub: t('admin.registeredFoodLovers', 'Registered food lovers'),
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      link: isAdmin ? '/admin/customers' : '/admin/reservations',
    },
    {
      title: t('admin.pendingOrders', 'Kitchen Queue'),
      value: stats?.pendingOrders || 0,
      sub: t('admin.activeCookingPrep', 'Active cooking & prep'),
      icon: Clock,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
      link: '/admin/orders',
    },
  ];

  const secondaryCards = [
    {
      title: t('navigation.menu', 'Menu Delicacies'),
      value: stats?.totalFoods || 0,
      sub: t('admin.activeDishesCatalog', 'Active dishes in catalog'),
      icon: UtensilsCrossed,
      color: 'text-orange-400',
      link: '/admin/foods',
    },
    {
      title: t('admin.categories', 'Categories'),
      value: stats?.totalCategories || 0,
      sub: t('admin.categoriesSub', 'Gujarati & Punjabi sections'),
      icon: FolderTree,
      color: 'text-teal-400',
      link: '/admin/categories',
    },
    {
      title: t('navigation.reservations', 'Table Bookings'),
      value: stats?.totalReservations || 0,
      sub: `${stats?.pendingReservations || 0} ${t('admin.pendingConfirmation', 'pending confirmation')}`,
      icon: Calendar,
      color: 'text-sky-400',
      link: '/admin/reservations',
    },
    isAdmin
      ? {
        title: t('admin.activeFranchises', '5 Franchises'),
        value: stats?.totalFranchises || 5,
        sub: 'Ahmedabad, Surat, Baroda, Rajkot, Mumbai',
        icon: Store,
        color: 'text-purple-400',
        link: '/admin/franchises',
      }
      : {
        title: `${branchCity} ${t('admin.staffStrength', 'Staff Team')}`,
        value: stats?.branchStaffCount || stats?.myBranch?.staffTeam?.length || 10,
        sub: t('admin.activeRoster', 'Active branch roster'),
        icon: ChefHat,
        color: 'text-purple-400',
        link: '/admin/franchises',
      },
  ];

  const filteredOrders = stats?.recentOrders?.filter((ord) => {
    if (orderFilter === 'pending' || orderFilter === 'active') {
      return ['pending', 'confirmed', 'preparing', 'ready', 'ready_for_pickup', 'out_for_delivery'].includes(ord.orderStatus);
    }
    if (orderFilter === 'completed' || orderFilter === 'delivered') {
      return ord.orderStatus === 'delivered' || ord.orderStatus === 'completed';
    }
    if (orderFilter === 'cancelled') {
      return ord.orderStatus === 'cancelled' || ord.orderStatus === 'rejected';
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
              {isAdmin ? t('admin.superAdminHq', 'Super Admin HQ') : `${t('admin.branchManagerDesk', 'Branch Manager Desk')} • ${branchCity}`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {isAdmin ? t('admin.dashboardTitle', 'Executive Restaurant Operations') : (stats?.branchName || `SwadGhar ${branchCity} Management`)}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400">
            {isAdmin
              ? t('admin.networkOverview', 'Real-time analytics for revenue, live kitchen stream, table reservations & all 5 branch networks')
              : `${t('admin.liveBranchOperations', 'Live branch operations, kitchen stream, staff team & guest reservations for')} ${branchCity}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title={t('admin.refreshMetrics', 'Refresh Live Metrics')}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
            <span>{refreshing ? t('common.updating', 'Updating...') : t('admin.refreshMetrics', 'Refresh')}</span>
          </button>

          <Link
            to="/admin/reports"
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>{isAdmin ? t('admin.franchiseReports', 'Franchise Reports') : t('admin.branchReports', 'Branch Reports')}</span>
          </Link>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={t('admin.downloadReport', 'Download Custom Statement')}
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('admin.downloadReport', 'Export Statement')}</span>
          </button>

          <Link
            to="/admin/foods"
            className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-brand-400" />
            <span>{t('admin.menuCatalog', 'Menu Catalog')}</span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:shadow-glow transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t('admin.liveKitchenDesk', 'Live Kitchen Desk')}</span>
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
                { city: 'Ahmedabad', area: 'SG Highway', managerName: 'Rajesh Patel', staffTeam: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
                { city: 'Surat', area: 'Ghod Dod Road', managerName: 'Ketan Vaghani', staffTeam: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
                { city: 'Vadodara', area: 'Alkapuri', managerName: 'Hardik Shah', staffTeam: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
                { city: 'Rajkot', area: 'Kalawad Road', managerName: 'Bhavesh Jadeja', staffTeam: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
                { city: 'Mumbai', area: 'Borivali West', managerName: 'Nitin Mehta', staffTeam: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
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

      {/* Franchise Sales & Operations Report Section */}
      <AnimatedContent delay={0.35}>
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
            <div>
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>{isAdmin ? t('admin.franchiseLeaderboard', '5 Franchises Sales & Performance Report') : `${branchCity} ${t('admin.branchReports', 'Branch Operational Statement')}`}</span>
              </h3>
              <p className="text-xs text-stone-400">
                {isAdmin
                  ? t('admin.networkOverview', 'Real-time revenue, order volume, AOV & staff metrics across all 5 franchise branches')
                  : t('admin.branchReportsSub', 'Your branch performance audit, revenue summary & kitchen fulfillment metrics')}
              </p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start sm:self-auto bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/20 transition-all"
            >
              <span>{isAdmin ? t('admin.viewFull5BranchReport', 'View Full 5-Branch Report & Export') : t('admin.viewFullBranchReport', 'View Full Branch Report')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-900/80 text-stone-400 uppercase text-[10px] font-bold border-b border-stone-800">
                <tr>
                  <th className="px-3.5 py-2.5">{t('admin.branchLocation', 'Branch Location')}</th>
                  <th className="px-3.5 py-2.5">{t('admin.generalManager', 'General Manager')}</th>
                  <th className="px-3.5 py-2.5 text-center">{t('admin.teamSize', 'Team Strength')}</th>
                  <th className="px-3.5 py-2.5 text-center">{t('admin.orders', 'Orders')}</th>
                  <th className="px-3.5 py-2.5 text-right">{t('admin.revenueINR', 'Gross Revenue')}</th>
                  <th className="px-3.5 py-2.5 text-right">{t('admin.aovINR', 'Avg Order (AOV)')}</th>
                  <th className="px-3.5 py-2.5 text-center">{t('admin.status', 'Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-medium">
                {(stats?.franchiseReports && stats.franchiseReports.length > 0 ? stats.franchiseReports : [
                  { name: 'SwadGhar - Ahmedabad Flagship', city: 'Ahmedabad', managerName: 'Rajesh Patel', staffCount: 10, totalOrders: stats?.totalOrders || 28, totalRevenue: stats?.totalRevenue || 45000, avgOrderValue: 1600 },
                ]).map((fran, idx) => (
                  <tr key={fran._id || idx} className="hover:bg-stone-900/40 transition-colors">
                    <td className="px-3.5 py-3">
                      <span className="font-bold text-white block text-sm">{fran.city} Branch</span>
                      <span className="text-[11px] text-stone-400 truncate block max-w-xs">{fran.name}</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="font-semibold text-stone-200 block">{fran.managerName}</span>
                      <span className="text-[10px] font-mono text-stone-500">{fran.managerEmail || fran.managerPhone}</span>
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-stone-900 text-amber-400 font-bold text-[11px] border border-stone-800">
                        {fran.staffCount || 9} Staff
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-center font-bold text-stone-200 font-mono">
                      {fran.totalOrders || 0}
                    </td>
                    <td className="px-3.5 py-3 text-right font-bold text-amber-400 font-sans text-sm">
                      ₹{(fran.totalRevenue || 0).toLocaleString()}
                    </td>
                    <td className="px-3.5 py-3 text-right font-mono text-stone-300">
                      ₹{fran.avgOrderValue || (fran.totalOrders > 0 ? Math.round(fran.totalRevenue / fran.totalOrders) : 0)}
                    </td>
                    <td className="px-3.5 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedContent>

      {/* Multi-Period Real Database Graphs: Two Separate Graphs for Revenue and Orders */}
      <AnimatedContent delay={0.4}>
        <div className="space-y-4">
          {/* Period Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-950 border border-stone-800">
            <div>
              <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span>
                  {isAdmin
                    ? `${t('admin.realPerformanceAnalytics', 'Live Real Database Analytics')} (${t(`periods.${dashboardPeriod}`, dashboardPeriod.toUpperCase())})`
                    : `${branchCity} ${t('admin.realPerformanceAnalytics', 'Real Live Analytics')} (${t(`periods.${dashboardPeriod}`, dashboardPeriod.toUpperCase())})`}
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                {t('admin.chartHoverHint', '100% Real-time database metrics for Revenue (₹) and Order Counts')}
              </p>
            </div>

            {/* Period Switcher Tabs */}
            <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
              {[
                { label: t('periods.today', 'Today'), value: 'today' },
                { label: t('periods.week', 'Week (7D)'), value: 'week' },
                { label: t('periods.month', 'Month'), value: 'month' },
                { label: t('periods.year', 'Year'), value: 'year' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setDashboardPeriod(tab.value)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    dashboardPeriod === tab.value
                      ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dual Graphs Grid: Left = Revenue Graph, Right = Order Volume Graph */}
          {(() => {
            const activeData = stats?.timelines?.[dashboardPeriod] || stats?.weeklyTrends || [];
            const maxRevenue = Math.max(...activeData.map((t) => t.revenue || 0), 1);
            const maxOrders = Math.max(...activeData.map((t) => t.orders || 0), 1);

            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. SEPARATE REVENUE GRAPH (₹) - SMOOTH LINE CHART */}
                <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {t('admin.revenueLineChart', 'Gross Revenue (₹ Line Chart)')} • {t(`periods.${dashboardPeriod}`, dashboardPeriod.toUpperCase())}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {t('common.total', 'Total')}: ₹{activeData.reduce((s, i) => s + (i.revenue || 0), 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Curvy Smooth SVG Line Chart with Responsive Hover Tooltips */}
                  <div className="h-52 w-full pt-1 relative">
                    {(() => {
                      const width = 500;
                      const height = 190;
                      const padX = 35;
                      const padY = 30;
                      const plotW = width - padX * 2;
                      const plotH = height - padY * 2 - 20;

                      const points = activeData.map((item, i) => {
                        const x = padX + (activeData.length > 1 ? (i / (activeData.length - 1)) * plotW : plotW / 2);
                        const val = item.revenue || 0;
                        const orders = item.orders || 0;
                        const y = padY + (1 - (maxRevenue > 0 ? val / maxRevenue : 0)) * plotH;
                        return { x, y, val, orders, label: item.label || item.day };
                      });

                      let linePath = '';
                      let areaPath = '';
                      const bottomY = padY + plotH;

                      if (points.length > 0) {
                        if (points.length === 1) {
                          linePath = `M ${points[0].x - 25} ${points[0].y} L ${points[0].x + 25} ${points[0].y}`;
                          areaPath = `M ${points[0].x - 25} ${points[0].y} L ${points[0].x + 25} ${points[0].y} L ${points[0].x + 25} ${bottomY} L ${points[0].x - 25} ${bottomY} Z`;
                        } else {
                          linePath = `M ${points[0].x} ${points[0].y}`;
                          for (let i = 0; i < points.length - 1; i++) {
                            const p0 = points[i];
                            const p1 = points[i + 1];
                            const cx = (p0.x + p1.x) / 2;
                            linePath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                          }
                          areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
                        }
                      }

                      const colWidth = points.length > 1 ? plotW / (points.length - 1) : plotW;

                      return (
                        <svg
                          viewBox="0 0 500 190"
                          className="w-full h-full overflow-visible select-none"
                          onMouseLeave={() => setHoveredDashPoint(null)}
                        >
                          <defs>
                            <linearGradient id="dashRevLineGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                              <stop offset="65%" stopColor="#d97706" stopOpacity="0.12" />
                              <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                            </linearGradient>
                            <linearGradient id="dashGuideGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                            </linearGradient>
                            <filter id="dashLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.55" />
                            </filter>
                            <filter id="dashTooltipShadow" x="-30%" y="-30%" width="160%" height="160%">
                              <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
                            </filter>
                          </defs>

                          {/* Grid Guide Lines */}
                          <line x1="30" y1="28" x2="470" y2="28" stroke="#292524" strokeDasharray="3 3" strokeWidth="1" />
                          <line x1="30" y1="78" x2="470" y2="78" stroke="#292524" strokeDasharray="3 3" strokeWidth="1" />
                          <line x1="30" y1={bottomY} x2="470" y2={bottomY} stroke="#292524" strokeWidth="1" />

                          {/* Area Under Curve */}
                          {areaPath && <path d={areaPath} fill="url(#dashRevLineGrad)" />}

                          {/* Line Path */}
                          {linePath && (
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              filter="url(#dashLineGlow)"
                            />
                          )}

                          {/* Points & Axis Labels */}
                          {points.map((pt, idx) => {
                            const isHovered = hoveredDashPoint === idx;
                            return (
                              <g key={idx}>
                                {/* Vertical Active Guide Line */}
                                {isHovered && (
                                  <line
                                    x1={pt.x}
                                    y1="20"
                                    x2={pt.x}
                                    y2={bottomY}
                                    stroke="url(#dashGuideGrad)"
                                    strokeWidth="1.5"
                                    strokeDasharray="3 3"
                                  />
                                )}

                                {/* Outer Glowing Halo when active */}
                                {isHovered && (
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={9}
                                    fill="#f59e0b"
                                    fillOpacity="0.25"
                                    stroke="#fbbf24"
                                    strokeWidth="1.5"
                                  />
                                )}

                                {/* Main Point Circle */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? 6 : pt.val > 0 ? 5 : 3.5}
                                  fill="#1c1917"
                                  stroke={isHovered ? '#fbbf24' : '#f59e0b'}
                                  strokeWidth={isHovered ? 3 : 2.5}
                                  className="transition-all duration-150"
                                />

                                {/* Inner Core Dot */}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? 3 : pt.val > 0 ? 2 : 1.5}
                                  fill={isHovered ? '#ffffff' : pt.val > 0 ? '#fbbf24' : '#78716c'}
                                />

                                {/* X Axis Labels */}
                                <text
                                  x={pt.x}
                                  y={bottomY + 16}
                                  textAnchor="middle"
                                  fill={isHovered ? '#fbbf24' : '#a8a29e'}
                                  fontSize="10"
                                  fontWeight={isHovered ? '700' : '600'}
                                  className="transition-colors"
                                >
                                  {pt.label}
                                </text>
                                <text
                                  x={pt.x}
                                  y={bottomY + 28}
                                  textAnchor="middle"
                                  fill={isHovered ? '#f59e0b' : '#78716c'}
                                  fontSize="8.5"
                                  fontFamily="monospace"
                                  fontWeight={isHovered ? '700' : 'normal'}
                                >
                                  ₹{pt.val > 1000 ? `${(pt.val / 1000).toFixed(1)}k` : pt.val}
                                </text>
                              </g>
                            );
                          })}

                          {/* Large Interactive Hover Hit Zones */}
                          {points.map((pt, idx) => (
                            <rect
                              key={`hit-${idx}`}
                              x={pt.x - colWidth / 2}
                              y={0}
                              width={colWidth}
                              height={height}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredDashPoint(idx)}
                            />
                          ))}

                          {/* Top-Layer Interactive Hover Tooltip Box */}
                          {hoveredDashPoint !== null && points[hoveredDashPoint] && (() => {
                            const pt = points[hoveredDashPoint];
                            const boxW = 104;
                            const boxH = 46;
                            const clampedX = Math.max(8, Math.min(width - boxW - 8, pt.x - boxW / 2));
                            const clampedY = pt.y > 60 ? pt.y - boxH - 10 : pt.y + 12;

                            return (
                              <g filter="url(#dashTooltipShadow)" className="pointer-events-none animate-fade-in">
                                {/* Card Background */}
                                <rect
                                  x={clampedX}
                                  y={clampedY}
                                  width={boxW}
                                  height={boxH}
                                  rx="8"
                                  fill="#0c0a09"
                                  stroke="#d97706"
                                  strokeWidth="1.2"
                                />

                                {/* Header: Slot/Day Label */}
                                <text
                                  x={clampedX + boxW / 2}
                                  y={clampedY + 13}
                                  textAnchor="middle"
                                  fill="#d6d3d1"
                                  fontSize="9"
                                  fontWeight="600"
                                >
                                  {pt.label}
                                </text>

                                {/* Revenue Amount */}
                                <text
                                  x={clampedX + boxW / 2}
                                  y={clampedY + 27}
                                  textAnchor="middle"
                                  fill="#fbbf24"
                                  fontSize="12"
                                  fontWeight="bold"
                                  fontFamily="monospace"
                                >
                                  ₹{pt.val.toLocaleString()}
                                </text>

                                {/* Orders count */}
                                <text
                                  x={clampedX + boxW / 2}
                                  y={clampedY + 39}
                                  textAnchor="middle"
                                  fill="#fdba74"
                                  fontSize="8.5"
                                  fontWeight="bold"
                                >
                                  {pt.orders} Orders Processed
                                </text>
                              </g>
                            );
                          })()}
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* 2. SEPARATE ORDER VOLUME GRAPH (Orders Pie Chart) */}
                <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-brand-400" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        {t('admin.ordersDistributionChart', 'Order Volume (Pie Chart)')} • {t(`periods.${dashboardPeriod}`, dashboardPeriod.toUpperCase())}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-brand-400">
                      {t('common.total', 'Total')}: {activeData.reduce((s, i) => s + (i.orders || 0), 0)} {t('admin.orders', 'Orders')}
                    </span>
                  </div>

                  {/* SVG Pie / Donut Chart with Breakdown Legend */}
                  <div className="h-52 w-full flex items-center justify-center pt-1">
                    {(() => {
                      const totalOrders = activeData.reduce((s, i) => s + (i.orders || 0), 0);
                      const palette = [
                        '#f97316', '#10b981', '#3b82f6', '#ec4899', '#eab308',
                        '#06b6d4', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1',
                        '#84cc16', '#a855f7'
                      ];

                      const nonZeroItems = activeData.filter((i) => (i.orders || 0) > 0);

                      if (totalOrders === 0 || nonZeroItems.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center w-full h-full text-center space-y-2">
                            <svg viewBox="0 0 160 160" className="w-24 h-24">
                              <circle cx="80" cy="80" r="56" fill="none" stroke="#292524" strokeWidth="18" />
                              <text x="80" y="76" textAnchor="middle" fill="#a8a29e" fontSize="13" fontWeight="bold">0</text>
                              <text x="80" y="90" textAnchor="middle" fill="#78716c" fontSize="8.5">{t('admin.orders', 'Orders')}</text>
                            </svg>
                            <span className="text-xs text-stone-500 font-medium">{t('admin.noOrderDistribution', 'No order distribution recorded in this period')}</span>
                          </div>
                        );
                      }

                      const cx = 80;
                      const cy = 80;
                      const outerR = 66;
                      const innerR = 40;
                      let cumulativeAngle = -Math.PI / 2;

                      const slices = nonZeroItems.map((item, idx) => {
                        const val = item.orders || 0;
                        const sliceAngle = (val / totalOrders) * 2 * Math.PI;
                        const startAngle = cumulativeAngle;
                        const endAngle = cumulativeAngle + sliceAngle;
                        cumulativeAngle = endAngle;

                        const x1 = cx + outerR * Math.cos(startAngle);
                        const y1 = cy + outerR * Math.sin(startAngle);
                        const x2 = cx + outerR * Math.cos(endAngle);
                        const y2 = cy + outerR * Math.sin(endAngle);

                        const x3 = cx + innerR * Math.cos(endAngle);
                        const y3 = cy + innerR * Math.sin(endAngle);
                        const x4 = cx + innerR * Math.cos(startAngle);
                        const y4 = cy + innerR * Math.sin(startAngle);

                        const largeArc = sliceAngle > Math.PI ? 1 : 0;
                        const color = palette[idx % palette.length];
                        const percent = Math.round((val / totalOrders) * 100);

                        let pathD = '';
                        if (nonZeroItems.length === 1) {
                          pathD = `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR} L ${cx - 0.01} ${cy - innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR} Z`;
                        } else {
                          pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
                        }

                        return {
                          ...item,
                          val,
                          color,
                          percent,
                          pathD,
                          label: item.label || item.day,
                        };
                      });

                      return (
                        <div className="flex flex-col sm:flex-row items-center justify-between w-full h-full gap-4">
                          {/* Pie / Donut SVG */}
                          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                            <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible">
                              <defs>
                                <filter id="dashPieGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f97316" floodOpacity="0.3" />
                                </filter>
                              </defs>
                              {slices.map((sl, sIdx) => (
                                <path
                                  key={sIdx}
                                  d={sl.pathD}
                                  fill={sl.color}
                                  stroke="#0c0a09"
                                  strokeWidth="2.5"
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                  filter="url(#dashPieGlow)"
                                >
                                  <title>{`${sl.label}: ${sl.val} orders (${sl.percent}%)`}</title>
                                </path>
                              ))}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                              <span className="text-base font-bold text-white font-mono">{totalOrders}</span>
                              <span className="text-[9px] text-stone-400 uppercase font-semibold">{t('admin.orders', 'Orders')}</span>
                            </div>
                          </div>

                          {/* Legend Breakdown */}
                          <div className="flex-1 w-full max-h-44 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                            {slices.map((sl, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-stone-900/70 border border-stone-800/80 hover:border-stone-700 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                    style={{ backgroundColor: sl.color }}
                                  ></span>
                                  <span className="text-stone-300 font-semibold truncate text-xs">{sl.label}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-bold text-white font-mono text-xs">{sl.val} ord</span>
                                  <span className="text-[10px] font-bold text-brand-300 font-mono bg-brand-950/80 border border-brand-800/50 px-1.5 py-0.5 rounded-md">
                                    {sl.percent}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })()}
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
                    {isAdmin ? t('admin.recentOrdersFeed', 'Live Order Stream') : `${branchCity} ${t('admin.recentOrdersFeed', 'Live Orders')}`}
                  </h3>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-[11px]">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'all' ? 'bg-amber-500 text-stone-900 shadow-sm' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {t('common.all', 'All')}
                  </button>
                  <button
                    onClick={() => setOrderFilter('active')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'active' || orderFilter === 'pending'
                        ? 'bg-amber-500 text-stone-900 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {t('admin.active', 'Active')}
                  </button>
                  <button
                    onClick={() => setOrderFilter('completed')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'completed' || orderFilter === 'delivered'
                        ? 'bg-emerald-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {t('admin.completed', 'Completed')}
                  </button>
                  <button
                    onClick={() => setOrderFilter('cancelled')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      orderFilter === 'cancelled'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {t('admin.cancelled', 'Cancelled')}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-3">
                {filteredOrders.length > 0 ? (
                  filteredOrders.slice(0, 8).map((ord) => (
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
                          ord.orderStatus === 'delivered' || ord.orderStatus === 'completed'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                            : ord.orderStatus === 'cancelled' || ord.orderStatus === 'rejected'
                            ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                            : ord.orderStatus === 'preparing'
                            ? 'bg-sky-950/80 text-sky-400 border-sky-800/80'
                            : 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 py-6 text-center">{t('admin.noOrdersMatchingFilter', `No orders matching '${orderFilter}' filter.`)}</p>
                )}
              </div>
            </div>

            <Link
              to="/admin/orders"
              className="w-full py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-center text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors block border border-stone-800 mt-3"
            >
              {t('admin.openLiveOrdersDesk', 'Open Live Orders Desk →')}
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
                  <span>{t('admin.topSellingDishes', 'Top Rated Culinary Delicacies')}</span>
                </h3>
                <Link
                  to="/admin/foods"
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>{t('navigation.menu', 'Manage Menu')}</span>
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
              {t('admin.browseCompleteMenu', 'Browse Complete Food Catalog →')}
            </Link>
          </div>
        </AnimatedContent>
      </div>

      {/* Interactive Custom PDF & CSV Statement Generator Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        user={user}
        isAdmin={isAdmin}
        branchCity={stats?.branchCity}
        preloadedData={stats}
      />
    </div>
  );
};

export default AdminDashboard;
