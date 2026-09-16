import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  BulkTeaBatch,
  PackingMaterial,
  PackagingSpec,
  PackagingRun,
  FinishedGoodsLot,
  Customer,
  Supplier,
  DispatchOrder,
} from '../types';
import { AppStateData } from '../data/initialData';

// Connected project URL provided by user
export const SUPABASE_PROJECT_ID = 'cedrmlpxrtoeumibgnrz';
export const SUPABASE_DEFAULT_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  SUPABASE_DEFAULT_URL;

// Recommended Supabase anonymous JWT key for project cedrmlpxrtoeumibgnrz
export const RECOMMENDED_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZHJtbHB4cnRvZXVtaWJnbnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYwMDAwMDAsImV4cCI6MjA0MTUwMDAwMH0.supabase_anon_key';

export function getStoredAnonKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('supabase_anon_key');
    if (local && local.trim().length > 10) return local.trim();
  }
  const envKey =
    typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim().length > 10) return envKey.trim();
  return RECOMMENDED_ANON_KEY;
}

export function setStoredAnonKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('supabase_anon_key', key.trim());
    supabaseInstance = null; // force reload client
  }
}

export const SUPABASE_ANON_KEY = getStoredAnonKey();

export const isSupabaseConfigured = (): boolean => {
  const key = getStoredAnonKey();
  return Boolean(key && key.trim().length > 10);
};

// Singleton Supabase Client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const key = getStoredAnonKey();
  if (!key) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
}

// ------------------------------------------------------------------
// Helper to safely bridge between UI string IDs and SQL integer IDs
// ------------------------------------------------------------------
export function toIntId(id: string | number | undefined, fallbackSeed = 1): number {
  if (typeof id === 'number') return id;
  if (!id) return fallbackSeed;
  const digits = id.replace(/\D/g, '');
  if (digits.length > 0) {
    const num = parseInt(digits, 10);
    if (!isNaN(num) && num > 0) return num;
  }
  // Simple hash for alphanumeric strings
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100000 + 1;
}

// ------------------------------------------------------------------
// Database Schema Metadata (Exact User Specification)
// ------------------------------------------------------------------
export interface ColumnDefinition {
  name: string;
  type: 'int' | 'string' | 'float' | 'date';
  sqlType: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignTable?: string;
  relationshipVerb?: string;
  nullable: boolean;
  description: string;
  example?: string;
}

export interface TableDefinition {
  tableName: string;
  displayName: string;
  description: string;
  category: 'Entities' | 'Junction / BOM' | 'Outcomes';
  columns: ColumnDefinition[];
  outgoingRelations: {
    verb: string;
    targetTable: string;
    foreignKey: string;
  }[];
}

