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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, adminOnly: true },
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingBag, adminOnly: false },
    { name: 'Customer Inquiries', path: '/admin/inquiries', icon: MessageSquare, adminOnly: false },
    { name: 'Food Dishes', path: '/admin/foods', icon: UtensilsCrossed, adminOnly: false },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree, adminOnly: true },
    { name: 'Table Reservations', path: '/admin/reservations', icon: Calendar, adminOnly: false },
    { name: 'Customers', path: '/admin/customers', icon: Users, adminOnly: true },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star, adminOnly: true },
    { name: 'Coupons & Offers', path: '/admin/coupons', icon: Tag, adminOnly: true },
    { name: 'Store Settings', path: '/admin/settings', icon: Settings, adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-stone-950 border-b border-stone-800 p-4 flex items-center justify-between">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="SwadGhar"
            className="w-9 h-9 rounded-full object-contain bg-white p-0.5 border border-amber-500/40 shadow-sm"
          />
          <span className="font-serif font-bold text-lg text-white">
            SwadGhar {isAdmin ? 'Admin' : 'Staff'}
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-stone-800 text-stone-300"
          aria-label="Toggle admin sidebar"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-stone-950 border-r border-stone-800 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 pb-4 border-b border-stone-800/80 group"
          >
            <img
              src="/logo.png"
              alt="SwadGhar"
              className="w-11 h-11 rounded-full object-contain bg-white p-0.5 border border-amber-500/40 shadow-glow group-hover:scale-105 transition-transform"
            />
            <div>
              <span className="text-xl font-serif font-bold text-gradient block leading-none">
                SwadGhar
              </span>
              <span className="text-[10px] tracking-widest text-amber-400 font-bold uppercase block mt-1">
                {isAdmin ? 'Admin Portal' : 'Staff Kitchen Desk'}
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'text-stone-400 hover:text-white hover:bg-stone-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Bottom Controls */}
        <div className="p-4 border-t border-stone-800 space-y-3 bg-stone-950/60">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-xs font-semibold text-stone-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
              <span>Customer Website</span>
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-brand-500/40"
              />
              <div className="truncate text-left">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-stone-900 hover:bg-rose-500/20 text-stone-400 hover:text-rose-400 transition-colors"
              title="Sign Out"
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
