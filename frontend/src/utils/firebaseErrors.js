/**
 * Maps Firebase Auth error codes to user-friendly messages
 * @param {Error|Object|string} error - The error object or code
 * @returns {string} Human-readable friendly error message
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred. Please try again.';

  const code = typeof error === 'string' ? error : error.code || error.message || '';

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'The phone number format is invalid. Please check the country code and number.';

    case 'auth/missing-phone-number':
      return 'Please provide a valid phone number.';

    case 'auth/operation-not-allowed':
      return 'Phone authentication is not enabled in Firebase Console. Please enable "Phone" in Authentication > Sign-in method.';

    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for today. Please try again later or use a test phone number.';

    case 'auth/too-many-requests':
      return 'Too many attempts from this device. Please wait a few minutes before trying again.';

    case 'auth/invalid-verification-code':
    case 'auth/invalid-verification-id':
      return 'Invalid OTP verification code. Please check and enter the 6-digit code again.';

    case 'auth/code-expired':
      return 'The OTP verification code has expired. Please click Resend OTP to request a new code.';

    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please refresh the page and try again.';

    case 'auth/user-disabled':
      return 'This user account has been disabled by an administrator.';

    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';

    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console. Add your localhost/domain to Authorized Domains in Firebase.';

    default:
      if (typeof error === 'string') return error;
      return error.message || 'Authentication failed. Please try again.';
  }
};
