'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * i18n Configuration
 * 
 * This file sets up internationalization for the application using i18next.
 * Features include:
 * - Multiple language support (French, English, Spanish)
 * - Automatic language detection
 * - HTTP backend for loading translations
 * - React integration
 * 
 * Configuration details:
 * - Fallback language: French
 * - Supported languages: French, English, Spanish
 * - Default namespace: 'common'
 * - Debug mode: disabled
 * - HTML interpolation enabled
 */
i18n
  // Use HTTP backend to load translations from server
  .use(HttpBackend)
  // Enable automatic language detection
  .use(LanguageDetector)
  // Initialize React integration
  .use(initReactI18next)
  // Configure i18n instance
  .init({
    fallbackLng: 'fr',              // Default language if translation is missing
    supportedLngs: ['fr', 'en', 'es'],  // Available languages
    ns: ['common'],                 // Namespace for translations
    defaultNS: 'common',            // Default namespace
    debug: false,                   // Disable debug mode in production
    interpolation: {
      escapeValue: false            // Allow HTML in translations
    }
  });

export default i18n;