import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  ChefHat,
  Store,
  Sparkles,
  MapPin,
  Check,
  Copy,
  ChevronDown,
  LogIn,
  KeyRound,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

// All credentials data categorized
const DEMO_ACCOUNTS = {
  admin: [
    {
      name: 'Central Super Admin',
      email: 'admin@swadghar.com',
      password: 'Admin@123',
      role: 'admin',
      badge: 'Superadmin',
      location: 'Central Head Office',
      desc: 'Full access to all 5 franchises, 171 dishes, 31 categories, orders, reservations & analytics'
    }
  ],
  franchises: [
    {
      branch: 'Ahmedabad Flagship',
      location: 'SG Highway, Bodakdev',
      city: 'Ahmedabad',
      manager: {
        name: 'Rajesh Patel',
        email: 'ahmedabad.manager@swadghar.com',
        password: 'AHMStaff@123',
        designation: 'General Branch Manager'
      },
      staff: [
        { name: 'Mukesh Maharaj', email: 'ahmedabad.chef@swadghar.com', password: 'AHMStaff@123', designation: 'Executive Head Chef (Kathiyawadi)' },
        { name: 'Harish Joshi', email: 'ahmedabad.farsan@swadghar.com', password: 'AHMStaff@123', designation: 'Master Farsan & Sweets Chef' },
        { name: 'Vikram Singh', email: 'ahmedabad.tandoor@swadghar.com', password: 'AHMStaff@123', designation: 'Royal Tandoor & Punjabi Master' },
        { name: 'Pooja Solanki', email: 'ahmedabad.cashier@swadghar.com', password: 'AHMStaff@123', designation: 'Front Desk & Billing Executive' },
        { name: 'Dhaval Dave', email: 'ahmedabad.captain@swadghar.com', password: 'AHMStaff@123', designation: 'Senior Floor Captain' }
      ]
    },
    {
      branch: 'Surat Diamond City',
      location: 'Ghod Dod Road, Athwa',
      city: 'Surat',
      manager: {
        name: 'Ketan Vaghani',
        email: 'surat.manager@swadghar.com',
        password: 'SURStaff@123',
        designation: 'General Branch Manager'
      },
      staff: [
        { name: 'Pravin Maharaj', email: 'surat.chef@swadghar.com', password: 'SURStaff@123', designation: 'Executive Head Chef (Surti Specials)' },
        { name: 'Bhupat Solanki', email: 'surat.farsan@swadghar.com', password: 'SURStaff@123', designation: 'Surti Locho & Farsan Craftsman' },
        { name: 'Gurpreet Singh', email: 'surat.tandoor@swadghar.com', password: 'SURStaff@123', designation: 'Royal Punjabi Master Chef' },
        { name: 'Bhavna Mistry', email: 'surat.cashier@swadghar.com', password: 'SURStaff@123', designation: 'Cashier & Front Desk Lead' }
      ]
    },
    {
      branch: 'Vadodara Royal Heritage',
      location: 'RC Dutt Road, Alkapuri',
      city: 'Vadodara',
      manager: {
        name: 'Hardik Shah',
        email: 'vadodara.manager@swadghar.com',
        password: 'VADStaff@123',
        designation: 'General Branch Manager'
      },
      staff: [
        { name: 'Shambhu Maharaj', email: 'vadodara.chef@swadghar.com', password: 'VADStaff@123', designation: 'Executive Royal Thali Chef' },
        { name: 'Gopalbhai Barot', email: 'vadodara.kadhi@swadghar.com', password: 'VADStaff@123', designation: 'Kadhi & Khichdi Specialist' },
        { name: 'Manpreet Singh', email: 'vadodara.curry@swadghar.com', password: 'VADStaff@123', designation: 'North Indian Gravy Master' },
        { name: 'Riddhi Soni', email: 'vadodara.cashier@swadghar.com', password: 'VADStaff@123', designation: 'Billing & Reservations Lead' }
      ]
    },
    {
      branch: 'Rajkot Kathiyawad Darbar',
      location: 'Kalawad Road, Kotecha',
      city: 'Rajkot',
      manager: {
        name: 'Bhavesh Jadeja',
        email: 'rajkot.manager@swadghar.com',
        password: 'RAJStaff@123',
        designation: 'General Branch Manager'
      },
      staff: [
        { name: 'Govind Maharaj', email: 'rajkot.chef@swadghar.com', password: 'RAJStaff@123', designation: 'Desi Chula Head Maharaj' },
        { name: 'Ramsangbhai Darbar', email: 'rajkot.rotla@swadghar.com', password: 'RAJStaff@123', designation: 'Bajra Rotla & Bhakri Master' },
        { name: 'Jaswant Singh', email: 'rajkot.tandoor@swadghar.com', password: 'RAJStaff@123', designation: 'Tandoori & Punjabi Specialist' },
        { name: 'Kinjal Vora', email: 'rajkot.cashier@swadghar.com', password: 'RAJStaff@123', designation: 'Cashier & Front Desk Executive' }
      ]
    },
    {
      branch: 'Mumbai Express',
      location: 'SV Road, Borivali West',
      city: 'Mumbai',
      manager: {
        name: 'Nitin Mehta',
        email: 'mumbai.manager@swadghar.com',
        password: 'MUMStaff@123',
        designation: 'General Branch Manager'
      },
      staff: [
        { name: 'Kishorebhai Maharaj', email: 'mumbai.chef@swadghar.com', password: 'MUMStaff@123', designation: 'Head Gujarati Chef' },
        { name: 'Balwinder Singh', email: 'mumbai.punjabi@swadghar.com', password: 'MUMStaff@123', designation: 'Master Punjabi Chef' },
        { name: 'Tanvi Shah', email: 'mumbai.cashier@swadghar.com', password: 'MUMStaff@123', designation: 'POS & Accounts Desk Lead' }
      ]
    }
  ],
  customers: [
    {
      name: 'Aarav Sharma',
      email: 'customer@gmail.com',
      password: 'Customer@123',
      city: 'Ahmedabad',
      phone: '+91 98220 55443',
      address: 'Bodakdev, Ahmedabad - 380054'
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      password: 'Priya@123',
      city: 'Surat',
      phone: '+91 98220 66554',
      address: 'Dumas Road, Surat - 395007'
    },
    {
      name: 'Rohan Desai',
      email: 'rohan.desai@gmail.com',
      password: 'Rohan@123',
      city: 'Vadodara',
      phone: '+91 98220 77665',
      address: 'Sayajigunj, Vadodara - 390005'
    },
    {
      name: 'Anjali Jadeja',
      email: 'anjali.jadeja@gmail.com',
      password: 'Anjali@123',
      city: 'Rajkot',
      phone: '+91 98220 88776',
      address: 'University Road, Rajkot - 360005'
    },
    {
      name: 'Vikram Mehta',
      email: 'vikram.mehta@gmail.com',
      password: 'Vikram@123',
      city: 'Mumbai',
      phone: '+91 98220 99887',
      address: 'Borivali West, Mumbai - 400092'
    }
  ]
};

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('admin'); // 'admin' | 'franchise' | 'customer'
  const [selectedBranchIdx, setSelectedBranchIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState(null);

  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const doLogin = async (userEmail, userPass) => {
    setLoading(true);
    try {
      const user = await login(userEmail, userPass);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  const handle1ClickLogin = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    doLogin(userEmail, userPass);
  };

  const handleFill = (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    showSuccess('Credentials filled into form!');
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 bg-stone-50/50 flex items-center justify-center">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Login Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <Link to="/" className="inline-flex items-center gap-2.5 hover:opacity-90 transition-opacity">
              <img
                src="/logo.png"
                alt="SwadGhar Logo"
                className="w-12 h-12 rounded-full object-contain bg-white p-1 shadow-glow border border-amber-500/30"
              />
              <div>
                <span className="font-serif font-black text-2xl text-stone-900 tracking-tight block">
                  Swad<span className="text-brand-600">Ghar</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-amber-600 block">
                  Authentic Taste of Gujarat & Punjab
                </span>
              </div>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 pt-2">
              Sign In to Your Account
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Access your orders, profile, franchise management, or admin dashboard.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4 relative"
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-98 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Quick Info Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">Credentials Quick Helper Active</p>
              <p className="text-stone-600 mt-0.5">
                You can use the helper panel on the right to test and auto-login with Admin, 5 Franchise Managers/Staff, or 5 Customers with a single click!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Credentials & 1-Click Login Helper */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Demo Logins & System Credentials</h3>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                Select any role below to 1-Click login or auto-fill credentials instantly
              </p>
            </div>
            <Link
              to="/franchise"
              className="text-xs text-amber-300 hover:text-amber-200 underline font-medium whitespace-nowrap"
            >
              View 5 Franchises & Staff &rarr;
            </Link>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-50/80 p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200 ring-2 ring-brand-500/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Admin (Super)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('franchise')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'franchise'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200 ring-2 ring-amber-500/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Store className="w-4 h-4 text-amber-600" />
              <span>5 Franchises</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('customer')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                activeTab === 'customer'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200 ring-2 ring-emerald-500/20'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>5 Customers</span>
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="p-5 sm:p-6 max-h-[580px] overflow-y-auto space-y-4">
            
            {/* TAB 1: ADMIN */}
            {activeTab === 'admin' && (
              <div className="space-y-4 animate-fadeIn">
                {DEMO_ACCOUNTS.admin.map((acc, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-br from-brand-50/50 via-white to-amber-50/30 border-2 border-brand-200 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-600 text-white">
                            👑 {acc.badge}
                          </span>
                          <span className="text-xs text-stone-500">{acc.location}</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-base mt-1">{acc.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFill(acc.email, acc.password)}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs transition-colors"
                        >
                          Fill Form
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handle1ClickLogin(acc.email, acc.password)}
                          className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>1-Click Login</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-stone-200/70">
                      {acc.desc}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase font-bold block">User ID / Email</span>
                          <span className="font-mono font-medium text-stone-900 select-all">{acc.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(acc.email, 'admin-email')}
                          className="p-1 text-stone-400 hover:text-stone-700"
                          title="Copy Email"
                        >
                          {copiedKey === 'admin-email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase font-bold block">Password</span>
                          <span className="font-mono font-medium text-stone-900 select-all">{acc.password}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(acc.password, 'admin-pass')}
                          className="p-1 text-stone-400 hover:text-stone-700"
                          title="Copy Password"
                        >
                          {copiedKey === 'admin-pass' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: 5 FRANCHISES */}
            {activeTab === 'franchise' && (
              <div className="space-y-4 animate-fadeIn">
                {/* Branch Selection Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {DEMO_ACCOUNTS.franchises.map((b, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBranchIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedBranchIdx === idx
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {b.city} ({b.branch.split(' ')[0]})
                    </button>
                  ))}
                </div>

                {/* Selected Branch Manager Card */}
                {(() => {
                  const b = DEMO_ACCOUNTS.franchises[selectedBranchIdx];
                  return (
                    <div className="space-y-3">
                      {/* Branch Info Banner */}
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-amber-600" />
                            <span>{b.branch}</span>
                          </h4>
                          <p className="text-[11px] text-amber-800/80 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            <span>{b.location}, {b.city}</span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                          10 Active Staff
                        </span>
                      </div>

                      {/* General Manager Login Card */}
                      <div className="p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-sm space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white">
                                Branch Manager
                              </span>
                              <span className="text-xs text-stone-500">{b.manager.designation}</span>
                            </div>
                            <h5 className="font-bold text-stone-900 text-sm mt-1">{b.manager.name}</h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleFill(b.manager.email, b.manager.password)}
                              className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs"
                            >
                              Fill
                            </button>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handle1ClickLogin(b.manager.email, b.manager.password)}
                              className="px-3.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <LogIn className="w-3.5 h-3.5" />
                              <span>1-Click Login</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                            <span className="font-mono text-stone-700 truncate">{b.manager.email}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.manager.email, `mgr-${b.city}`)}
                              className="p-1 text-stone-400 hover:text-stone-700"
                            >
                              {copiedKey === `mgr-${b.city}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                            <span className="font-mono text-stone-700">{b.manager.password}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(b.manager.password, `mgr-p-${b.city}`)}
                              className="p-1 text-stone-400 hover:text-stone-700"
                            >
                              {copiedKey === `mgr-p-${b.city}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Staff Members for this Branch */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                          Other Staff in {b.city} Branch:
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {b.staff.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className="p-3 rounded-xl bg-stone-50 border border-stone-200 hover:bg-white hover:border-amber-300 transition-all flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <ChefHat className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                  <span className="font-bold text-xs text-stone-900 truncate">{s.name}</span>
                                </div>
                                <span className="text-[11px] text-stone-500 truncate block mt-0.5">{s.designation}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleFill(s.email, s.password)}
                                  className="px-2 py-1 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-[11px]"
                                >
                                  Fill
                                </button>
                                <button
                                  type="button"
                                  disabled={loading}
                                  onClick={() => handle1ClickLogin(s.email, s.password)}
                                  className="px-2.5 py-1 rounded-md bg-stone-800 hover:bg-stone-900 text-white font-bold text-[11px] flex items-center gap-1"
                                >
                                  <LogIn className="w-3 h-3" />
                                  <span>Login</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 3: 5 CUSTOMERS */}
            {activeTab === 'customer' && (
              <div className="space-y-3 animate-fadeIn">
                <p className="text-xs text-stone-500">
                  Log in as registered customers across 5 cities to test ordering, menus, delivery tracking & profile:
                </p>
                {DEMO_ACCOUNTS.customers.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {c.city} Diner
                          </span>
                          <span className="text-xs font-mono text-stone-400">{c.phone}</span>
                        </div>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">{c.name}</h4>
                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{c.address}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleFill(c.email, c.password)}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-xs"
                        >
                          Fill
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handle1ClickLogin(c.email, c.password)}
                          className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>1-Click Login</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-stone-100">
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold block">Email</span>
                          <span className="font-mono text-stone-800 text-[11px]">{c.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.email, `cust-e-${idx}`)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                        >
                          {copiedKey === `cust-e-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-bold block">Password</span>
                          <span className="font-mono text-stone-800 text-[11px]">{c.password}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(c.password, `cust-p-${idx}`)}
                          className="p-1 text-stone-400 hover:text-stone-700"
                        >
                          {copiedKey === `cust-p-${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

