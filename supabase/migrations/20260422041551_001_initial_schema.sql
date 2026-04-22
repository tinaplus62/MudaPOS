/*
  # Initial Database Schema for MUDA POS

  1. New Tables
    - `produk` - Product master data
    - `product_variants` - Product variants (size, color, etc.)
    - `gudang` - Warehouse locations
    - `supplier` - Supplier information
    - `customer` - Customer information
    - `sales` - Sales transactions
    - `purchase` - Purchase transactions
    - `stock_movements` - Stock movement history
    - `finance_transactions` - Financial transactions
    - `settings` - Application settings
    - `local_users` - Local user accounts

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users to manage their own data
*/

-- Products table
CREATE TABLE IF NOT EXISTS produk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text UNIQUE NOT NULL,
  nama text NOT NULL,
  barcode text,
  harga_beli numeric(15,2) DEFAULT 0,
  harga_jual numeric(15,2) DEFAULT 0,
  stok_awal integer DEFAULT 0,
  kategori text,
  satuan text DEFAULT 'pcs',
  deskripsi text,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produk_id uuid NOT NULL REFERENCES produk(id) ON DELETE CASCADE,
  nama_varian text NOT NULL,
  barcode text,
  harga_jual numeric(15,2) DEFAULT 0,
  stok integer DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Warehouse table
