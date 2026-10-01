import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  ShoppingBag,
  Calendar,
  Users,
  Star,
  Tag,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  ExternalLink,
  MessageSquare,
  Store,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import LanguageSelector from '../components/common/LanguageSelector';

const AdminLayout = () => {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navSections = [
    {
      items: [
        {
          name: isAdmin
            ? t('adminNav.executiveDashboard', 'Executive Dashboard')
            : t('adminNav.branchDashboard', 'Branch Dashboard'),
          path: '/admin/dashboard',
          icon: LayoutDashboard,
          adminOnly: false,
        },
        {
          name: isAdmin
            ? t('adminNav.franchises', 'Outlets & Franchises')
            : t('adminNav.myBranch', 'My Branch & Staff'),
          path: '/admin/franchises',
          icon: Store,
          adminOnly: false,
        },
        {
          name: isAdmin
            ? t('adminNav.reports', 'Sales & Audit Reports')
            : t('adminNav.branchReports', 'Branch Sales Report'),
          path: '/admin/reports',
          icon: FileSpreadsheet,
          adminOnly: false,
        },
        {
          name: t('adminNav.liveOrders', 'Live Orders & Kitchen'),
          path: '/admin/orders',
          icon: ShoppingBag,
          adminOnly: false,
        },
        {
          name: t('adminNav.reservations', 'Table Bookings'),
          path: '/admin/reservations',
          icon: Calendar,
          adminOnly: false,
        },
        {
          name: t('adminNav.inquiries', 'Customer Inquiries'),
          path: '/admin/inquiries',
          icon: MessageSquare,
          adminOnly: false,
        },
        {
          name: t('adminNav.foodMenu', 'Food Menu Catalog'),
          path: '/admin/foods',
          icon: UtensilsCrossed,
          adminOnly: false,
        },
        {
          name: t('adminNav.categories', 'Menu Categories'),
          path: '/admin/categories',
          icon: FolderTree,
          adminOnly: true,
        },
        {
          name: t('adminNav.customers', 'Customer Accounts'),
          path: '/admin/customers',
          icon: Users,
          adminOnly: true,
        },
        {
          name: t('adminNav.reviews', 'Guest Reviews'),
          path: '/admin/reviews',
          icon: Star,
          adminOnly: true,
        },
        {
          name: t('adminNav.coupons', 'Coupons & Offers'),
          path: '/admin/coupons',
          icon: Tag,
          adminOnly: true,
        },
        {
          name: t('adminNav.settings', 'Restaurant Settings'),
          path: '/admin/settings',
          icon: Settings,
          adminOnly: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-950 border-b border-stone-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="SwadGhar"
            className="w-9 h-9 rounded-full object-contain bg-white p-0.5 border border-amber-500/40 shadow-sm"
          />
          <span className="font-serif font-bold text-lg text-white">
            {t('brand.name')} {isAdmin ? t('nav.adminPanel') : t('nav.staffPanel')}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-stone-800 text-stone-300 cursor-pointer"
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Full-Height Sidebar (Always fits in viewport with pinned bottom) */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 w-64 bg-stone-950 border-r border-stone-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800/80 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 group"
          >
            <img
              src="/logo.png"
              alt="SwadGhar"
              className="w-10 h-10 rounded-full object-contain bg-white p-0.5 border border-amber-500/40 shadow-glow group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="truncate">
              <span className="text-lg font-serif font-bold text-gradient block leading-none">
                {t('brand.name')}
              </span>
              <span className="text-[10px] tracking-widest text-amber-400 font-bold uppercase block mt-1">
                {isAdmin ? t('nav.adminPanel') : t('nav.staffPanel')}
              </span>
            </div>
          </Link>
        </div>

        {/* Language Selector Pill Bar in Sidebar */}
        <div className="px-3 pt-2 shrink-0">
          <LanguageSelector variant="pills" />
        </div>

        {/* Navigation Links (Scrolls internally if screen is very short, never scrolls entire page) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 custom-scrollbar">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.adminOnly || (item.adminOnly && isAdmin)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">

                <nav className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${isActive
                            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-bold'
                            : 'text-stone-400 hover:text-white hover:bg-stone-900'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0 text-amber-400/90" />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* User Info & Bottom Controls (Strictly Pinned at Viewport Bottom) */}
        <div className="p-3.5 border-t border-stone-800 space-y-2.5 bg-stone-950 shrink-0">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-stone-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{t('nav.home')} ({t('brand.name')})</span>
            </span>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-brand-500/40 shrink-0"
              />
              <div className="truncate text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold truncate">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-stone-900 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 bg-stone-900 min-h-screen p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
