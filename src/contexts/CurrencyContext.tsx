import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "EUR" | "USD" | "XOF";

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  locale: string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    locale: "fr-FR",
  },
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
  },
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    name: "Franc CFA",
    locale: "fr-FR",
  },
};

// Approximate exchange rates (EUR as base)
export const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  XOF: 655.96,
};

interface CurrencyContextType {
  currency: Currency;
  currencyConfig: CurrencyConfig;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  formatAmountWithSymbol: (amount: number, showSign?: boolean) => string;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getConvertedAmounts: (amount: number) => Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "moneya_currency";

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

  const currencyConfig = CURRENCIES[currency];

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
  };

  // Format amount without symbol (for charts, tables)
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString(currencyConfig.locale);
  };

  // Format amount with symbol
  const formatAmountWithSymbol = (amount: number, showSign = false): string => {
    const formattedNumber = amount.toLocaleString(currencyConfig.locale);
    const sign = showSign && amount > 0 ? "+" : "";
    
    if (currency === "USD") {
      return `${sign}${currencyConfig.symbol}${formattedNumber}`;
    }
    return `${sign}${formattedNumber} ${currencyConfig.symbol}`;
  };

  // Convert amount from one currency to another
  const convertAmount = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;
    // Convert to EUR first, then to target currency
    const amountInEur = amount / EXCHANGE_RATES[fromCurrency];
    return amountInEur * EXCHANGE_RATES[toCurrency];
  };

  // Get amount converted to all currencies
  const getConvertedAmounts = (amount: number): Record<Currency, number> => {
    return {
      EUR: convertAmount(amount, currency, "EUR"),
      USD: convertAmount(amount, currency, "USD"),
      XOF: convertAmount(amount, currency, "XOF"),
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatAmount,
        formatAmountWithSymbol,
        convertAmount,
        getConvertedAmounts,
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
