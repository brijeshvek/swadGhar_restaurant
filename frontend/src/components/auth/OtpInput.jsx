import React, { useRef, useEffect } from 'react';

/**
 * Reusable 6-Digit OTP Box Input Component
 * Supports:
 * - Auto-advancing focus on input
 * - Backspace backward navigation
 * - Pasting 6 digits from clipboard
 * - Keyboard navigation (ArrowLeft, ArrowRight)
 */
const OtpInput = ({ length = 6, value = '', onChange, disabled = false, autoFocus = true }) => {
  const inputRefs = useRef([]);

  // Ensure value is padded/sliced to length
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e, index) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigits = rawVal.replace(/\D/g, '');

    if (!cleanDigits) {
      // Empty / cleared
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    // If user typed/pasted multiple digits into a single box
    if (cleanDigits.length > 1) {
      const pastedDigits = cleanDigits.slice(0, length).split('');
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (index + i < length) {
          newDigits[index + i] = d;
        }
      });
      onChange(newDigits.join(''));
      // Focus the next available box
      const nextIndex = Math.min(index + pastedDigits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single digit entered
    const newDigits = [...digits];
    newDigits[index] = cleanDigits[0];
    onChange(newDigits.join(''));

    // Move to next box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current box is empty, move back and clear previous
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasteData) return;

    onChange(pasteData);
    const targetFocusIndex = Math.min(pasteData.length, length) - 1;
    inputRefs.current[Math.max(0, targetFocusIndex)]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
            ${digit 
              ? 'border-amber-500 bg-amber-50/20 text-slate-900 dark:text-amber-300 shadow-sm shadow-amber-500/20 ring-2 ring-amber-500/20' 
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-400 dark:hover:border-slate-600'
            }
            focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 focus:scale-105
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          aria-label={`Digit ${index + 1} of OTP`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
