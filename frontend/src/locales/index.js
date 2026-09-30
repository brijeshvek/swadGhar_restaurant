import en from './en';
import gu from './gu';
import hi from './hi';

export const dictionaries = {
  en,
  gu,
  hi,
};

export const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', short: 'ગુજ' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', short: 'हि' },
];

export default dictionaries;
