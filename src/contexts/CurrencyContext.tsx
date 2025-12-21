import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Currency = string;

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

// All available currency configurations
export const ALL_CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  EUR: { code: "EUR", symbol: "€", name: "Euro", locale: "fr-FR", decimals: 2 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", decimals: 2 },
  XOF: { code: "XOF", symbol: "FCFA", name: "Franc CFA (UEMOA)", locale: "fr-FR", decimals: 0 },
  XAF: { code: "XAF", symbol: "FCFA", name: "Franc CFA (CEMAC)", locale: "fr-FR", decimals: 0 },
  GNF: { code: "GNF", symbol: "GNF", name: "Franc Guinéen", locale: "fr-GN", decimals: 0 },
  GBP: { code: "GBP", symbol: "£", name: "Livre Sterling", locale: "en-GB", decimals: 2 },
  CHF: { code: "CHF", symbol: "CHF", name: "Franc Suisse", locale: "fr-CH", decimals: 2 },
  CAD: { code: "CAD", symbol: "CA$", name: "Dollar Canadien", locale: "en-CA", decimals: 2 },
  MAD: { code: "MAD", symbol: "DH", name: "Dirham Marocain", locale: "fr-MA", decimals: 2 },
  TND: { code: "TND", symbol: "DT", name: "Dinar Tunisien", locale: "fr-TN", decimals: 3 },
  DZD: { code: "DZD", symbol: "DA", name: "Dinar Algérien", locale: "fr-DZ", decimals: 2 },
  NGN: { code: "NGN", symbol: "₦", name: "Naira Nigérian", locale: "en-NG", decimals: 2 },
  GHS: { code: "GHS", symbol: "₵", name: "Cedi Ghanéen", locale: "en-GH", decimals: 2 },
  KES: { code: "KES", symbol: "KSh", name: "Shilling Kenyan", locale: "en-KE", decimals: 2 },
  ZAR: { code: "ZAR", symbol: "R", name: "Rand Sud-Africain", locale: "en-ZA", decimals: 2 },
  RWF: { code: "RWF", symbol: "FRw", name: "Franc Rwandais", locale: "rw-RW", decimals: 0 },
  UGX: { code: "UGX", symbol: "USh", name: "Shilling Ougandais", locale: "en-UG", decimals: 0 },
  TZS: { code: "TZS", symbol: "TSh", name: "Shilling Tanzanien", locale: "sw-TZ", decimals: 0 },
  ETB: { code: "ETB", symbol: "Br", name: "Birr Éthiopien", locale: "am-ET", decimals: 2 },
  EGP: { code: "EGP", symbol: "E£", name: "Livre Égyptienne", locale: "ar-EG", decimals: 2 },
  MUR: { code: "MUR", symbol: "Rs", name: "Roupie Mauricienne", locale: "en-MU", decimals: 2 },
  BWP: { code: "BWP", symbol: "P", name: "Pula Botswanais", locale: "en-BW", decimals: 2 },
  MWK: { code: "MWK", symbol: "MK", name: "Kwacha Malawien", locale: "en-MW", decimals: 2 },
  ZMW: { code: "ZMW", symbol: "ZK", name: "Kwacha Zambien", locale: "en-ZM", decimals: 2 },
  AOA: { code: "AOA", symbol: "Kz", name: "Kwanza Angolais", locale: "pt-AO", decimals: 2 },
  MZN: { code: "MZN", symbol: "MT", name: "Metical Mozambicain", locale: "pt-MZ", decimals: 2 },
  CVE: { code: "CVE", symbol: "$", name: "Escudo Cap-Verdien", locale: "pt-CV", decimals: 2 },
  GMD: { code: "GMD", symbol: "D", name: "Dalasi Gambien", locale: "en-GM", decimals: 2 },
  SLL: { code: "SLL", symbol: "Le", name: "Leone Sierra-Léonais", locale: "en-SL", decimals: 0 },
  LRD: { code: "LRD", symbol: "L$", name: "Dollar Libérien", locale: "en-LR", decimals: 2 },
  SDG: { code: "SDG", symbol: "SDG", name: "Livre Soudanaise", locale: "ar-SD", decimals: 2 },
  LYD: { code: "LYD", symbol: "LD", name: "Dinar Libyen", locale: "ar-LY", decimals: 3 },
  MRU: { code: "MRU", symbol: "UM", name: "Ouguiya Mauritanien", locale: "ar-MR", decimals: 2 },
};

