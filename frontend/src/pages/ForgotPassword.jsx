import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Request code, Step 2: Reset password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      showSuccess('Verification code generated!');
      if (res.resetCode) {
        setResetCode(res.resetCode); // Auto-fill in dev mode
      }
      setStep(2);
    } catch (err) {
      showError(err.message || 'Failed to request reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        resetCode,
        newPassword,
      });
      showSuccess('Password reset successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err) {
      showError(err.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-glow">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-stone-900">
            {step === 1 ? 'Forgot Password' : 'Enter Reset Code'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            {step === 1
              ? 'Enter your registered email to receive your password reset token'
              : 'Enter the 6-digit verification code and your new password'}
          </p>
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleRequestCode}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending Code...' : 'Get Verification Code'}
            </button>

            <p className="text-center text-xs text-stone-500 pt-2">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-brand-600 hover:underline">
                Back to Sign In
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleResetPassword}
            className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-xl space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">6-Digit Reset Code</label>
              <input
                type="text"
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono tracking-widest text-center text-lg focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Updating Password...' : 'Reset Password & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
