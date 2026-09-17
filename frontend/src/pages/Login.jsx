import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, ChefHat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showSuccess(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'staff') {
        navigate('/admin/orders');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo credentials auto-filler
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="SwadGhar Logo"
              className="w-16 h-16 rounded-full object-contain bg-white p-1 mx-auto shadow-glow border border-amber-500/30"
            />
          </Link>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            Sign In to SwadGhar
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Access your orders, saved addresses, and loyalty rewards
          </p>
        </div>

        {/* Demo Roles Quick Buttons */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block text-center">
            ⚡ 1-Click Demo Login
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillDemo('admin@swadghar.com', 'Admin@123')}
              className="py-1.5 px-2 rounded-xl bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('staff@swadghar.com', 'Staff@123')}
              className="py-1.5 px-2 rounded-xl bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <ChefHat className="w-3.5 h-3.5 text-amber-600" />
              <span>Staff</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('customer@gmail.com', 'Customer@123')}
              className="py-1.5 px-2 rounded-xl bg-white border border-amber-300 font-bold text-amber-900 hover:bg-amber-100 flex items-center justify-center gap-1 shadow-sm transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Customer</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-stone-500 pt-2">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