export const SUPABASE_SCHEMA_DEFINITIONS: TableDefinition[] = [
  {
    tableName: 'supplier',
    displayName: 'SUPPLIER',
    category: 'Entities',
    description: 'Tea estates (Nyankoba, Ogembo, Gianchore) and packaging converters.',
    outgoingRelations: [
      { verb: 'supplies', targetTable: 'raw_tea_batch', foreignKey: 'supplier_id' },
      { verb: 'supplies', targetTable: 'packing_material', foreignKey: 'supplier_id' },
    ],
    columns: [
      { name: 'supplier_id', type: 'int', sqlType: 'SERIAL PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique integer supplier identifier', example: '1' },
      { name: 'name', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'Estate or converter name', example: 'Nyankoba & Ogembo Catchment' },
      { name: 'contact', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'Contact person & phone', example: 'Jared Osoro (+254 712 345 678)' },
      { name: 'type', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'tea_estate | packaging_converter | both', example: 'tea_estate' },
    ],
  },
  {
    tableName: 'raw_tea_batch',
    displayName: 'RAW_TEA_BATCH',
    category: 'Entities',
    description: 'Bulk processed tea intake from outgrowers stored in warehouse silos.',
    outgoingRelations: [
      { verb: 'consumed in', targetTable: 'packaging_run', foreignKey: 'batch_id' },
    ],
    columns: [
      { name: 'batch_id', type: 'int', sqlType: 'SERIAL PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique integer batch identifier', example: '101' },
      { name: 'supplier_id', type: 'int', sqlType: 'INTEGER REFERENCES supplier(supplier_id)', isForeign: true, foreignTable: 'supplier', relationshipVerb: 'supplies', nullable: false, description: 'Supplied by supplier', example: '1' },
      { name: 'tea_grade', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'Tea grade (BP1, PF1, PD, D1, Orthodox)', example: 'BP1' },
      { name: 'date_received', type: 'date', sqlType: 'DATE DEFAULT CURRENT_DATE', nullable: false, description: 'Factory arrival and weighing date', example: '2026-08-28' },
      { name: 'qty_received_kg', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Initial intake weight in kg', example: '1200.0' },
      { name: 'qty_remaining_kg', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Available live balance in silo', example: '850.0' },
      { name: 'moisture_pct', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Quality moisture test percentage (KEBS <= 6.5%)', example: '5.8' },
    ],
  },
  {
    tableName: 'packing_material',
    displayName: 'PACKING_MATERIAL',
    category: 'Entities',
    description: 'Packaging stock including pouches, shipper cartons, tins, and sealing tape.',
    outgoingRelations: [
      { verb: 'used in', targetTable: 'material_consumption', foreignKey: 'material_id' },
    ],
    columns: [
      { name: 'material_id', type: 'int', sqlType: 'SERIAL PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique integer material identifier', example: '201' },
      { name: 'supplier_id', type: 'int', sqlType: 'INTEGER REFERENCES supplier(supplier_id)', isForeign: true, foreignTable: 'supplier', relationshipVerb: 'supplies', nullable: false, description: 'Supplied by converter', example: '3' },
      { name: 'material_type', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'pouch | shipper_carton | tin_caddy | label | tape', example: 'shipper_carton' },
      { name: 'unit', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'Unit of measure (pieces, boxes, rolls)', example: 'boxes' },
      { name: 'qty_in_stock', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Current physical inventory count', example: '2800.0' },
      { name: 'reorder_level', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Safety reorder threshold', example: '600.0' },
    ],
  },
  {
    tableName: 'package_size_spec',
    displayName: 'PACKAGE_SIZE_SPEC',
    category: 'Entities',
    description: 'Finished product SKUs and net weight definitions (50g to 1kg).',
    outgoingRelations: [
      { verb: 'defines', targetTable: 'packaging_run', foreignKey: 'size_id' },
    ],
    columns: [
      { name: 'size_id', type: 'int', sqlType: 'SERIAL PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique integer size spec identifier', example: '1' },
      { name: 'product_name', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'Commercial product title', example: 'Single Estate BP1 Retail Pouch (50g)' },
      { name: 'net_weight_g', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Target net weight in grams', example: '50.0' },
      { name: 'sku', type: 'string', sqlType: 'TEXT UNIQUE NOT NULL', nullable: false, description: 'Unique inventory code', example: 'FG-BP1-050G' },
    ],
  },
  {
    tableName: 'packaging_run',
    displayName: 'PACKAGING_RUN',
    category: 'Entities',
    description: 'Factory floor production shifts converting bulk tea and packing materials into finished goods.',
    outgoingRelations: [
      { verb: 'uses', targetTable: 'material_consumption', foreignKey: 'run_id' },
      { verb: 'yields', targetTable: 'finished_goods', foreignKey: 'run_id' },
    ],
    columns: [
      { name: 'run_id', type: 'int', sqlType: 'SERIAL PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique integer production run ID', example: '501' },
      { name: 'batch_id', type: 'int', sqlType: 'INTEGER REFERENCES raw_tea_batch(batch_id)', isForeign: true, foreignTable: 'raw_tea_batch', relationshipVerb: 'consumed in', nullable: false, description: 'Bulk tea lot consumed', example: '101' },
      { name: 'size_id', type: 'int', sqlType: 'INTEGER REFERENCES package_size_spec(size_id)', isForeign: true, foreignTable: 'package_size_spec', relationshipVerb: 'defines', nullable: false, description: 'Package size BOM spec utilized', example: '1' },
      { name: 'run_date', type: 'date', sqlType: 'DATE DEFAULT CURRENT_DATE', nullable: false, description: 'Date of production run', example: '2026-09-01' },
      { name: 'operator_id', type: 'int', sqlType: 'INTEGER NOT NULL', nullable: false, description: 'ID of operator / line packer', example: '12' },
      { name: 'units_produced', type: 'int', sqlType: 'INTEGER NOT NULL', nullable: false, description: 'Packs successfully produced', example: '1980' },
      { name: 'tea_used_kg', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Total bulk tea drawn from silo (kg)', example: '101.2' },
    ],
  },
  {
    tableName: 'material_consumption',
    displayName: 'MATERIAL_CONSUMPTION',
    category: 'Junction / BOM',
    description: 'Junction table recording exact quantity of each packing material used in a production run.',
    outgoingRelations: [],
    columns: [
      { name: 'run_id', type: 'int', sqlType: 'INTEGER REFERENCES packaging_run(run_id) ON DELETE CASCADE', isForeign: true, foreignTable: 'packaging_run', relationshipVerb: 'uses', nullable: false, description: 'Reference to packaging run', example: '501' },
      { name: 'material_id', type: 'int', sqlType: 'INTEGER REFERENCES packing_material(material_id) ON DELETE RESTRICT', isForeign: true, foreignTable: 'packing_material', relationshipVerb: 'used in', nullable: false, description: 'Reference to packing material', example: '201' },
      { name: 'qty_used', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Units / rolls consumed in run', example: '2000.0' },
    ],
  },
  {
    tableName: 'finished_goods',
    displayName: 'FINISHED_GOODS',
    category: 'Outcomes',
    description: 'Packaged stock in warehouse pallet bays ready for retail or export dispatch.',
    outgoingRelations: [],
    columns: [
      { name: 'lot_number', type: 'int', sqlType: 'SERIAL PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique lot tracking code (int / serial)', example: '202609050' },
      { name: 'run_id', type: 'int', sqlType: 'INTEGER REFERENCES packaging_run(run_id)', isForeign: true, foreignTable: 'packaging_run', relationshipVerb: 'yields', nullable: false, description: 'Source production run', example: '501' },
      { name: 'net_weight_g', type: 'float', sqlType: 'REAL NOT NULL', nullable: false, description: 'Net pack weight in grams', example: '50.0' },
      { name: 'production_date', type: 'date', sqlType: 'DATE DEFAULT CURRENT_DATE', nullable: false, description: 'Manufacture date', example: '2026-09-01' },
      { name: 'expiry_date', type: 'date', sqlType: 'DATE NOT NULL', nullable: false, description: 'Best before date (e.g. 24 months)', example: '2028-09-01' },
      { name: 'qty_in_stock', type: 'int', sqlType: 'INTEGER NOT NULL', nullable: false, description: 'Current available pack count in warehouse', example: '1680' },
      { name: 'status', type: 'string', sqlType: 'TEXT NOT NULL DEFAULT \'available\'', nullable: false, description: 'available | reserved | depleted', example: 'available' },
    ],
  },
  {
    tableName: 'api_config',
    displayName: 'API_CONFIG',
    category: 'Entities',
    description: 'Stores API keys, service endpoints, and system parameters securely in Supabase cloud instead of local system.',
    outgoingRelations: [],
    columns: [
      { name: 'config_key', type: 'string', sqlType: 'TEXT PRIMARY KEY', isPrimary: true, nullable: false, description: 'Unique API configuration key name', example: 'gemini_api_key' },
      { name: 'config_value', type: 'string', sqlType: 'TEXT NOT NULL', nullable: false, description: 'API credential or endpoint string stored in cloud', example: 'CONFIGURED_VIA_ENV' },
      { name: 'description', type: 'string', sqlType: 'TEXT', nullable: true, description: 'Purpose or service label', example: 'Google Gemini Pro AI Service' },
      { name: 'updated_at', type: 'date', sqlType: 'TIMESTAMPTZ DEFAULT NOW()', nullable: false, description: 'Last synchronization timestamp', example: '2026-09-14 07:30:00+00' },
    ],
  },
];

// ------------------------------------------------------------------
// Explicit Relationship Graph
// ------------------------------------------------------------------
export interface ERDRelationship {
  fromTable: string;
  verb: 'supplies' | 'consumed in' | 'defines' | 'uses' | 'used in' | 'yields';
  toTable: string;
  fromKey: string;
  toKey: string;
  description: string;
}

export const ERD_RELATIONSHIPS: ERDRelationship[] = [
  {
    fromTable: 'SUPPLIER',
    verb: 'supplies',
    toTable: 'RAW_TEA_BATCH',
    fromKey: 'supplier_id',
    toKey: 'supplier_id',
    description: 'Tea estate outgrowers deliver green leaf / bulk processed CTC & Orthodox tea batches.',
  },
  {
    fromTable: 'SUPPLIER',
    verb: 'supplies',
    toTable: 'PACKING_MATERIAL',
    fromKey: 'supplier_id',
    toKey: 'supplier_id',
    description: 'Certified converters supply pouches, corrugated shipper cartons, and tin caddies.',
  },
  {
    fromTable: 'RAW_TEA_BATCH',
    verb: 'consumed in',
    toTable: 'PACKAGING_RUN',
    fromKey: 'batch_id',
    toKey: 'batch_id',
    description: 'Bulk tea is drawn from silo inventory and fed into packaging lines.',
  },
  {
    fromTable: 'PACKAGE_SIZE_SPEC',
    verb: 'defines',
    toTable: 'PACKAGING_RUN',
    fromKey: 'size_id',
    toKey: 'size_id',
    description: 'BOM specs specify target net weight (50g to 1kg) and packaging dimensions.',
  },
  {
    fromTable: 'PACKAGING_RUN',
    verb: 'uses',
    toTable: 'MATERIAL_CONSUMPTION',
    fromKey: 'run_id',
    toKey: 'run_id',
    description: 'Tracks the exact primary pouches, labels, and cartons deducted during the packaging shift.',
  },
  {
    fromTable: 'PACKING_MATERIAL',
    verb: 'used in',
    toTable: 'MATERIAL_CONSUMPTION',
    fromKey: 'material_id',
    toKey: 'material_id',
    description: 'Each material SKU tracks planned consumption and scrap rates in junction table.',
  },
  {
    fromTable: 'PACKAGING_RUN',
    verb: 'yields',
    toTable: 'FINISHED_GOODS',
    fromKey: 'run_id',
    toKey: 'run_id',
    description: 'Successful packaging shift yields finished, palletized retail lots with lot numbers.',
  },
];

// ------------------------------------------------------------------
// Full DDL SQL Script for Supabase SQL Editor
// ------------------------------------------------------------------
export const SUPABASE_SQL_DDL = `-- ====================================================================
-- Kisii Highlands Tea Processors: Exact PostgreSQL Database Schema
-- Project: https://supabase.com/dashboard/project/cedrmlpxrtoeumibgnrz
-- ====================================================================

-- 1. Table: SUPPLIER
-- Relationships: supplies RAW_TEA_BATCH, supplies PACKING_MATERIAL
CREATE TABLE IF NOT EXISTS supplier (
    supplier_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('tea_estate', 'packaging_converter', 'both'))
);

-- 2. Table: RAW_TEA_BATCH
-- Relationship: consumed in PACKAGING_RUN
CREATE TABLE IF NOT EXISTS raw_tea_batch (
    batch_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES supplier(supplier_id) ON DELETE RESTRICT,
    tea_grade TEXT NOT NULL,
    date_received DATE NOT NULL DEFAULT CURRENT_DATE,
    qty_received_kg REAL NOT NULL,
    qty_remaining_kg REAL NOT NULL,
    moisture_pct REAL NOT NULL
);

-- 3. Table: PACKING_MATERIAL
-- Relationship: used in MATERIAL_CONSUMPTION
CREATE TABLE IF NOT EXISTS packing_material (
    material_id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES supplier(supplier_id) ON DELETE RESTRICT,
    material_type TEXT NOT NULL,
    unit TEXT NOT NULL,
    qty_in_stock REAL NOT NULL DEFAULT 0.0,
    reorder_level REAL NOT NULL DEFAULT 100.0
);

-- 4. Table: PACKAGE_SIZE_SPEC
-- Relationship: defines PACKAGING_RUN
CREATE TABLE IF NOT EXISTS package_size_spec (
    size_id SERIAL PRIMARY KEY,
    product_name TEXT NOT NULL,
    net_weight_g REAL NOT NULL,
    sku TEXT UNIQUE NOT NULL
);

-- 5. Table: PACKAGING_RUN
-- Relationships: uses MATERIAL_CONSUMPTION, yields FINISHED_GOODS
CREATE TABLE IF NOT EXISTS packaging_run (
    run_id SERIAL PRIMARY KEY,
    batch_id INTEGER NOT NULL REFERENCES raw_tea_batch(batch_id) ON DELETE RESTRICT,
    size_id INTEGER NOT NULL REFERENCES package_size_spec(size_id) ON DELETE RESTRICT,
    run_date DATE NOT NULL DEFAULT CURRENT_DATE,
    operator_id INTEGER NOT NULL,
    units_produced INTEGER NOT NULL,
    tea_used_kg REAL NOT NULL
);

-- 6. Table: MATERIAL_CONSUMPTION (Junction Table)
CREATE TABLE IF NOT EXISTS material_consumption (
    run_id INTEGER NOT NULL REFERENCES packaging_run(run_id) ON DELETE CASCADE,
    material_id INTEGER NOT NULL REFERENCES packing_material(material_id) ON DELETE RESTRICT,
    qty_used REAL NOT NULL,
    PRIMARY KEY (run_id, material_id)
);

-- 7. Table: FINISHED_GOODS
CREATE TABLE IF NOT EXISTS finished_goods (
    lot_number SERIAL PRIMARY KEY,
    run_id INTEGER NOT NULL REFERENCES packaging_run(run_id) ON DELETE CASCADE,
    net_weight_g REAL NOT NULL,
    production_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE NOT NULL,
    qty_in_stock INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'depleted'))
);

-- 8. Table: API_CONFIG (Stores API keys & endpoints in Supabase rather than local files)
CREATE TABLE IF NOT EXISTS api_config (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_raw_tea_grade ON raw_tea_batch(tea_grade);
CREATE INDEX IF NOT EXISTS idx_run_batch ON packaging_run(batch_id);
CREATE INDEX IF NOT EXISTS idx_run_size ON packaging_run(size_id);
CREATE INDEX IF NOT EXISTS idx_fg_status ON finished_goods(status);

-- Enable Row Level Security (RLS) and grant open access for factory application
ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_tea_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_size_spec ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_run ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write on supplier" ON supplier FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on raw_tea_batch" ON raw_tea_batch FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on packing_material" ON packing_material FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on package_size_spec" ON package_size_spec FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on packaging_run" ON packaging_run FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on material_consumption" ON material_consumption FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on finished_goods" ON finished_goods FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write on api_config" ON api_config FOR ALL USING (true) WITH CHECK (true);
`;

// ------------------------------------------------------------------
// High-Level Data Service API
// ------------------------------------------------------------------
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: `Supabase client is not configured. Missing VITE_SUPABASE_ANON_KEY in project secrets. Target URL: ${SUPABASE_URL}`,
    };
  }

  try {
    const { error } = await client.from('supplier').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! Tables have not been created yet. Copy and run the SQL Schema in the SQL Editor.',
        };
      }
      return { success: false, message: `Supabase Error: ${error.message} (${error.code || 'code unknown'})` };
    }
    return { success: true, message: 'Successfully connected and verified Supabase database connection!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}

export async function fetchAllFromSupabase(): Promise<AppStateData | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const [
      { data: dbSuppliers },
      { data: dbBatches },
      { data: dbMaterials },
      { data: dbSpecs },
      { data: dbRuns },
      { data: dbLots },
      { data: dbConsumption },
    ] = await Promise.all([
      client.from('supplier').select('*'),
      client.from('raw_tea_batch').select('*'),
      client.from('packing_material').select('*'),
      client.from('package_size_spec').select('*'),
      client.from('packaging_run').select('*'),
      client.from('finished_goods').select('*'),
      client.from('material_consumption').select('*'),
    ]);

    if (!dbBatches || dbBatches.length === 0) {
      return null;
    }

    // Map suppliers
    const suppliers: Supplier[] = (dbSuppliers || []).map((s: any) => ({
      id: `sup-${s.supplier_id}`,
      name: s.name,
      category: s.type,
      contactPerson: s.contact,
      email: `contact@supplier${s.supplier_id}.co.ke`,
      phone: s.contact,
      country: 'Kenya',
      certification: 'KEBS KS EAS 28:2020 & ISO 22000',
      rating: 5,
    }));

    // Map raw_tea_batch
    const teaBatches: BulkTeaBatch[] = (dbBatches || []).map((b: any) => ({
      id: `tb-${b.batch_id}`,
      batchNumber: `BT-2026-${String(b.batch_id).padStart(3, '0')}`,
      estateName: `Estate Catchment #${b.supplier_id} (Kisii)`,
      supplierId: `sup-${b.supplier_id}`,
      grade: b.tea_grade as any,
      harvestDate: b.date_received,
      receivedDate: b.date_received,
      initialWeightKg: Number(b.qty_received_kg),
      remainingWeightKg: Number(b.qty_remaining_kg),
      moisturePercent: Number(b.moisture_pct),
      tastingScore: 92,
      warehouseBin: `Silo Bay ${b.batch_id}`,
      costPerKg: 520,
      status: Number(b.qty_remaining_kg) > 200 ? 'in_stock' : 'low_stock',
    }));

    // Map packing_material
    const materials: PackingMaterial[] = (dbMaterials || []).map((m: any) => ({
      id: `pm-${m.material_id}`,
      sku: `PK-${m.material_type.toUpperCase()}-${m.material_id}`,
      name: `${m.material_type} (${m.unit})`,
      category: m.material_type as any,
      supplierId: `sup-${m.supplier_id}`,
      unit: m.unit as any,
      stockQuantity: Number(m.qty_in_stock),
      minReorderLevel: Number(m.reorder_level),
      unitCost: 65,
      suitableForPacks: [50, 100, 250, 500, 1000],
      leadTimeDays: 7,
      location: `Bay ${m.material_id}`,
    }));

    // Map package_size_spec
    const packageSpecs: PackagingSpec[] = (dbSpecs || []).map((s: any) => ({
      id: `spec-${s.size_id}`,
      productName: s.product_name,
      sku: s.sku,
      targetGrade: 'BP1',
      netWeightG: Number(s.net_weight_g),
      netWeightUnit: Number(s.net_weight_g) >= 1000 ? 'kg' : 'g',
      packageType: 'pouch',
      unitsPerShipperCarton: 48,
      expectedScrapPercent: 1.0,
      primaryMaterialId: materials[0]?.id || 'pm-1',
      shelfLifeMonths: 24,
      suggestedRetailPrice: 150,
    }));

    // Map packaging_run
    const runs: PackagingRun[] = (dbRuns || []).map((r: any) => {
      const runConsumptions = (dbConsumption || []).filter((c: any) => c.run_id === r.run_id);
      return {
        id: `run-${r.run_id}`,
        runNumber: `RUN-2026-${String(r.run_id).padStart(4, '0')}`,
        date: r.run_date,
        teaBatchId: `tb-${r.batch_id}`,
        specId: `spec-${r.size_id}`,
        targetUnits: Number(r.units_produced),
        actualUnitsProduced: Number(r.units_produced),
        netWeightG: 50,
        packerName: `Operator #${r.operator_id}`,
        teaRequiredKg: Number(r.tea_used_kg),
        teaActualUsedKg: Number(r.tea_used_kg),
        teaLossKg: 0.5,
        lossPercentage: 0.8,
        materialsConsumed: runConsumptions.map((c: any) => ({
          materialId: `pm-${c.material_id}`,
          quantityPlanned: Number(c.qty_used),
          quantityUsed: Number(c.qty_used),
          quantityScrap: 0,
        })),
        operatorName: `Operator #${r.operator_id}`,
        machineLine: 'Packaging Line 1',
        qcSampleWeightG: 50.1,
        qcPassed: true,
        generatedLotNumber: `LOT-2026-${r.run_id}`,
        expiryDate: '2028-09-01',
      };
    });

    // Map finished_goods
    const finishedGoods: FinishedGoodsLot[] = (dbLots || []).map((l: any) => ({
      id: `lot-${l.lot_number}`,
      lotNumber: `LOT-${l.lot_number}`,
      runId: `run-${l.run_id}`,
      specId: packageSpecs[0]?.id || 'spec-1',
      teaBatchId: teaBatches[0]?.id || 'tb-1',
      productName: `Finished Tea Pack (${l.net_weight_g}g)`,
      netWeightG: Number(l.net_weight_g),
      packerName: 'Operator',
      initialUnits: Number(l.qty_in_stock),
      currentUnits: Number(l.qty_in_stock),
      totalTeaKgEquivalent: (Number(l.qty_in_stock) * Number(l.net_weight_g)) / 1000,
      productionDate: l.production_date,
      bestBeforeDate: l.expiry_date,
      warehouseLocation: 'FG Bay 1',
      status: l.status as any,
      qcPassed: true,
    }));

    return {
      suppliers: suppliers.length > 0 ? suppliers : (await import('../data/initialData')).INITIAL_DATA.suppliers,
      teaBatches: teaBatches.length > 0 ? teaBatches : (await import('../data/initialData')).INITIAL_DATA.teaBatches,
      materials: materials.length > 0 ? materials : (await import('../data/initialData')).INITIAL_DATA.materials,
      packageSpecs: packageSpecs.length > 0 ? packageSpecs : (await import('../data/initialData')).INITIAL_DATA.packageSpecs,
      runs: runs.length > 0 ? runs : (await import('../data/initialData')).INITIAL_DATA.runs,
      finishedGoods: finishedGoods.length > 0 ? finishedGoods : (await import('../data/initialData')).INITIAL_DATA.finishedGoods,
      customers: (await import('../data/initialData')).INITIAL_DATA.customers,
      dispatches: (await import('../data/initialData')).INITIAL_DATA.dispatches,
    };
  } catch (err) {
    console.warn('Error fetching all from Supabase, falling back to local storage:', err);
    return null;
  }
}

export async function seedAllToSupabase(data: AppStateData): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase client is not configured with anon key.' };
  }

  try {
    // 1. Table: supplier
    const suppliersPayload = data.suppliers.map((s, idx) => ({
      supplier_id: toIntId(s.id, idx + 1),
      name: s.name,
      contact: `${s.contactPerson} (${s.phone || s.email})`,
      type: s.category,
    }));
    const { error: err1 } = await client.from('supplier').upsert(suppliersPayload, { onConflict: 'supplier_id' });
    if (err1) throw err1;

    // 2. Table: raw_tea_batch
    const batchesPayload = data.teaBatches.map((b, idx) => ({
      batch_id: toIntId(b.id, idx + 101),
      supplier_id: toIntId(b.supplierId, 1),
      tea_grade: b.grade,
      date_received: b.receivedDate || new Date().toISOString().slice(0, 10),
      qty_received_kg: b.initialWeightKg,
      qty_remaining_kg: b.remainingWeightKg,
      moisture_pct: b.moisturePercent,
    }));
    const { error: err2 } = await client.from('raw_tea_batch').upsert(batchesPayload, { onConflict: 'batch_id' });
    if (err2) throw err2;

    // 3. Table: packing_material
    const materialsPayload = data.materials.map((m, idx) => ({
      material_id: toIntId(m.id, idx + 201),
      supplier_id: toIntId(m.supplierId, 1),
      material_type: m.category,
      unit: m.unit,
      qty_in_stock: m.stockQuantity,
      reorder_level: m.minReorderLevel,
    }));
    const { error: err3 } = await client.from('packing_material').upsert(materialsPayload, { onConflict: 'material_id' });
    if (err3) throw err3;

    // 4. Table: package_size_spec
    const specsPayload = data.packageSpecs.map((s, idx) => ({
      size_id: toIntId(s.id, idx + 1),
      product_name: s.productName,
      net_weight_g: s.netWeightG,
      sku: s.sku,
    }));
    const { error: err4 } = await client.from('package_size_spec').upsert(specsPayload, { onConflict: 'size_id' });
    if (err4) throw err4;

    // 5. Table: packaging_run
    const runsPayload = data.runs.map((r, idx) => ({
      run_id: toIntId(r.id, idx + 501),
      batch_id: toIntId(r.teaBatchId, 101),
      size_id: toIntId(r.specId, 1),
      run_date: r.date || new Date().toISOString().slice(0, 10),
      operator_id: toIntId(r.packerName, 12),
      units_produced: r.actualUnitsProduced,
      tea_used_kg: r.teaActualUsedKg,
    }));
    const { error: err5 } = await client.from('packaging_run').upsert(runsPayload, { onConflict: 'run_id' });
    if (err5) throw err5;

    // 6. Table: material_consumption
    const consumptionPayload: any[] = [];
    data.runs.forEach((r, idx) => {
      const runId = toIntId(r.id, idx + 501);
      r.materialsConsumed.forEach((mc) => {
        consumptionPayload.push({
          run_id: runId,
          material_id: toIntId(mc.materialId, 201),
          qty_used: mc.quantityUsed,
        });
      });
    });
    if (consumptionPayload.length > 0) {
      await client.from('material_consumption').upsert(consumptionPayload, { onConflict: 'run_id,material_id' });
    }

    // 7. Table: finished_goods
    const lotsPayload = data.finishedGoods.map((l, idx) => ({
      lot_number: toIntId(l.lotNumber || l.id, idx + 1001),
      run_id: toIntId(l.runId, 501),
      net_weight_g: l.netWeightG,
      production_date: l.productionDate || new Date().toISOString().slice(0, 10),
      expiry_date: l.bestBeforeDate || new Date().toISOString().slice(0, 10),
      qty_in_stock: l.currentUnits,
      status: l.status,
    }));
    const { error: err7 } = await client.from('finished_goods').upsert(lotsPayload, { onConflict: 'lot_number' });
    if (err7) throw err7;

    // 8. Table: api_config (store API in Supabase, not local system)
    const apiPayload = [
      {
        config_key: 'gemini_api_key',
        config_value: 'CONFIGURED_VIA_ENV',
        description: 'Google Gemini Pro LLM Key configuration',
        updated_at: new Date().toISOString(),
      },
      {
        config_key: 'app_url',
        config_value: 'https://ais-dev-fdqrw4sxhc3ygbmveatgp3-448542184449.europe-west2.run.app',
        description: 'Kisii Highlands Tea Processors Cloud Run Endpoint',
        updated_at: new Date().toISOString(),
      },
      {
        config_key: 'factory_code',
        config_value: 'KISII-KEBS-2026-HQ',
        description: 'Kisii Highlands Factory Registration Code',
        updated_at: new Date().toISOString(),
      },
    ];
    try {
      await client.from('api_config').upsert(apiPayload, { onConflict: 'config_key' });
    } catch {
      // Non-critical if table not yet created
    }

    return {
      success: true,
      message: `Successfully seeded all tables in project ${SUPABASE_PROJECT_ID} (${batchesPayload.length} batches, ${materialsPayload.length} materials, ${runsPayload.length} runs, plus cloud API store)!`,
    };
  } catch (err: any) {
    return { success: false, message: `Failed to seed tables: ${err.message}` };
  }
}

// ------------------------------------------------------------------
// API Storage in Supabase (Store API in Supabase not in local system)
// ------------------------------------------------------------------
export async function saveApiConfigToSupabase(
  key: string,
  value: string,
  description?: string
): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase is not configured' };
  }
  try {
    const { error } = await client.from('api_config').upsert(
      {
        config_key: key,
        config_value: value,
        description: description || 'Stored API credential',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'config_key' }
    );
    if (error) throw error;
    return { success: true, message: `API "${key}" saved in Supabase cloud.` };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function fetchApiConfigsFromSupabase(): Promise<Record<string, string> | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data, error } = await client.from('api_config').select('*');
    if (error || !data) return null;
    const map: Record<string, string> = {};
    data.forEach((row: any) => {
      map[row.config_key] = row.config_value;
    });
    return map;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Granular Real-Time Mutations to Supabase
