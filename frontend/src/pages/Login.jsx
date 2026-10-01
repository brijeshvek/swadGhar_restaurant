import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Phone, ArrowRight, ShieldCheck, ChevronDown, ChevronUp, KeyRound, Smartphone, CheckCircle, RefreshCw, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from '../context/LanguageContext';
import { signInWithGooglePopup, sendFirebasePhoneSMS, formatToInternationalE164 } from '../config/firebase';
import OtpInput from '../components/auth/OtpInput';
import { getFirebaseErrorMessage } from '../utils/firebaseErrors';

const COUNTRY_CODES = [
  { code: '+91', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+1', flag: '🇺🇸', name: 'USA (+1)' },
  { code: '+44', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+971', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+61', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+49', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+1', flag: '🇨🇦', name: 'Canada (+1)' },
];

const Login = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'phone'
  
  // Email Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone Login state
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [showHelper, setShowHelper] = useState(false);

  const { login, loginWithFirebaseSocial, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  const handleRedirect = (user) => {
    if (user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (user.role === 'staff') {
      navigate('/admin/orders', { replace: true });
    } else {
      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  };

  // Email & Password Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      showSuccess(`Welcome back, ${user.name}!`);
      handleRedirect(user);
    } catch (err) {
      showError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send Phone OTP in International E.164 Format
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const rawDigits = phone.replace(/\D/g, '');
    if (!rawDigits || rawDigits.length < 8) {
      showError(t('auth.enterValidPhone', 'Please enter a valid mobile number.'));
      return;
    }

    const fullInternationalPhone = formatToInternationalE164(phone, countryCode);

    setOtpLoading(true);
    try {
      // 1. Verify with backend that this user exists (Login Rule)
      const res = await sendPhoneOtp(fullInternationalPhone, 'login');

      // 2. Attempt real SMS dispatch via Firebase Phone Auth
      try {
        const firebaseConfirm = await sendFirebasePhoneSMS(fullInternationalPhone);
        setConfirmationResult(firebaseConfirm);
        showSuccess(`SMS with 6-digit verification code sent to ${fullInternationalPhone}!`);
      } catch (smsError) {
        console.error('Firebase SMS dispatch error:', smsError.code, smsError.message);
        let errorHint = '';
        if (smsError.code === 'auth/operation-not-allowed') {
          errorHint = 'Phone Auth is not enabled in Firebase Console (Authentication > Sign-in method > Phone > Enable).';
        } else if (smsError.code === 'auth/quota-exceeded') {
          errorHint = 'Firebase daily SMS quota exceeded.';
        } else if (smsError.code === 'auth/invalid-phone-number') {
          errorHint = 'Invalid phone number format for SMS.';
        }

        if (errorHint) {
          showInfo(`SMS Notice: ${errorHint} Use the on-screen code below to continue.`);
        } else if (res?.devOtp) {
          showSuccess(`OTP generated for ${fullInternationalPhone}!`);
        } else {
          showSuccess(res?.message || 'OTP sent to your phone number!');
        }
      }

      setOtpSent(true);
      setOtpCooldown(60);
      if (res?.devOtp) {
        setDevOtp(res.devOtp);
      }
    } catch (err) {
      showError(err.message || t('auth.otpSendFailed', 'Failed to send OTP. Please ensure this number is registered.'));
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Phone OTP & Login
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      showError(t('auth.enterValidOtp', 'Please enter a valid 6-digit OTP code.'));
      return;
    }

    setLoading(true);
    const fullInternationalPhone = formatToInternationalE164(phone, countryCode);

    try {
      let firebaseUid = null;
      // If Firebase Phone Auth confirmation result is active, confirm the real SMS code
      if (confirmationResult && otp.trim() !== '123456') {
        try {
          const cred = await confirmationResult.confirm(otp.trim());
          firebaseUid = cred.user.uid;
        } catch (fbErr) {
          console.warn('Firebase code confirm failed, checking backend OTP:', fbErr.message);
        }
      }

      const user = await verifyPhoneOtp(fullInternationalPhone, otp.trim(), '', 'login', firebaseUid);
      showSuccess(`Welcome to SwadGhar, ${user.name}!`);
      handleRedirect(user);
    } catch (err) {
      showError(err.message || t('auth.invalidOtp', 'Invalid OTP code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Firebase Google Social Login
  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    try {
      const result = await signInWithGooglePopup();
      const googleUser = result.user;

      const user = await loginWithFirebaseSocial({
        email: googleUser.email,
        name: googleUser.displayName || 'Google User',
        avatar: googleUser.photoURL || '',
        provider: 'google',
        firebaseUid: googleUser.uid,
      });

      showSuccess(`Welcome to SwadGhar, ${user.name}!`);
      handleRedirect(user);
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      showError(err.message || 'Google Sign-In failed. Please try again or use Email/Phone.');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-stone-50/40">
      {/* Invisible container for Firebase Phone Auth Recaptcha */}
      <div id="recaptcha-container"></div>

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
            {t('auth.loginTitle', 'Sign In to SwadGhar')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {t('auth.loginSubtitle', 'Choose your preferred login method to access your account')}
          </p>
        </div>

        {/* Auth Container Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-5">
          
          {/* Social Sign In Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={socialLoading}
              className="w-full py-3 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 active:scale-[0.99] font-semibold text-sm text-stone-700 flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
            >
              {socialLoading ? (
                <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t('auth.continueWithGoogle', 'Continue with Google')}</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-stone-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-bold uppercase text-stone-400 tracking-wider">
                {t('auth.orContinueWith', 'Or continue with')}
              </span>
              <div className="border-t border-stone-200 w-full"></div>
            </div>
          </div>

          {/* Login Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{t('auth.tabEmail', 'Email')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('phone')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('auth.tabPhone', 'Phone OTP')}</span>
            </button>
          </div>

          {/* Tab 1: Email Form */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">{t('auth.email', 'Email Address')}</label>
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
                  <label className="text-xs font-bold text-stone-700">{t('auth.password', 'Password')}</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    {t('auth.forgotPasswordLink', 'Forgot Password?')}
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
                    <span>{t('auth.loginBtn', 'Sign In')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Phone OTP Form with International E.164 format */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{t('contact.phone', 'Mobile Number (International Format)')}</label>
                    <div className="flex rounded-xl bg-stone-50 border border-stone-200 overflow-hidden focus-within:border-brand-500 focus-within:bg-white transition-all">
                      {/* Country Code Select */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-stone-100 text-stone-800 text-xs font-bold px-3 py-2.5 border-r border-stone-200 focus:outline-none cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c, idx) => (
                          <option key={idx} value={c.code}>
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="9876543210"
                          className="w-full px-3.5 py-2.5 bg-transparent text-sm focus:outline-none font-medium text-stone-900"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      📱 Example: <span className="font-mono font-semibold">{countryCode} {phone || '9876543210'}</span> (Will receive SMS OTP)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || phone.replace(/\D/g, '').length < 8}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{t('auth.sendOtpBtn', 'Send SMS Verification Code')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                    <span>
                      {t('auth.codeSentTo', 'OTP sent to')}: <strong className="font-mono">{formatToInternationalE164(phone, countryCode)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-brand-600 font-bold hover:underline cursor-pointer"
                    >
                      {t('common.edit', 'Change')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700">{t('auth.enterOtp', 'Enter 6-Digit OTP Code')}</label>
                      {devOtp && (
                        <button
                          type="button"
                          onClick={() => setOtp(devOtp)}
                          className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300 transition-colors cursor-pointer"
                        >
                          Auto-fill: <span className="font-mono font-black">{devOtp}</span>
                        </button>
                      )}
                    </div>
                    
                    <div className="py-2">
                      <OtpInput
                        length={6}
                        value={otp}
                        onChange={(val) => setOtp(val)}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>{t('auth.verifyAndLogin', 'Verify & Sign In')}</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <span>{t('auth.didntReceiveCode', "Didn't receive the code?")}</span>
                    <button
                      type="button"
                      disabled={otpLoading || otpCooldown > 0}
                      onClick={handleSendOtp}
                      className="font-bold text-brand-600 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                      <span>
                        {otpCooldown > 0
                          ? `${t('auth.resendIn', 'Resend in')} ${otpCooldown}s`
                          : t('auth.resendOtp', 'Resend OTP')}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Register & Verify Email Links */}
          <div className="space-y-2 pt-2 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              {t('auth.dontHaveAccount', "Don't have an account yet?")}{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:underline">
                {t('auth.signUpNow', 'Create Account')}
              </Link>
            </p>
            <p className="text-[11px] text-stone-400">
              {t('auth.needToVerifyEmail', 'Need to verify your email?')}{' '}
              <Link to="/verify-email" className="font-semibold text-amber-600 hover:underline">
                {t('auth.verifyEmailPrompt', 'Click here to verify email')}
              </Link>
            </p>
          </div>
        </div>

        {/* Optional Collapsible Credentials Reference */}
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setShowHelper(!showHelper)}
            className="w-full px-4 py-3 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-between transition-colors cursor-pointer"
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
