// Supabase Client Configuration for MUDA POS
// This module provides a singleton Supabase client instance

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase configuration is missing. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file.'
  );
}

// Create singleton Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export helper functions for common operations

/**
 * Get current authenticated user
 * @returns {Object|null} User object or null
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Auth result
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 * @returns {Object} Sign out result
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Execute a SQL query
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Object} Query result
 */
export async function executeQuery(query, params = []) {
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params
  });
  if (error) throw error;
  return data;
}

// Database table references for convenience
export const tables = {
  produk: () => supabase.from('produk'),
  productVariants: () => supabase.from('product_variants'),
  gudang: () => supabase.from('gudang'),
  supplier: () => supabase.from('supplier'),
  customer: () => supabase.from('customer'),
  sales: () => supabase.from('sales'),
  purchase: () => supabase.from('purchase'),
  stockMovements: () => supabase.from('stock_movements'),
  financeTransactions: () => supabase.from('finance_transactions'),
  settings: () => supabase.from('settings'),
  localUsers: () => supabase.from('local_users'),
  returPenjualan: () => supabase.from('retur_penjualan'),
  returPembelian: () => supabase.from('retur_pembelian')
};

console.log('Supabase client initialized');
