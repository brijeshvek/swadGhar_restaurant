import React, { useEffect } from 'react';

/**
 * Google Translate Integration Component for SwadGhar
 * Automatically translates the entire web application (dishes, categories, reviews, admin, etc.)
 * in real-time between English, Gujarati, and Hindi INSTANTLY WITHOUT PAGE REFRESH.
 */
export const changeGoogleLanguage = (langCode) => {
  try {
    const targetCode = langCode === 'en' ? '/en/en' : `/en/${langCode}`;
    
    // Set cookies for Google Translate
    document.cookie = `googtrans=${targetCode}; path=/;`;
    if (window.location.hostname && window.location.hostname !== 'localhost') {
      document.cookie = `googtrans=${targetCode}; path=/; domain=.${window.location.hostname}`;
      document.cookie = `googtrans=${targetCode}; path=/; domain=${window.location.hostname}`;
    }

    const fireChange = () => {
      const selectElem = document.querySelector('.goog-te-combo');
      if (selectElem) {
        selectElem.value = langCode;
        selectElem.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    };

    if (!fireChange()) {
      // Poll a few times for script initialization without ever reloading
      const interval = setInterval(() => {
        if (fireChange()) {
          clearInterval(interval);
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 3000);
    }
  } catch (err) {
    console.warn('Google Translate change error:', err);
  }
};

const GoogleTranslate = () => {
  useEffect(() => {
    // 1. Define global Google Translate Init Callback
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,gu,hi',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
        } catch (e) {
          console.warn('Google Translate init element error:', e);
        }
      }
    };

    // 2. Inject Google Translate script if not already present
    const existingScript = document.getElementById('google-translate-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    } else if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div
      id="google_translate_element"
      style={{
        position: 'absolute',
        top: '-9999px',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    />
  );
};

export default GoogleTranslate;

