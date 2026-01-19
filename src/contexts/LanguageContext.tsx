import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage first
    const stored = localStorage.getItem('moneya-language');
    if (stored === 'en' || stored === 'fr') {
      return stored;
    }
    // Default to French
    return 'fr';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync language with i18n
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Load language preference from profile when user logs in
  useEffect(() => {
    const loadUserLanguagePreference = async () => {
      if (!user) return;

      try {
        // We'll store language in profiles_private or use localStorage for now
        // Since there's no language column in profiles, we use localStorage + sync
        const stored = localStorage.getItem('moneya-language');
        if (stored === 'en' || stored === 'fr') {
          setLanguageState(stored);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadUserLanguagePreference();
  }, [user]);

  const setLanguage = useCallback(async (lang: Language) => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('moneya-language', lang);
      
      // Update state
      setLanguageState(lang);
      
      // Change i18n language
      await i18n.changeLanguage(lang);
    } catch (error) {
      console.error('Error setting language:', error);
    } finally {
      setIsLoading(false);
    }
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
