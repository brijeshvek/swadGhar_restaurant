import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight, ShieldCheck, CheckCircle, Smartphone, KeyRound, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from '../context/LanguageContext';
import { signInWithGooglePopup } from '../config/firebase';

const Register = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' | 'email'
  
  // Email Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Phone Form State
  const [phoneName, setPhoneName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  const { register, loginWithFirebaseSocial, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  // Email Register Submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showError(t('auth.passwordMismatch', 'Passwords do not match.'));
      return;
    }

    if (formData.password.length < 6) {
      showError(t('auth.passwordMinLength', 'Password must be at least 6 characters.'));
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      
      showSuccess(t('auth.registrationSuccessVerificationSent', 'Registration successful! Verification email has been sent.'));
      setRegisteredEmail(formData.email);
    } catch (err) {
      showError(err.message || t('auth.registrationFailed', 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  // Phone Register Step 1: Send OTP
  const handleSendPhoneRegisterOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phoneName || phoneName.trim().length < 2) {
      showError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showError(t('auth.enterValidPhone', 'Please enter a valid 10-digit phone number.'));
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendPhoneOtp(cleanPhone, 'register');
      setOtpSent(true);
      setOtpCooldown(60);
      if (res?.devOtp) {
        setDevOtp(res.devOtp);
      }
      showSuccess(res?.message || t('auth.otpSentSuccess', '6-digit OTP sent to your phone number!'));
    } catch (err) {
      showError(err.message || t('auth.otpSendFailed', 'Failed to send OTP.'));
    } finally {
      setOtpLoading(false);
    }
  };

  // Phone Register Step 2: Verify OTP & Create Account
  const handleVerifyPhoneRegisterOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      showError(t('auth.enterValidOtp', 'Please enter a valid 6-digit OTP code.'));
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const user = await verifyPhoneOtp(cleanPhone, otp.trim(), phoneName.trim(), 'register');
      showSuccess(`Welcome to SwadGhar, ${user.name}! Your account has been created.`);
      navigate('/');
    } catch (err) {
      showError(err.message || t('auth.invalidOtp', 'Invalid OTP code. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Google Social Sign Up
  const handleGoogleRegister = async () => {
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
      navigate('/');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      showError(err.message || 'Google Sign-In failed. Please try with Email or Phone.');
    } finally {
      setSocialLoading(false);
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
            {t('auth.registerTitle', 'Create Your SwadGhar Account')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {t('auth.registerSubtitle', 'Join our dining family to enjoy exclusive member discounts, faster checkout & live tracking.')}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-5">
          
          {registeredEmail ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
                <Mail className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {t('auth.verifyYourEmailTitle', 'Verify Your Email Address')}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {t('auth.verificationSentMsg', 'We have sent a 6-digit verification code & link to')} <br/>
                <strong className="font-semibold text-stone-900">{registeredEmail}</strong>
              </p>
              <div className="pt-3 space-y-2">
                <Link
                  to={`/verify-email?email=${encodeURIComponent(registeredEmail)}`}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('auth.enterVerificationCode', 'Enter Verification Code / OTP')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/"
                  className="block text-xs text-stone-500 hover:text-stone-800 font-semibold pt-2"
                >
                  {t('auth.continueShopping', 'Continue to Home Page')} &rarr;
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Google Social Signup */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleRegister}
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
                      <span>{t('auth.continueWithGoogle', 'Sign up with Google')}</span>
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-stone-200 w-full"></div>
                  <span className="bg-white px-3 text-[11px] font-bold uppercase text-stone-400 tracking-wider">
                    {t('auth.orSignUpWithEmail', 'Or create new account')}
                  </span>
                  <div className="border-t border-stone-200 w-full"></div>
                </div>
              </div>

              {/* Registration Mode Tabs */}
              <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
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
                  <span>{t('auth.tabEmail', 'Email & Password')}</span>
                </button>
              </div>

              {/* Mode 1: Register with Phone OTP */}
              {activeTab === 'phone' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendPhoneRegisterOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">{t('auth.name', 'Full Name')} *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={phoneName}
                            onChange={(e) => setPhoneName(e.target.value)}
                            placeholder="Aarav Sharma"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700">{t('contact.phone', 'Mobile Number')} *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9876543210"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500 font-medium"
                          />
                        </div>
                        <p className="text-[11px] text-stone-400">
                          {t('auth.phoneOtpHint', 'We will send a 6-digit OTP code to verify your phone number.')}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={otpLoading || phone.length < 10 || !phoneName}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 active:scale-95 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {otpLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span>{t('auth.sendOtpBtn', 'Send Verification Code (OTP)')}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneRegisterOtp} className="space-y-4">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                        <div>
                          <span>Registering: <strong className="font-semibold">{phoneName}</strong></span>
                          <span className="block text-[11px] text-amber-700">Phone: <strong className="font-mono">{phone}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-brand-600 font-bold hover:underline cursor-pointer"
                        >
                          {t('common.edit', 'Change')}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-stone-700">{t('auth.enterOtp', '6-Digit OTP Code')}</label>
                          {devOtp && (
                            <button
                              type="button"
                              onClick={() => setOtp(devOtp)}
                              className="text-[11px] font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 cursor-pointer"
                            >
                              Auto-fill: <span className="font-mono">{devOtp}</span>
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-lg tracking-widest font-mono text-center focus:outline-none focus:border-brand-500 focus:bg-white transition-all font-bold text-brand-600"
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
                            <span>{t('auth.verifyAndLogin', 'Verify OTP & Create Account')}</span>
                            <CheckCircle className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                        <span>{t('auth.didntReceiveCode', "Didn't receive the code?")}</span>
                        <button
                          type="button"
                          disabled={otpLoading || otpCooldown > 0}
                          onClick={handleSendPhoneRegisterOtp}
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

              {/* Mode 2: Register with Email */}
              {activeTab === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{t('auth.name', 'Full Name')} *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Aarav Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{t('auth.email', 'Email Address')} *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@domain.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <p className="text-[11px] text-amber-600">
                      📧 We will send a verification link & code to this email.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{t('contact.phone', 'Phone Number (Optional)')}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 00000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{t('auth.password', 'Password')} *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">{t('auth.confirmPassword', 'Confirm Password')} *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
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
                        <span>{t('auth.registerBtn', 'Create Account with Email')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
            {t('auth.alreadyHaveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:underline">
              {t('auth.signInNow', 'Sign In Here')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
