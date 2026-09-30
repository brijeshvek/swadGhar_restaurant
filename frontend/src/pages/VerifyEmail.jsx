import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useTranslation } from '../context/LanguageContext';

const VerifyEmail = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const token = routeToken || searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { verifyEmail, sendEmailVerification, user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Auto-verify if token is in URL
  useEffect(() => {
    if (token) {
      const autoVerify = async () => {
        setLoading(true);
        try {
          await verifyEmail({ token });
          setIsSuccess(true);
          showSuccess(t('auth.emailVerifiedSuccess', 'Email verified successfully! You are all set.'));
        } catch (err) {
          showError(err.message || t('auth.emailVerifyFailed', 'Verification link is invalid or expired.'));
        } finally {
          setLoading(false);
        }
      };
      autoVerify();
    }
  }, [token]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      showError(t('auth.enterEmail', 'Please provide your email address.'));
      return;
    }
    if (!otp || otp.trim().length < 6) {
      showError(t('auth.enterValidOtp', 'Please enter a valid 6-digit OTP code.'));
      return;
    }

    setLoading(true);
    try {
      await verifyEmail({ email: email.trim(), otp: otp.trim() });
      setIsSuccess(true);
      showSuccess(t('auth.emailVerifiedSuccess', 'Email verified successfully!'));
    } catch (err) {
      showError(err.message || t('auth.invalidOtp', 'Invalid or expired OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showError(t('auth.enterEmail', 'Please provide your email address.'));
      return;
    }
    setResending(true);
    try {
      const res = await sendEmailVerification(email.trim());
      showSuccess(res.message || t('auth.verificationSent', 'Verification code sent to your email!'));
      setResendCooldown(60);
    } catch (err) {
      showError(err.message || t('auth.errorOccurred', 'Failed to send verification email.'));
    } finally {
      setResending(false);
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
            {t('auth.verifyEmailTitle', 'Verify Your Email')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {t('auth.verifyEmailSubtitle', 'Enter the 6-digit verification code sent to your registered email.')}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-5">
          {isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {t('auth.emailVerified', 'Email Verified Successfully!')}
              </h3>
              <p className="text-sm text-stone-600">
                {t('auth.emailVerifiedDesc', 'Your SwadGhar dining account is now fully active and verified.')}
              </p>
              <div className="pt-3">
                <Link
                  to="/"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-glow transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('auth.continueToSwadghar', 'Explore SwadGhar Menu')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                <label className="text-xs font-bold text-stone-700">{t('auth.enterOtp', '6-Digit Verification Code')}</label>
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
                    <span>{t('auth.verifyNow', 'Verify Email')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
                <span>{t('auth.didntReceiveCode', "Didn't receive the code?")}</span>
                <button
                  type="button"
                  disabled={resending || resendCooldown > 0}
                  onClick={handleResend}
                  className="font-bold text-brand-600 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0
                      ? `${t('auth.resendIn', 'Resend in')} ${resendCooldown}s`
                      : t('auth.resendCode', 'Resend Code')}
                  </span>
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-stone-500 pt-2 border-t border-stone-100">
            <Link to="/login" className="font-semibold text-stone-600 hover:text-brand-600 hover:underline">
              &larr; {t('auth.backToLogin', 'Back to Sign In')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
