import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

interface UserCategory {
  id: string;
  user_id: string;
  category_type: "income" | "expense";
  name: string;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch categories from Supabase
  const { data: dbCategories = [], isLoading } = useQuery({
    queryKey: ["user-categories", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        return [];
      }

      return data as UserCategory[];
    },
    enabled: !!user,
  });

  // Initialize default categories if user has none
  useEffect(() => {
    const initializeDefaults = async () => {
      if (!user || isLoading || dbCategories.length > 0) return;

      // Check if we've already initialized for this user
      const initializedKey = `categories_initialized_${user.id}`;
      if (localStorage.getItem(initializedKey)) return;

      // Insert default categories
      const defaultCategories = [
        ...defaultIncomeCategories.map(name => ({
          user_id: user.id,
          category_type: "income" as const,
          name,
        })),
        ...defaultExpenseCategories.map(name => ({
          user_id: user.id,
          category_type: "expense" as const,
          name,
        })),
      ];

      const { error } = await supabase
        .from("user_categories")
        .insert(defaultCategories);

      if (!error) {
        localStorage.setItem(initializedKey, "true");
        queryClient.invalidateQueries({ queryKey: ["user-categories"] });
      }
    };

    initializeDefaults();
  }, [user, isLoading, dbCategories.length, queryClient]);

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: "income" | "expense" }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_categories")
        .insert({
          user_id: user.id,
          category_type: type,
          name: name.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] });
    },
  });

  // Remove category mutation
  const removeCategoryMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: "income" | "expense" }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_categories")
        .delete()
        .eq("user_id", user.id)
        .eq("category_type", type)
        .eq("name", name);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-categories"] });
    },
  });

  // Derived categories lists
  const expenseCategories = dbCategories
    .filter(c => c.category_type === "expense")
    .map(c => c.name);

  const incomeCategories = dbCategories
    .filter(c => c.category_type === "income")
    .map(c => c.name);

  // Fallback to defaults if not logged in
  const finalExpenseCategories = user ? expenseCategories : defaultExpenseCategories;
  const finalIncomeCategories = user ? incomeCategories : defaultIncomeCategories;

  const addExpenseCategory = useCallback((category: string) => {
    if (!category.trim() || finalExpenseCategories.includes(category.trim())) {
      return false;
    }
    addCategoryMutation.mutate({ name: category, type: "expense" });
    return true;
  }, [finalExpenseCategories, addCategoryMutation]);

  const removeExpenseCategory = useCallback((category: string) => {
    removeCategoryMutation.mutate({ name: category, type: "expense" });
  }, [removeCategoryMutation]);

  const addIncomeCategory = useCallback((category: string) => {
    if (!category.trim() || finalIncomeCategories.includes(category.trim())) {
      return false;
    }
    addCategoryMutation.mutate({ name: category, type: "income" });
    return true;
  }, [finalIncomeCategories, addCategoryMutation]);

  const removeIncomeCategory = useCallback((category: string) => {
    removeCategoryMutation.mutate({ name: category, type: "income" });
  }, [removeCategoryMutation]);

  // All categories combined for filters
  const allCategories = [...new Set([...finalExpenseCategories, ...finalIncomeCategories])].sort();

  return {
    expenseCategories: finalExpenseCategories,
    incomeCategories: finalIncomeCategories,
    allCategories,
    addExpenseCategory,
    removeExpenseCategory,
    addIncomeCategory,
    removeIncomeCategory,
    isLoading,
  };
}
