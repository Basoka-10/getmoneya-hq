import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Currency = "EUR" | "USD" | "XOF";

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "fr-FR",
    decimals: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    decimals: 2,
  },
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    name: "Franc CFA",
    locale: "fr-FR",
    decimals: 0,
  },
};

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
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  formatAmountWithSymbol: (amount: number, showSign?: boolean) => string;
  convertFromEUR: (amountInEUR: number) => number;
  convertToEUR: (amount: number, fromCurrency?: Currency) => number;
  isLoading: boolean;
  error: string | null;
  refreshRates: () => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "moneya_currency";
const RATES_CACHE_KEY = "moneya_exchange_rates";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === "EUR" || saved === "USD" || saved === "XOF")) {
        return saved as Currency;
      }
    }
    return "EUR";
  });

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({ EUR: 1, USD: 1.08, XOF: 655.96 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencyConfig = CURRENCIES[currency];

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
      // Call Supabase Edge Function instead of external API directly
      const { data, error: invokeError } = await supabase.functions.invoke('exchange-rates');

      if (invokeError) {
        throw new Error(invokeError.message || 'Edge function error');
      }

      if (data?.result === "success" && data?.rates) {
        const rates: ExchangeRates = {
          EUR: 1,
          USD: data.rates.USD,
          XOF: data.rates.XOF,
        };

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

  // Fetch rates on mount and when needed
  useEffect(() => {
    fetchExchangeRates();
  }, [fetchExchangeRates]);

  const refreshRates = useCallback(async () => {
    await fetchExchangeRates(true);
  }, [fetchExchangeRates]);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  };

  // Convert amount from EUR to current currency
  const convertFromEUR = useCallback((amountInEUR: number): number => {
    const rate = exchangeRates[currency] || 1;
    const converted = amountInEUR * rate;
    const decimals = CURRENCIES[currency].decimals;
    return Number(converted.toFixed(decimals));
  }, [currency, exchangeRates]);

  // Convert amount from specified currency (or current) to EUR
  const convertToEUR = useCallback((amount: number, fromCurrency?: Currency): number => {
    const sourceCurrency = fromCurrency || currency;
    const rate = exchangeRates[sourceCurrency] || 1;
    return Number((amount / rate).toFixed(2));
  }, [currency, exchangeRates]);

  // Format amount without symbol (for charts, tables)
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
