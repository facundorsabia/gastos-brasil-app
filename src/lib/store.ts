import { supabase } from "@/lib/supabase";
import { Expense } from "@/lib/types";

export const getExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(`Failed to fetch expenses: ${error.message}`);
  return (data ?? []) as Expense[];
};

export const createExpense = async (
  input: Omit<Expense, "id" | "createdAt" | "updatedAt">,
): Promise<Expense> => {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("expenses")
    .insert({ ...input, createdAt: now, updatedAt: now })
    .select()
    .single();

  if (error) throw new Error(`Failed to create expense: ${error.message}`);
  return data as Expense;
};

export const updateExpense = async (
  id: string,
  patch: Partial<Omit<Expense, "id" | "createdAt" | "updatedAt">>,
): Promise<Expense | null> => {
  const { data, error } = await supabase
    .from("expenses")
    .update({ ...patch, updatedAt: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to update expense: ${error.message}`);
  }
  return data as Expense;
};

export const removeExpense = async (id: string): Promise<boolean> => {
  const { error, count } = await supabase
    .from("expenses")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`Failed to delete expense: ${error.message}`);
  return (count ?? 0) > 0;
};

export const bulkUpdateCategory = async (oldCategory: string, newCategory: string): Promise<number> => {
  const { error, count } = await supabase
    .from("expenses")
    .update({ category: newCategory })
    .eq("category", oldCategory);

  if (error) throw new Error(`Failed to bulk update category: ${error.message}`);
  return count ?? 0;
};

export const bulkDeleteByCategory = async (category: string): Promise<number> => {
  const { error, count } = await supabase
    .from("expenses")
    .delete({ count: "exact" })
    .eq("category", category);

  if (error) throw new Error(`Failed to bulk delete by category: ${error.message}`);

  // Also delete from categories table to fully clean up
  await supabase.from("categories").delete().eq("name", category);

  return count ?? 0;
};

export const getCategories = async (): Promise<{ id: string; name: string }[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return data ?? [];
};

export const addCategory = async (name: string): Promise<{ id: string; name: string }> => {
  const { data, error } = await supabase
    .from("categories")
    .insert({ name })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error("La categoría ya existe");
    throw new Error(`Failed to add category: ${error.message}`);
  }
  return data;
};

export const deleteCategory = async (name: string): Promise<boolean> => {
  const { error, count } = await supabase
    .from("categories")
    .delete({ count: "exact" })
    .eq("name", name);

  if (error) throw new Error(`Failed to delete category: ${error.message}`);
  return (count ?? 0) > 0;
};
