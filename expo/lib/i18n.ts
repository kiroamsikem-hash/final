import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import tr from '../locales/tr.json';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import de from '../locales/de.json';

const LANGUAGE_KEY = '@language';

// Dil kaynaklarını tanımla
const resources = {
  tr: { translation: tr },
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
};

// Kaydedilmiş dili yükle
const loadLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || 'tr'; // Varsayılan Türkçe
  } catch (error) {
    console.error('Error loading language:', error);
    return 'tr';
  }
};

// Dili kaydet
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

// i18n'i başlat
const initI18n = async () => {
  const savedLanguage = await loadLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: savedLanguage,
      fallbackLng: 'tr',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;