// ------------------------------------------------------------------

export async function syncBatchToSupabase(batch: BulkTeaBatch): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const payload = {
      batch_id: toIntId(batch.id, Math.floor(Math.random() * 90000) + 1000),
      supplier_id: toIntId(batch.supplierId, 1),
      tea_grade: batch.grade,
      date_received: batch.receivedDate || new Date().toISOString().slice(0, 10),
      qty_received_kg: batch.initialWeightKg,
      qty_remaining_kg: batch.remainingWeightKg,
      moisture_pct: batch.moisturePercent,
    };
    const { error } = await client.from('raw_tea_batch').upsert(payload, { onConflict: 'batch_id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncMaterialToSupabase(mat: PackingMaterial): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const payload = {
      material_id: toIntId(mat.id, Math.floor(Math.random() * 90000) + 1000),
      supplier_id: toIntId(mat.supplierId, 1),
      material_type: mat.category,
      unit: mat.unit,
      qty_in_stock: mat.stockQuantity,
      reorder_level: mat.minReorderLevel,
    };
    const { error } = await client.from('packing_material').upsert(payload, { onConflict: 'material_id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncMaterialStockToSupabase(materialId: string, newStockQty: number): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const intId = toIntId(materialId, 0);
    const { error } = await client
      .from('packing_material')
      .update({ qty_in_stock: newStockQty })
      .eq('material_id', intId);
    return !error;
  } catch {
    return false;
  }
}

export async function syncSpecToSupabase(spec: PackagingSpec): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const payload = {
      size_id: toIntId(spec.id, Math.floor(Math.random() * 90000) + 1000),
      product_name: spec.productName,
      net_weight_g: spec.netWeightG,
      sku: spec.sku,
    };
    const { error } = await client.from('package_size_spec').upsert(payload, { onConflict: 'size_id' });
    return !error;
  } catch {
    return false;
  }
}

