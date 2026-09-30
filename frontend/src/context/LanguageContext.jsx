import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import dictionaries, { availableLanguages } from '../locales';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'swadghar_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'gu' || saved === 'hi')) {
        return saved;
      }
    } catch (e) {
      // localStorage unavailable or blocked
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
    }
  }, []);

  // Lookup translation by dot-path with fallback and variable interpolation
  const t = useCallback(
    (keyPath, fallbackOrParams, params) => {
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

      const activeDict = dictionaries[language] || dictionaries.en;
      const fallbackDict = dictionaries.en;

      const resolvePath = (obj, path) => {
        if (!obj || typeof obj !== 'object') return undefined;
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
          if (current === undefined || current === null) return undefined;
          current = current[part];
        }
        return current;
      };

      let result = resolvePath(activeDict, keyPath);

      if (result === undefined || result === null) {
        result = resolvePath(fallbackDict, keyPath);
      }

      if (result === undefined || result === null) {
        result = fallbackText || keyPath;
      }

      // If result is string and variables provided, interpolate {{var}} and ${var}
      if (typeof result === 'string' && Object.keys(variables).length > 0) {
        Object.entries(variables).forEach(([vKey, vVal]) => {
          result = result.replace(new RegExp(`{{\\s*${vKey}\\s*}}`, 'g'), String(vVal));
          result = result.replace(new RegExp(`\\$\\{\\s*${vKey}\\s*\\}`, 'g'), String(vVal));
        });
      }

      return result;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      availableLanguages,
      t,
      isEnglish: language === 'en',
      isGujarati: language === 'gu',
      isHindi: language === 'hi',
      currentLanguageMeta: availableLanguages.find((l) => l.code === language) || availableLanguages[0],
    }),
    [language, setLanguage, t]
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
