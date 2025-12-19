import { useState, useEffect, useCallback } from "react";

const EXPENSE_CATEGORIES_KEY = "moneya_expense_categories";
const INCOME_CATEGORIES_KEY = "moneya_income_categories";

const defaultExpenseCategories = [
  "Outils",
  "Infrastructure",
  "Formation",
  "Marketing",
  "Banque",
  "Transport",
  "Repas",
];

const defaultIncomeCategories = [
  "Vente de services",
  "Vente de produits",
  "Consulting",
  "Commission",
  "Subvention",
  "Autre revenu",
];

export function useCategories() {
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem(EXPENSE_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : defaultExpenseCategories;
  });

  const [incomeCategories, setIncomeCategories] = useState<string[]>(() => {
    const stored = localStorage.getItem(INCOME_CATEGORIES_KEY);
    return stored ? JSON.parse(stored) : defaultIncomeCategories;
  });

  // Persist expense categories
  useEffect(() => {
    localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(expenseCategories));
    // Dispatch custom event for cross-component sync
    window.dispatchEvent(new CustomEvent("categories-updated"));
  }, [expenseCategories]);

  // Persist income categories
  useEffect(() => {
    localStorage.setItem(INCOME_CATEGORIES_KEY, JSON.stringify(incomeCategories));
    window.dispatchEvent(new CustomEvent("categories-updated"));
  }, [incomeCategories]);

  // Listen for updates from other components
  useEffect(() => {
    const handleUpdate = () => {
      const storedExpense = localStorage.getItem(EXPENSE_CATEGORIES_KEY);
      const storedIncome = localStorage.getItem(INCOME_CATEGORIES_KEY);
      
      if (storedExpense) {
        const parsed = JSON.parse(storedExpense);
        setExpenseCategories(prev => 
          JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
        );
      }
      if (storedIncome) {
        const parsed = JSON.parse(storedIncome);
        setIncomeCategories(prev => 
          JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
        );
      }
    };

    window.addEventListener("categories-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    
    return () => {
      window.removeEventListener("categories-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const addExpenseCategory = useCallback((category: string) => {
    if (category.trim() && !expenseCategories.includes(category.trim())) {
      setExpenseCategories(prev => [...prev, category.trim()]);
      return true;
    }
    return false;
  }, [expenseCategories]);

  const removeExpenseCategory = useCallback((category: string) => {
    setExpenseCategories(prev => prev.filter(c => c !== category));
  }, []);

  const addIncomeCategory = useCallback((category: string) => {
    if (category.trim() && !incomeCategories.includes(category.trim())) {
      setIncomeCategories(prev => [...prev, category.trim()]);
      return true;
    }
    return false;
  }, [incomeCategories]);

  const removeIncomeCategory = useCallback((category: string) => {
    setIncomeCategories(prev => prev.filter(c => c !== category));
  }, []);

  // All categories combined for filters
  const allCategories = [...new Set([...expenseCategories, ...incomeCategories])].sort();

  return {
    expenseCategories,
    incomeCategories,
    allCategories,
    addExpenseCategory,
    removeExpenseCategory,
    addIncomeCategory,
    removeIncomeCategory,
  };
}