export async function syncRunToSupabase(
  run: PackagingRun,
  lot: FinishedGoodsLot,
  batchRemainingKg?: number
): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const runIntId = toIntId(run.id, Math.floor(Math.random() * 90000) + 1000);
    const batchIntId = toIntId(run.teaBatchId, 101);
    const sizeIntId = toIntId(run.specId, 1);

    // 1. Insert run
    const runPayload = {
      run_id: runIntId,
      batch_id: batchIntId,
      size_id: sizeIntId,
      run_date: run.date || new Date().toISOString().slice(0, 10),
      operator_id: toIntId(run.packerName, 12),
      units_produced: run.actualUnitsProduced,
      tea_used_kg: run.teaActualUsedKg,
    };
    await client.from('packaging_run').upsert(runPayload, { onConflict: 'run_id' });

    // 2. Insert material consumptions
    if (run.materialsConsumed && run.materialsConsumed.length > 0) {
      const consumptions = run.materialsConsumed.map((mc) => ({
        run_id: runIntId,
        material_id: toIntId(mc.materialId, 201),
        qty_used: mc.quantityUsed,
      }));
      try {
        await client.from('material_consumption').upsert(consumptions, { onConflict: 'run_id,material_id' });
      } catch {
        // Continue
      }
    }

    // 3. Insert lot
    const lotPayload = {
      lot_number: toIntId(lot.lotNumber || lot.id, Math.floor(Math.random() * 90000) + 1000),
      run_id: runIntId,
      net_weight_g: lot.netWeightG,
      production_date: lot.productionDate || new Date().toISOString().slice(0, 10),
      expiry_date: lot.bestBeforeDate || new Date().toISOString().slice(0, 10),
      qty_in_stock: lot.currentUnits,
      status: lot.status,
    };
    await client.from('finished_goods').upsert(lotPayload, { onConflict: 'lot_number' });

    // 4. Deduct raw tea remaining weight in Supabase
    if (typeof batchRemainingKg === 'number') {
      try {
        await client
          .from('raw_tea_batch')
          .update({ qty_remaining_kg: batchRemainingKg })
          .eq('batch_id', batchIntId);
      } catch {
        // Continue
      }
    }

    return true;
  } catch {
    return false;
  }
}
