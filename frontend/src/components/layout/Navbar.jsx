import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  User,
  Menu as MenuIcon,
  X,
  LogOut,
  Calendar,
  LayoutDashboard,
  ChefHat,
  Receipt,
  Heart,
  PhoneCall,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTranslation } from '../../context/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sticky header scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: t('nav.home', 'Home'), path: '/' },
    { name: t('nav.menu', 'Menu'), path: '/menu' },
    { name: t('nav.reservations', 'Reservations'), path: '/reservations' },
    { name: t('nav.franchise', 'Franchise'), path: '/franchise' },
    { name: t('nav.gallery', 'Gallery'), path: '/gallery' },
    { name: t('nav.about', 'About Us'), path: '/about' },
    { name: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300">
      
      {/* 1. Top Announcement / Heritage Strip */}
      <div
        className={`bg-stone-950 text-stone-300 text-[11px] sm:text-xs transition-all duration-300 overflow-hidden border-b border-amber-500/20 ${
          scrolled ? 'max-h-0 opacity-0 py-0' : 'max-h-10 opacity-100 py-1.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Pure Veg & Heritage Tag */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Pure Veg</span>
            </span>
            <span className="text-stone-600 hidden md:inline">•</span>
            <span className="text-stone-400 hidden md:inline text-[11px]">
              Authentic Gujarati & Kathiyawadi Heritage Fine Dining
            </span>
          </div>

          {/* Right: Hours & Hotline */}
          <div className="flex items-center gap-4 text-[11px] text-stone-400">
            <div className="hidden sm:flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>11:00 AM – 11:30 PM</span>
            </div>
            <a
              href="tel:+919876500000"
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>+91 98765 00000</span>
            </a>
          </div>

        </div>
      </div>

      {/* 2. Main Luxury Sticky Navbar */}
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-stone-900/95 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl py-2 sm:py-2.5'
            : 'bg-stone-900/90 backdrop-blur-md border-b border-stone-800 py-3 sm:py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Tagline */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="relative shrink-0">
              <img
                src="/logo.png"
                alt="SwadGhar Restaurant Logo"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-contain bg-white p-0.5 shadow-glow border border-amber-500/50 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-stone-900" />
            </div>

            <div className="shrink-0">
              <span className="text-xl sm:text-2xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-100 to-amber-400 tracking-tight block leading-none">
                {t('brand.name', 'SwadGhar')}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-amber-400 font-semibold uppercase block mt-0.5 font-sans whitespace-nowrap">
                {t('brand.tagline', 'Good Food ❤️ Happy People')}
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (Capsule) */}
          <nav className="hidden xl:flex items-center gap-1 bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800 shadow-inner shrink-0">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap inline-flex items-center ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold shadow-md shadow-amber-500/20'
                      : 'text-stone-300 hover:text-white hover:bg-stone-850'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Compact Nav for lg screens (1024px - 1280px) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-0.5 bg-stone-950/80 p-1 rounded-2xl border border-stone-800 shadow-inner shrink-0">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap inline-flex items-center ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold shadow-md'
                      : 'text-stone-300 hover:text-white hover:bg-stone-850'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right: Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Language Switcher */}
            <div className="hidden sm:block shrink-0">
              <LanguageSelector />
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-750 text-stone-200 hover:text-amber-400 transition-all border border-stone-700/80 hover:border-amber-500/50 shadow-sm shrink-0 active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 min-w-[19px] h-4.5 rounded-full bg-gradient-to-r from-brand-600 to-amber-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg border-2 border-stone-900 animate-bounce leading-none">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Table Reservation Button (Desktop CTA) */}
            <Link
              to="/reservations"
              className="hidden 2xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-amber-600 to-amber-500 hover:from-brand-500 hover:to-amber-400 active:scale-95 text-white text-xs font-bold shadow-md hover:shadow-glow transition-all border border-amber-400/20 shrink-0 whitespace-nowrap"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{t('home.bookTableBtn', 'Book Table')}</span>
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:pl-2 sm:pr-3 rounded-full sm:rounded-xl bg-stone-800/90 hover:bg-stone-750 border border-stone-700 hover:border-amber-500/60 transition-all text-stone-200 cursor-pointer shadow-md shrink-0 group active:scale-95"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full sm:rounded-lg object-cover border border-amber-500/50 group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-900" />
                  </div>

                  <div className="hidden sm:block text-left leading-tight shrink-0">
                    <span className="text-xs font-bold text-white block max-w-[90px] truncate">
                      {user.name?.split(' ')[0] || 'Member'}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold block capitalize leading-none mt-0.5">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 shrink-0 ${userDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                </button>

                {/* Dropdown Menu Card */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-2.5 w-72 rounded-2xl bg-[#1c1917] border border-stone-700 shadow-2xl overflow-hidden z-[999] text-stone-200 divide-y divide-stone-800 animate-fade-in"
                  >
                    {/* User Header Profile Card */}
                    <div className="p-4 bg-[#141210] space-y-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={user.name}
                          className="w-10 h-10 rounded-xl object-cover border border-amber-500/50 shrink-0 shadow-sm"
                        />
                        <div className="overflow-hidden min-w-0 flex-1">
                          <p className="text-sm font-bold text-white truncate leading-snug">{user.name}</p>
                          <p className="text-xs text-stone-400 truncate mt-0.5 font-mono">{user.email || user.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase tracking-wider text-[10px]">
                          {user.role === 'admin' ? '👑 Superadmin' : user.role === 'staff' ? '🏪 Staff Desk' : '🍽️ Diner Member'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Active Member</span>
                        </span>
                      </div>
                    </div>

                    {/* Navigation Menu Items */}
                    <div className="p-2 space-y-0.5 text-xs bg-[#1c1917]">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-stone-800 font-bold transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>{t('nav.dashboard', 'Admin Dashboard')}</span>
                        </Link>
                      )}

                      {isStaff && !isAdmin && (
                        <Link
                          to="/admin/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-amber-400 hover:text-amber-300 hover:bg-stone-800 font-bold transition-colors"
                        >
                          <ChefHat className="w-4 h-4 shrink-0" />
                          <span>{t('nav.staffPanel', 'Kitchen Orders Desk')}</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800 font-medium transition-colors"
                      >
                        <User className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{t('nav.profile', 'My Profile & Addresses')}</span>
                      </Link>

                      <Link
                        to="/my-orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800 font-medium transition-colors"
                      >
                        <Receipt className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{t('nav.myOrders', 'My Orders History')}</span>
                      </Link>

                      <Link
                        to="/reservations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-200 hover:text-white hover:bg-stone-800 font-medium transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{t('nav.reservations', 'Book / View Tables')}</span>
                      </Link>
                    </div>

                    {/* Sign Out Footer */}
                    <div className="p-2 bg-[#141210]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 font-bold transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>{t('nav.logout', 'Sign Out')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-800 transition-colors whitespace-nowrap"
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-extrabold transition-all shadow-sm whitespace-nowrap active:scale-95"
                >
                  {t('nav.register', 'Register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors border border-stone-700 cursor-pointer shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <MenuIcon className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-950 border-b border-amber-500/30 px-5 py-6 space-y-5 animate-fade-in shadow-2xl backdrop-blur-2xl">
          
          {/* Mobile Language Switcher */}
          <div className="p-3 bg-stone-900 rounded-2xl border border-stone-800 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('nav.language', 'Language')} / ભાષા:</span>
            </span>
            <LanguageSelector variant="pills" />
          </div>

          {/* Navigation Grid */}
          <nav className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold shadow-md'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-850 hover:text-white border border-stone-800'
                  }`
                }
              >
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Mobile CTA */}
          <div className="pt-2 border-t border-stone-800 space-y-2.5">
            <Link
              to="/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-amber-600 to-amber-500 text-white text-center font-bold text-xs shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('home.bookTableBtn', 'Reserve Royal Table')}</span>
            </Link>

            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-stone-900 text-stone-200 hover:text-white border border-stone-800 text-center text-xs font-bold whitespace-nowrap"
                >
                  {t('nav.login', 'Sign In')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-center text-xs font-extrabold whitespace-nowrap"
                >
                  {t('nav.register', 'Register')}
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between text-xs whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div>
                    <span className="font-bold text-white block">{user.name}</span>
                    <span className="text-[10px] text-amber-400 capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-400 font-bold hover:underline cursor-pointer"
                >
                  {t('nav.logout', 'Sign Out')}
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;
