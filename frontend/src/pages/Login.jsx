import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      showSuccess(`Welcome back, ${user.name}!`);

      // Role-wise intelligent redirection
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'staff') {
        navigate('/admin/orders', { replace: true });
      } else {
        // Customer
        if (from && from !== '/login' && from !== '/register') {
          navigate(from, { replace: true });
        } else {
          navigate('/profile', { replace: true });
        }
      }
    } catch (err) {
      showError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-stone-50/40">
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
            Enter your email and password to access your role-based portal
          </p>
        </div>

        {/* Standard Clean Login Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-5"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          <p className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline">
              Create Account
            </Link>
          </p>
        </form>

        {/* Optional Collapsible Credentials Reference */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="w-full px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Reference Login Credentials (CREDENTIALS.md)</span>
            </span>
            {showHelper ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </button>

          {showHelper && (
            <div className="p-4 bg-stone-50/70 border-t border-stone-100 text-xs space-y-3">
              <div>
                <p className="font-bold text-stone-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                  <span>Admin Superadmin:</span>
                </p>
                <p className="font-mono text-[11px] text-stone-600 mt-0.5">
                  admin@swadghar.com / Admin@123 &rarr; Dashboard
                </p>
              </div>

              <div className="pt-2 border-t border-stone-200/60">
                <p className="font-bold text-stone-900">🏪 5 Franchise Managers (Staff):</p>
                <ul className="mt-1 space-y-1 font-mono text-[11px] text-stone-600">
                  <li>• Ahmedabad: ahmedabad.manager@swadghar.com / AHMStaff@123</li>
                  <li>• Surat: surat.manager@swadghar.com / SURStaff@123</li>
                  <li>• Vadodara: vadodara.manager@swadghar.com / VADStaff@123</li>
                  <li>• Rajkot: rajkot.manager@swadghar.com / RAJStaff@123</li>
                  <li>• Mumbai: mumbai.manager@swadghar.com / MUMStaff@123</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-stone-200/60">
                <p className="font-bold text-stone-900">👤 5 Customers:</p>
                <ul className="mt-1 space-y-1 font-mono text-[11px] text-stone-600">
                  <li>• Ahmedabad: customer@gmail.com / Customer@123</li>
                  <li>• Surat: priya.patel@gmail.com / Priya@123</li>
                  <li>• Vadodara: rohan.desai@gmail.com / Rohan@123</li>
                  <li>• Rajkot: anjali.jadeja@gmail.com / Anjali@123</li>
                  <li>• Mumbai: vikram.mehta@gmail.com / Vikram@123</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Login;

