import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { changeGoogleLanguage } from '../components/common/GoogleTranslate';

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

const LanguageContext = createContext(null);
const STORAGE_KEY = 'swadghar_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      // Check google translate cookie first if present
      const cookieMatch = document.cookie.match(/googtrans=\/en\/([a-z]{2})/i);
      if (cookieMatch && ['en', 'gu', 'hi'].includes(cookieMatch[1])) {
        return cookieMatch[1];
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['en', 'gu', 'hi'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      // ignore storage access errors
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang) => {
    if (newLang === 'en' || newLang === 'gu' || newLang === 'hi') {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch (e) {
        console.error('Error saving language preference:', e);
      }
      changeGoogleLanguage(newLang);
    }
  }, []);

  // Simple string / fallback helper with variable interpolation
  const t = useCallback((keyPath, fallbackOrParams, params) => {
    let fallbackText = '';
    let variables = {};

    if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      variables = fallbackOrParams;
    } else if (typeof fallbackOrParams === 'string') {
      fallbackText = fallbackOrParams;
      if (typeof params === 'object' && params !== null) {
        variables = params;
      }
    }

    let result = fallbackText || keyPath;

    // Handle string key paths like "header.home" -> humanize fallback if no text
    if (!fallbackText && typeof keyPath === 'string' && keyPath.includes('.')) {
      const parts = keyPath.split('.');
      const last = parts[parts.length - 1];
      result = last.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    }

    // Interpolate variables if provided
    if (typeof result === 'string' && Object.keys(variables).length > 0) {
      Object.entries(variables).forEach(([vKey, vVal]) => {
        result = result.replace(new RegExp(`{{\\s*${vKey}\\s*}}`, 'g'), String(vVal));
        result = result.replace(new RegExp(`\\$\\{\\s*${vKey}\\s*\\}`, 'g'), String(vVal));
      });
    }

    return result;
  }, []);

  // Lightweight pass-throughs (Google Translate translates DOM in real-time)
  const translateFoodName = useCallback((name) => name || '', []);
  const translateCategoryName = useCallback((catName) => catName || '', []);
  const translateReview = useCallback((text) => text || '', []);
  const translate = useCallback((text) => text || '', []);
  const localizeFood = useCallback((food) => food, []);
  const localizeCategory = useCallback((cat) => cat, []);
  const localizeReview = useCallback((rev) => rev, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages,
      t,
      translateFoodName,
      translateCategoryName,
      translateReview,
      translate,
      localizeFood,
      localizeCategory,
      localizeReview,
      isEnglish: language === 'en',
      isGujarati: language === 'gu',
      isHindi: language === 'hi',
      currentLanguageMeta: availableLanguages.find((l) => l.code === language) || availableLanguages[0],
    }),
    [language, setLanguage, t, translateFoodName, translateCategoryName, translateReview, translate, localizeFood, localizeCategory, localizeReview]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
