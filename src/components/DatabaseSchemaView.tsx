import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Table,
  Key,
  Link as LinkIcon,
  Shield,
  Layers,
  ArrowRight,
  Code2,
  Check,
  GitCommit,
  Network,
  GitBranch,
} from 'lucide-react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  isSupabaseConfigured,
  SUPABASE_SCHEMA_DEFINITIONS,
  ERD_RELATIONSHIPS,
  SUPABASE_SQL_DDL,
  testConnection,
  seedAllToSupabase,
  fetchAllFromSupabase,
  RECOMMENDED_ANON_KEY,
  getStoredAnonKey,
  setStoredAnonKey,
} from '../lib/supabase';
import { AppStateData } from '../data/initialData';

interface DatabaseSchemaViewProps {
  data: AppStateData;
  onSyncData: (newData: AppStateData) => void;
  showToast: (text: string, type?: 'success' | 'info') => void;
}

export const DatabaseSchemaView: React.FC<DatabaseSchemaViewProps> = ({
  data,
  onSyncData,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'erd' | 'tables' | 'sql' | 'api'>('erd');
  const [selectedTable, setSelectedTable] = useState<string>('packaging_run');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false });

  const isConfigured = isSupabaseConfigured();

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_DDL);
    setCopiedSql(true);
    showToast('Exact Supabase SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await testConnection();
    setIsTesting(false);
    setConnectionStatus({
      tested: true,
      success: result.success,
      message: result.message,
    });
    if (result.success) {
      showToast('Supabase connection verified successfully!', 'success');
    } else {
      showToast(result.message, 'info');
    }
  };

  const handleSeedSupabase = async () => {
    if (!isConfigured) {
      showToast(
        'Please add VITE_SUPABASE_ANON_KEY to your project secrets before seeding.',
        'info'
      );
      return;
    }
    setIsSeeding(true);
    const result = await seedAllToSupabase(data);
    setIsSeeding(false);
    if (result.success) {
      showToast(result.message, 'success');
      setConnectionStatus({ tested: true, success: true, message: result.message });
    } else {
      showToast(result.message, 'info');
    }
  };

  const handleFetchFromSupabase = async () => {
    if (!isConfigured) {
      showToast('VITE_SUPABASE_ANON_KEY required in settings.', 'info');
      return;
    }
    const freshData = await fetchAllFromSupabase();
    if (freshData) {
      onSyncData(freshData);
      showToast('Loaded latest records from Supabase!', 'success');
    } else {
      showToast('No existing records found in Supabase or tables need schema creation.', 'info');
    }
  };

  const currentDef =
    SUPABASE_SCHEMA_DEFINITIONS.find((t) => t.tableName === selectedTable) ||
    SUPABASE_SCHEMA_DEFINITIONS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Supabase Connection Info */}
      <div className="bg-white text-slate-900 rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-700 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Supabase PostgreSQL Data Architecture
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  Project: {SUPABASE_PROJECT_ID}
                </span>
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Cloud Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Key Pending in Settings
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Connected to endpoint:{' '}
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-emerald-700 underline inline-flex items-center gap-1 hover:text-emerald-800"
                >
                  {SUPABASE_URL}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSeedSupabase}
              disabled={isSeeding}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Upload factory state into Supabase"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Seed to Supabase</span>
            </button>

            <a
              href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
              target="_blank"
              rel="noreferrer"
              className="bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Open SQL Editor</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Connection status report */}
        {connectionStatus.tested && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
              connectionStatus.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {connectionStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="font-mono">{connectionStatus.message}</span>
          </div>
        )}
      </div>

      {/* Auto-filled Environment & Secret Variables Panel */}
      <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900 text-sm">
                Configured Environment &amp; Secret Variables
              </span>
              <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-filled
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              These variables are auto-filled in <code>/.env</code>, <code>/.env.example</code>, and the application runtime.
            </p>
          </div>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Supabase API Keys Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-stone-800">VITE_SUPABASE_URL</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Active</span>
            </div>
            <div className="font-mono text-stone-600 break-all text-[11px] select-all bg-white p-2 rounded border border-stone-200">
              {SUPABASE_URL}
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-stone-800">VITE_SUPABASE_ANON_KEY</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Populated</span>
            </div>
            <div className="font-mono text-stone-600 break-all text-[11px] select-all bg-white p-2 rounded border border-stone-200 line-clamp-1">
              {getStoredAnonKey().slice(0, 45)}...
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-stone-800">APP_URL</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Runtime Injected</span>
            </div>
            <div className="font-mono text-stone-600 break-all text-[11px] select-all bg-white p-2 rounded border border-stone-200">
              https://ais-dev-fdqrw4sxhc3ygbmveatgp3-448542184449.europe-west2.run.app
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-stone-800">GEMINI_API_KEY</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Injected</span>
            </div>
            <div className="font-mono text-stone-600 break-all text-[11px] select-all bg-white p-2 rounded border border-stone-200">
              •••••••••••••••••••• (Configured via Environment)
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'erd'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Entity Relationship Diagram (ERD)</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'tables'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Table Schemas ({SUPABASE_SCHEMA_DEFINITIONS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Exact SQL DDL Script</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>API &amp; Client Usage</span>
          </button>
        </div>

        {activeTab === 'sql' && (
          <button
            onClick={handleCopySql}
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer shadow-xs"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Interactive ERD & Flowchart */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          {/* Visual Entity Flowchart */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Factory Relational Entity Graph</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-normal">
                    7 Tables • Strict Relational Integrity
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Visual mapping of all entity models and junction relationships. Click any table to inspect its schema.
                </p>
              </div>
            </div>

            {/* Visual Graph Layout */}
            <div className="space-y-8 bg-stone-50/80 p-6 rounded-xl border border-stone-200">
              {/* Level 1: Ingestion */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Level 1: Upstream Supply &amp; Bill of Materials
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Table: SUPPLIER */}
                  <div
                    onClick={() => {
                      setSelectedTable('supplier');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-emerald-500/40 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                        SUPPLIER
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">4 fields</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-amber-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> supplier_id (int, PK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">name (string)</div>
                      <div className="text-stone-600 font-mono text-[11px]">contact (string)</div>
                      <div className="text-stone-600 font-mono text-[11px]">type (string)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        supplies &rarr; RAW_TEA_BATCH
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        supplies &rarr; PACKING_MATERIAL
                      </span>
                    </div>
                  </div>

                  {/* Table: RAW_TEA_BATCH */}
                  <div
                    onClick={() => {
                      setSelectedTable('raw_tea_batch');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-stone-300 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        RAW_TEA_BATCH
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">7 fields</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-amber-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> batch_id (int, PK)
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-blue-800">
                        <LinkIcon className="w-3 h-3 text-blue-600" /> supplier_id (int, FK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">tea_grade (string)</div>
                      <div className="text-stone-600 font-mono text-[11px]">qty_received_kg (float)</div>
                      <div className="text-stone-600 font-mono text-[11px]">qty_remaining_kg (float)</div>
                      <div className="text-stone-600 font-mono text-[11px]">moisture_pct (float)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                        consumed in &rarr; PACKAGING_RUN
                      </span>
                    </div>
                  </div>

                  {/* Table: PACKAGE_SIZE_SPEC */}
                  <div
                    onClick={() => {
                      setSelectedTable('package_size_spec');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-stone-300 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        PACKAGE_SIZE_SPEC
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">4 fields</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-amber-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> size_id (int, PK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">product_name (string)</div>
                      <div className="text-stone-600 font-mono text-[11px]">net_weight_g (float)</div>
                      <div className="text-stone-600 font-mono text-[11px]">sku (string, UNIQUE)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-medium">
                        defines &rarr; PACKAGING_RUN
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 2: Manufacturing Execution */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  Level 2: Factory Packaging Line &amp; Material Consumption
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Table: PACKING_MATERIAL */}
                  <div
                    onClick={() => {
                      setSelectedTable('packing_material');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-stone-300 hover:border-emerald-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                        PACKING_MATERIAL
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">6 fields</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-amber-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> material_id (int, PK)
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-blue-800">
                        <LinkIcon className="w-3 h-3 text-blue-600" /> supplier_id (int, FK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">material_type (string)</div>
                      <div className="text-stone-600 font-mono text-[11px]">unit (string)</div>
                      <div className="text-stone-600 font-mono text-[11px]">qty_in_stock (float)</div>
                      <div className="text-stone-600 font-mono text-[11px]">reorder_level (float)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-medium">
                        used in &rarr; MATERIAL_CONSUMPTION
                      </span>
                    </div>
                  </div>

                  {/* Table: PACKAGING_RUN */}
                  <div
                    onClick={() => {
                      setSelectedTable('packaging_run');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-amber-500/50 hover:border-amber-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-amber-950 bg-amber-100 px-2 py-0.5 rounded">
                        PACKAGING_RUN
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">7 fields</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-amber-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> run_id (int, PK)
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-blue-800">
                        <LinkIcon className="w-3 h-3 text-blue-600" /> batch_id (int, FK)
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-blue-800">
                        <LinkIcon className="w-3 h-3 text-blue-600" /> size_id (int, FK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">run_date (date)</div>
                      <div className="text-stone-600 font-mono text-[11px]">operator_id (int)</div>
                      <div className="text-stone-600 font-mono text-[11px]">units_produced (int)</div>
                      <div className="text-stone-600 font-mono text-[11px]">tea_used_kg (float)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                      <span className="text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded font-medium">
                        uses &rarr; MATERIAL_CONSUMPTION
                      </span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                        yields &rarr; FINISHED_GOODS
                      </span>
                    </div>
                  </div>

                  {/* Table: MATERIAL_CONSUMPTION (Junction) */}
                  <div
                    onClick={() => {
                      setSelectedTable('material_consumption');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-purple-400/50 hover:border-purple-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-purple-950 bg-purple-100 px-2 py-0.5 rounded">
                        MATERIAL_CONSUMPTION
                      </span>
                      <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                        Junction
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-blue-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> run_id (int, PK/FK)
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-blue-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> material_id (int, PK/FK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">qty_used (float)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <p className="text-[10px] text-stone-500">
                        Maps exact consumption of pouches, boxes &amp; tape for each production run.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Level 3: Output */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Level 3: Finished Product Lots
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Table: FINISHED_GOODS */}
                  <div
                    onClick={() => {
                      setSelectedTable('finished_goods');
                      setActiveTab('tables');
                    }}
                    className="bg-white p-4 rounded-lg border-2 border-blue-400/50 hover:border-blue-600 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-950 bg-blue-100 px-2 py-0.5 rounded">
                        FINISHED_GOODS
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">7 fields</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-amber-800 font-bold">
                        <Key className="w-3 h-3 text-amber-600" /> lot_number (int, PK)
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-blue-800">
                        <LinkIcon className="w-3 h-3 text-blue-600" /> run_id (int, FK)
                      </div>
                      <div className="text-stone-600 font-mono text-[11px]">net_weight_g (float)</div>
                      <div className="text-stone-600 font-mono text-[11px]">production_date (date)</div>
                      <div className="text-stone-600 font-mono text-[11px]">expiry_date (date)</div>
                      <div className="text-stone-600 font-mono text-[11px]">qty_in_stock (int)</div>
                      <div className="text-stone-600 font-mono text-[11px]">status (string)</div>
                    </div>
                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                        yielded from &larr; PACKAGING_RUN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Relationship Audit Table */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Explicit Relationship Dictionary
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-medium">
                    <th className="py-2.5 px-3">From Table</th>
                    <th className="py-2.5 px-3">Relationship Verb</th>
                    <th className="py-2.5 px-3">To Table</th>
                    <th className="py-2.5 px-3">Foreign Key Reference</th>
                    <th className="py-2.5 px-3">Business Logic Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {ERD_RELATIONSHIPS.map((rel, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/70">
                      <td className="py-2.5 px-3 font-bold text-stone-900">{rel.fromTable}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                          {rel.verb}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">{rel.toTable}</td>
                      <td className="py-2.5 px-3 text-blue-700 text-[11px]">
                        {rel.fromKey} = {rel.toKey}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-stone-600 text-[11px]">
                        {rel.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Table Schemas Explorer */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              Database Tables
            </h3>
            <div className="space-y-1.5">
              {SUPABASE_SCHEMA_DEFINITIONS.map((tbl) => {
                const isSelected = selectedTable === tbl.tableName;
                return (
                  <button
                    key={tbl.tableName}
                    onClick={() => setSelectedTable(tbl.tableName)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-emerald-200 hover:bg-stone-50/70'
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-stone-900">
                        {tbl.displayName}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                        {tbl.category}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {tbl.columns.length} cols
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 mt-4 space-y-2">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" />
                Row-Level Security (RLS)
              </div>
              <p className="text-[11px] leading-relaxed">
                All 7 tables have Row Level Security enabled with unrestricted policies for factory operational access.
              </p>
            </div>
          </div>

          {/* Table Details */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                      public.{currentDef.tableName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                      {currentDef.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {currentDef.description}
                  </p>
                </div>
                <div className="text-xs font-mono text-stone-500">
                  {currentDef.columns.length} Defined Columns
                </div>
              </div>

              {/* Column Table */}
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50/80 text-stone-600 font-medium">
                      <th className="py-2.5 px-3">Column Name</th>
                      <th className="py-2.5 px-3">Specified Type</th>
                      <th className="py-2.5 px-3">Key / Constraint</th>
                      <th className="py-2.5 px-3">PostgreSQL SQL Definition</th>
                      <th className="py-2.5 px-3">Example Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {currentDef.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-stone-50/60">
                        <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                          {col.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-800 font-bold">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-3">
                          {col.isPrimary && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                              <Key className="w-3 h-3 text-amber-700" /> PK
                            </span>
                          )}
                          {col.isForeign && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                              <LinkIcon className="w-3 h-3 text-blue-700" /> FK &rarr; {col.foreignTable}
                            </span>
                          )}
                          {!col.isPrimary && !col.isForeign && (
                            <span className="text-stone-400 font-mono text-[11px]">
                              {col.nullable ? 'nullable' : 'NOT NULL'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-600 text-[11px]">
                          {col.sqlType}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-stone-500 text-[11px]">
                          {col.example || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Complete SQL DDL */}
      {activeTab === 'sql' && (
        <div className="bg-stone-950 rounded-lg p-5 border border-stone-800 text-stone-200 font-mono text-xs shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div>
              <span className="text-emerald-400 font-bold text-sm">Exact PostgreSQL DDL Script</span>
              <p className="text-stone-400 text-xs mt-0.5">
                Ready to execute in Supabase SQL Editor. Creates all 7 tables with relationships, foreign keys, and RLS policies.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
            </button>
          </div>

          <pre className="overflow-x-auto max-h-[550px] p-4 bg-stone-900/90 rounded border border-stone-800 text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-stone-700">
            {SUPABASE_SQL_DDL}
          </pre>
        </div>
      )}

      {/* Tab 4: API & Client Usage */}
      {activeTab === 'api' && (
        <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Supabase TypeScript API Integration
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Code snippets using the configured Supabase client in this applet.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-stone-900 text-stone-200 font-mono text-xs">
              <div className="text-stone-400 mb-2">// 1. Query Raw Tea Batches with Outgrower Supplier</div>
              <pre className="text-emerald-400 overflow-x-auto">
{`import { getSupabaseClient } from './lib/supabase';

const supabase = getSupabaseClient();
const { data: batches, error } = await supabase
  .from('raw_tea_batch')
  .select(\`
    batch_id,
    tea_grade,
    qty_remaining_kg,
    moisture_pct,
    supplier:supplier_id ( name, contact )
  \`);`}
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-stone-900 text-stone-200 font-mono text-xs">
              <div className="text-stone-400 mb-2">// 2. Record a Packaging Run with Material Consumption</div>
              <pre className="text-emerald-400 overflow-x-auto">
{`// Create Packaging Run
const { data: run, error: runError } = await supabase
  .from('packaging_run')
  .insert({
    batch_id: 101,
    size_id: 1,
    run_date: '2026-09-01',
    operator_id: 12,
    units_produced: 1980,
    tea_used_kg: 101.2
  })
  .select()
  .single();

// Record Junction Material Consumption
await supabase.from('material_consumption').insert([
  { run_id: run.run_id, material_id: 201, qty_used: 2000 },
  { run_id: run.run_id, material_id: 202, qty_used: 42 }
]);

// Yield Finished Goods Lot
await supabase.from('finished_goods').insert({
  run_id: run.run_id,
  net_weight_g: 50.0,
  production_date: '2026-09-01',
  expiry_date: '2028-09-01',
  qty_in_stock: 1980,
  status: 'available'
});`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
