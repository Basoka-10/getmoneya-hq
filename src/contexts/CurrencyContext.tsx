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

interface CurrencyContextType {
  currency: Currency;
  currencyConfig: CurrencyConfig;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number) => string;
  formatAmountWithSymbol: (amount: number, showSign?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const STORAGE_KEY = "getmoneya_currency";

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

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyConfig,
        setCurrency,
        formatAmount,
        formatAmountWithSymbol,
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
