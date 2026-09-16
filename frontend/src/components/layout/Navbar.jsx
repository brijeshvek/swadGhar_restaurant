import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStaff, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Table Reservation', path: '/reservations' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-stone-900/90 backdrop-blur-md border-b border-stone-800/80 shadow-lg py-3.5'
          : 'bg-stone-900/70 backdrop-blur-sm py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-serif font-bold text-gradient tracking-tight block leading-none">
              SwadGhar
            </span>
            <span className="text-[10px] tracking-widest text-amber-400 font-semibold uppercase block">
              Pure Taste & Heritage
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? 'text-brand-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500 after:rounded-full'
                    : 'text-stone-300 hover:text-brand-400'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Icons: Cart & Auth */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-200 hover:text-brand-400 transition-all border border-stone-700/50"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-brand-500 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* User Auth Dropdown */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-stone-800/90 border border-stone-700 hover:border-brand-500/50 transition-all text-stone-200"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-brand-500/40"
                />
                <span className="hidden sm:inline text-xs font-semibold max-w-[90px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-bold hidden md:inline">
                  {user.role}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl py-2 z-50 animate-fade-in text-stone-200"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-stone-800">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-stone-800 text-brand-400 hover:text-brand-300 font-medium transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  {isStaff && !isAdmin && (
                    <Link
                      to="/admin/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-stone-800 text-brand-400 font-medium transition-colors"
                    >
                      <ChefHat className="w-4 h-4" />
                      Staff Order Portal
                    </Link>
                  )}

                  <Link
                    to="/my-orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-stone-800 transition-colors"
                  >
                    <Receipt className="w-4 h-4 text-stone-400" />
                    My Orders
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-stone-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-stone-400" />
                    My Profile
                  </Link>

                  <div className="border-t border-stone-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/reservations"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all hover:shadow-glow"
              >
                <Calendar className="w-4 h-4" />
                Book Table
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-stone-900 border-b border-stone-800 px-6 py-6 space-y-4 animate-fade-in shadow-2xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base font-medium py-1.5 transition-colors ${
                    isActive ? 'text-brand-400 font-bold' : 'text-stone-300'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-stone-800 flex flex-col gap-3">
            <Link
              to="/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-center font-semibold text-sm shadow-md"
            >
              Book a Table
            </Link>

            {!isAuthenticated && (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-800 text-stone-200 text-center text-sm font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-stone-800 text-stone-200 text-center text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