// Legacy export for backward compatibility
export const CURRENCIES = ALL_CURRENCY_CONFIGS;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

interface ExchangeRates {
  [key: string]: number;
}

interface CachedRates {
  rates: ExchangeRates;
  timestamp: number;
  baseCurrency: string;
}

interface CurrencyContextType {
  currency: Currency;
  currencyConfig: CurrencyConfig;
  setCurrency: (currency: Currency) => Promise<void>;
  formatAmount: (amount: number) => string;
  formatAmountWithSymbol: (amount: number, showSign?: boolean) => string;
  convertFromEUR: (amountInEUR: number) => number;
  convertToEUR: (amount: number, fromCurrency?: Currency) => number;
  isLoading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
  supportedCurrencies: string[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const RATES_CACHE_KEY = "moneya_exchange_rates";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [supportedCurrencies, setSupportedCurrencies] = useState<string[]>(["EUR", "USD", "XOF", "GNF"]);
  const [currency, setCurrencyState] = useState<Currency>("EUR");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ EUR: 1, USD: 1.08, XOF: 655.96, GNF: 9200 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get currency config with fallback
  const currencyConfig: CurrencyConfig = ALL_CURRENCY_CONFIGS[currency] || {
    code: currency,
    symbol: currency,
    name: currency,
    locale: "fr-FR",
    decimals: 2,
  };

  // Fetch user's currency preference from database
  const fetchUserCurrency = useCallback(async () => {
    if (!user) {
      setIsInitialized(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("currency_preference")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data?.currency_preference) {
        setCurrencyState(data.currency_preference);
      }
    } catch (err) {
      console.error("Error fetching user currency:", err);
    } finally {
      setIsInitialized(true);
    }
  }, [user]);

  // Fetch supported currencies from system_settings
  const fetchSupportedCurrencies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", "supported_currencies")
        .single();

      if (error) throw error;

      if (data?.setting_value) {
        const currencies = Array.isArray(data.setting_value) 
          ? data.setting_value 
          : JSON.parse(String(data.setting_value));
        setSupportedCurrencies(currencies);

        // If current currency is no longer supported, switch to EUR
        if (!currencies.includes(currency) && isInitialized) {
          await setCurrency("EUR");
        }
      }
    } catch (err) {
      console.error("Error fetching supported currencies:", err);
    }
  }, [currency, isInitialized]);

  // Subscribe to real-time changes in system_settings
  useEffect(() => {
    fetchSupportedCurrencies();

    const channel = supabase
      .channel("system-settings-currencies")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "system_settings",
          filter: "setting_key=eq.supported_currencies",
        },
        (payload) => {
          const newValue = payload.new.setting_value;
          if (newValue) {
            const currencies = Array.isArray(newValue) ? newValue : JSON.parse(String(newValue));
            setSupportedCurrencies(currencies);
            
            // If current currency is no longer supported, switch to EUR
            if (!currencies.includes(currency)) {
              setCurrency("EUR");
              toast.info("Votre devise a été changée car elle n'est plus disponible");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSupportedCurrencies, currency]);

  // Fetch user currency on auth change
  useEffect(() => {
    fetchUserCurrency();
  }, [fetchUserCurrency]);

  // Subscribe to real-time currency preference changes from profiles table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-currency-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newCurrency = payload.new.currency_preference;
          if (newCurrency && newCurrency !== currency) {
            setCurrencyState(newCurrency);
            toast.info(`Devise synchronisée: ${ALL_CURRENCY_CONFIGS[newCurrency]?.name || newCurrency}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currency]);

  // Fetch exchange rates from API
  const fetchExchangeRates = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh) {
      const cached = localStorage.getItem(RATES_CACHE_KEY);
      if (cached) {
        try {
          const cachedData: CachedRates = JSON.parse(cached);
          const isValid = Date.now() - cachedData.timestamp < CACHE_DURATION;
          if (isValid && cachedData.baseCurrency === "EUR") {
            setExchangeRates(cachedData.rates);
            setError(null);
            return;
          }
        } catch (e) {
          console.error("Cache parse error:", e);
        }
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('exchange-rates');

      if (invokeError) {
        throw new Error(invokeError.message || 'Edge function error');
      }

      if (data?.result === "success" && data?.rates) {
        const rates: ExchangeRates = { EUR: 1, ...data.rates };
        setExchangeRates(rates);
        setError(null);

        // Cache the rates
        const cacheData: CachedRates = {
          rates,
          timestamp: Date.now(),
          baseCurrency: "EUR",
        };
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cacheData));
      } else {
        throw new Error(data?.error || "Unknown API error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erreur de connexion à l'API de taux de change";
      setError(errorMessage);
      toast.error("Impossible de récupérer les taux de change actuels", {
        description: "Utilisation des taux en cache",
      });
      console.error("Exchange rate fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch rates on mount
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  const refreshRates = useCallback(async () => {
    await fetchExchangeRates(true);
  }, [fetchExchangeRates]);

  // Update currency both locally and in database
  const setCurrency = useCallback(async (newCurrency: Currency) => {
    if (!supportedCurrencies.includes(newCurrency)) return;

    setCurrencyState(newCurrency);

    // Save to database if user is logged in
    if (user) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ currency_preference: newCurrency })
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (err) {
        console.error("Error saving currency preference:", err);
        toast.error("Erreur lors de la sauvegarde de la devise");
      }
    }
  }, [user, supportedCurrencies]);

  // Convert amount from EUR to current currency
  const convertFromEUR = useCallback((amountInEUR: number): number => {
    const rate = exchangeRates[currency] || 1;
    const converted = amountInEUR * rate;
    const decimals = currencyConfig.decimals;
    return Number(converted.toFixed(decimals));
  }, [currency, exchangeRates, currencyConfig.decimals]);

  // Convert amount from specified currency (or current) to EUR
  const convertToEUR = useCallback((amount: number, fromCurrency?: Currency): number => {
    const sourceCurrency = fromCurrency || currency;
    const rate = exchangeRates[sourceCurrency] || 1;
    return Number((amount / rate).toFixed(2));
  }, [currency, exchangeRates]);

  // Format amount without symbol
  const formatAmount = useCallback((amountInEUR: number): string => {
    const converted = convertFromEUR(amountInEUR);
    return converted.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });
  }, [convertFromEUR, currencyConfig]);

  // Format amount with symbol
  const formatAmountWithSymbol = useCallback((amountInEUR: number, showSign = false): string => {
    const converted = convertFromEUR(amountInEUR);
    const formattedNumber = converted.toLocaleString(currencyConfig.locale, {
      minimumFractionDigits: currencyConfig.decimals,
      maximumFractionDigits: currencyConfig.decimals,
    });
    const sign = showSign && converted > 0 ? "+" : "";
    
    if (currency === "USD") {
      return `${sign}${currencyConfig.symbol}${formattedNumber}`;
    }
    return `${sign}${formattedNumber} ${currencyConfig.symbol}`;
  }, [currency, currencyConfig, convertFromEUR]);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatAmount,
        formatAmountWithSymbol,
        convertFromEUR,
        convertToEUR,
        isLoading,
        error,
        refreshRates,
        supportedCurrencies,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