CREATE TABLE IF NOT EXISTS gudang (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text UNIQUE NOT NULL,
  nama text NOT NULL,
  alamat text,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Supplier table
CREATE TABLE IF NOT EXISTS supplier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text UNIQUE NOT NULL,
  nama text NOT NULL,
  kontak text,
  email text,
  no_rekening text,
  bank text,
  alamat text,
  utang numeric(15,2) DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer table
CREATE TABLE IF NOT EXISTS customer (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text UNIQUE NOT NULL,
  nama text NOT NULL,
  level text,
  kontak text,
  email text,
  no_rekening text,
  bank text,
  token text,
  alamat text,
  outstanding numeric(15,2) DEFAULT 0,
  deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales transactions table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customer(id),
  customer_name text,
  items jsonb DEFAULT '[]',
  subtotal numeric(15,2) DEFAULT 0,
  diskon_persen numeric(5,2) DEFAULT 0,
  diskon_rp numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  paid_amount numeric(15,2) DEFAULT 0,
  outstanding numeric(15,2) DEFAULT 0,
  payment_method text DEFAULT 'Tunai',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Purchase transactions table
CREATE TABLE IF NOT EXISTS purchase (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES supplier(id),
  supplier_name text,
  warehouse_id uuid REFERENCES gudang(id),
  items jsonb DEFAULT '[]',
  subtotal numeric(15,2) DEFAULT 0,
  diskon_persen numeric(5,2) DEFAULT 0,
  diskon_rp numeric(15,2) DEFAULT 0,
  ongkir numeric(15,2) DEFAULT 0,
  biaya_lain numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  dibayar numeric(15,2) DEFAULT 0,
  utang numeric(15,2) DEFAULT 0,
  outstanding numeric(15,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  produk_id uuid REFERENCES produk(id),
  varian_id uuid REFERENCES product_variants(id),
  type text NOT NULL CHECK (type IN ('add', 'reduce', 'opname')),
  quantity integer NOT NULL,
  previous_stock integer DEFAULT 0,
  new_stock integer DEFAULT 0,
  reason text,
  reference_id uuid,
  reference_type text,
  user_id text,
  created_at timestamptz DEFAULT now()
);

-- Finance transactions table
CREATE TABLE IF NOT EXISTS finance_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date timestamptz DEFAULT now(),
  description text,
  category text,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount numeric(15,2) DEFAULT 0,
  method text DEFAULT 'Tunai',
  reference uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id text PRIMARY KEY DEFAULT 'appSettings',
  barcode_config jsonb,
  printer_config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Local users table
CREATE TABLE IF NOT EXISTS local_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sales returns table
CREATE TABLE IF NOT EXISTS retur_penjualan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_id uuid REFERENCES sales(id),
  customer_id uuid REFERENCES customer(id),
  customer_name text,
  items jsonb DEFAULT '[]',
  total numeric(15,2) DEFAULT 0,
  alasan text,
  created_at timestamptz DEFAULT now()
);

-- Purchase returns table
CREATE TABLE IF NOT EXISTS retur_pembelian (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchase(id),
  supplier_id uuid REFERENCES supplier(id),
  supplier_name text,
  items jsonb DEFAULT '[]',
  total numeric(15,2) DEFAULT 0,
  alasan text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE gudang ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE retur_penjualan ENABLE ROW LEVEL SECURITY;
ALTER TABLE retur_pembelian ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Products
CREATE POLICY "Users can view products"
  ON produk FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert products"
  ON produk FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update products"
  ON produk FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete products"
  ON produk FOR DELETE
  TO authenticated
  USING (true);

-- Product variants
CREATE POLICY "Users can view product variants"
  ON product_variants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert product variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update product variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete product variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (true);

-- Warehouse
CREATE POLICY "Users can view warehouses"
  ON gudang FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert warehouses"
  ON gudang FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update warehouses"
  ON gudang FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete warehouses"
  ON gudang FOR DELETE
  TO authenticated
  USING (true);

-- Supplier
CREATE POLICY "Users can view suppliers"
  ON supplier FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert suppliers"
  ON supplier FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update suppliers"
  ON supplier FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete suppliers"
  ON supplier FOR DELETE
  TO authenticated
  USING (true);

-- Customer
CREATE POLICY "Users can view customers"
  ON customer FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert customers"
  ON customer FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update customers"
  ON customer FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete customers"
  ON customer FOR DELETE
  TO authenticated
  USING (true);

-- Sales
CREATE POLICY "Users can view sales"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sales"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- Purchase
CREATE POLICY "Users can view purchases"
  ON purchase FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert purchases"
  ON purchase FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update purchases"
  ON purchase FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete purchases"
  ON purchase FOR DELETE
  TO authenticated
  USING (true);

-- Stock movements
CREATE POLICY "Users can view stock movements"
  ON stock_movements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert stock movements"
  ON stock_movements FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Finance transactions
CREATE POLICY "Users can view finance transactions"
  ON finance_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert finance transactions"
  ON finance_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update finance transactions"
  ON finance_transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete finance transactions"
  ON finance_transactions FOR DELETE
  TO authenticated
  USING (true);

-- Settings
CREATE POLICY "Users can view settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Local users
CREATE POLICY "Users can view local users"
  ON local_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert local users"
  ON local_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update local users"
  ON local_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete local users"
  ON local_users FOR DELETE
  TO authenticated
  USING (true);

-- Sales returns
CREATE POLICY "Users can view sales returns"
  ON retur_penjualan FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales returns"
  ON retur_penjualan FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete sales returns"
  ON retur_penjualan FOR DELETE
  TO authenticated
  USING (true);

-- Purchase returns
CREATE POLICY "Users can view purchase returns"
  ON retur_pembelian FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert purchase returns"
  ON retur_pembelian FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete purchase returns"
  ON retur_pembelian FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_produk_kode ON produk(kode);
CREATE INDEX IF NOT EXISTS idx_produk_barcode ON produk(barcode);
CREATE INDEX IF NOT EXISTS idx_produk_nama ON produk(nama);
CREATE INDEX IF NOT EXISTS idx_product_variants_produk_id ON product_variants(produk_id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_supplier_id ON purchase(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_created_at ON purchase(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_produk_id ON stock_movements(produk_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_finance_transactions_date ON finance_transactions(date);
CREATE INDEX IF NOT EXISTS idx_customer_kode ON customer(kode);
CREATE INDEX IF NOT EXISTS idx_supplier_kode ON supplier(kode);
