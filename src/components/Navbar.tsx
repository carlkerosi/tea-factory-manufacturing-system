import React from 'react';
import {
  LayoutDashboard,
  Leaf,
  Package,
  Ruler,
  Factory,
  Boxes,
  SendHorizontal,
  Users,
  Plus,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { AppStateData } from '../data/initialData';
import { SUPABASE_PROJECT_ID, isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRunWizard: () => void;
  data: AppStateData;
  onResetData: () => void;
  onExportData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenRunWizard,
  data,
  onResetData,
  onExportData,
}) => {
  // Compute summary indicators
  const totalBulkWt = data.teaBatches.reduce((acc, b) => acc + b.remainingWeightKg, 0);
  const totalPackagedUnits = data.finishedGoods.reduce((acc, g) => acc + g.currentUnits, 0);
  const lowStockMaterials = data.materials.filter((m) => m.stockQuantity <= m.minReorderLevel);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bulk-tea', label: 'Bulk Intake', icon: Leaf, badge: `${Math.round(totalBulkWt).toLocaleString()} kg` },
    { id: 'materials', label: 'Materials & BOM', icon: Package, alertCount: lowStockMaterials.length },
    { id: 'specs', label: 'Pack Specs', icon: Ruler },
    { id: 'runs', label: 'Production Runs', icon: Factory },
    { id: 'finished-goods', label: 'Finished Lots', icon: Boxes, badge: `${totalPackagedUnits.toLocaleString()}` },
    { id: 'dispatch', label: 'Dispatch', icon: SendHorizontal },
    { id: 'partners', label: 'Suppliers & Clients', icon: Users },
    {
      id: 'supabase',
      label: 'Supabase Data',
      icon: Database,
      badge: isSupabaseConfigured() ? 'Connected' : 'Config',
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-xs shrink-0">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                Kisii Highlands Tea Processors
              </h1>
              <span className="hidden md:inline-flex text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Plant MES
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-none mt-0.5">
              Bulk tea intake, 50g–5kg packaging lines &amp; lot traceability • Kisii, Kenya
            </p>
          </div>
        </div>

        {/* Global Operational Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Floor Summary Badge */}
          <div className="hidden xl:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Floor Bulk:</span>
              <span className="font-semibold text-slate-900 font-mono">
                {totalBulkWt.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Stocked:</span>
              <span className="font-semibold text-slate-900 font-mono">
                {totalPackagedUnits.toLocaleString()} units
              </span>
            </div>
            {lowStockMaterials.length > 0 && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1 text-amber-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lowStockMaterials.length} low stock</span>
                </div>
              </>
            )}
          </div>

          {/* Supabase Status Link */}
          <button
            onClick={() => onSelectTab('supabase')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer text-xs"
            title={`Supabase Database: ${SUPABASE_PROJECT_ID}`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-medium text-slate-700">Supabase:</span>
            <span className="font-mono text-[11px] text-emerald-700 font-semibold">Active</span>
          </button>

          {/* New Run Primary CTA */}
          <button
            onClick={onOpenRunWizard}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-3.5 py-1.5 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Packaging Run</span>
          </button>

          {/* Export & Reset Actions */}
          <div className="flex items-center border-l border-slate-200 pl-2 gap-1">
            <button
              onClick={onExportData}
              title="Backup system data to JSON"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('Reset all demo data to standard tea factory baseline? Custom entries will be reset.')) {
                  onResetData();
                }
              }}
              title="Reset to factory baseline demo data"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="border-t border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 overflow-x-auto py-1.5" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-900 shadow-2xs border border-slate-200/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                          : 'bg-slate-200/70 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {item.alertCount && item.alertCount > 0 ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-semibold">
                      {item.alertCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
