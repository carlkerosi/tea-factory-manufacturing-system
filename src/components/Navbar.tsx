import React from 'react';
import {
  LayoutDashboard,
  Leaf,
  Package,
  BookOpen,
  Ruler,
  Factory,
  Boxes,
  SendHorizontal,
  Users,
  PlusCircle,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { AppStateData } from '../data/initialData';

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
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'bulk-tea', label: 'Bulk Tea Intake', icon: Leaf, badge: `${Math.round(totalBulkWt)} kg` },
    { id: 'materials', label: 'Packing Materials', icon: Package, alertCount: lowStockMaterials.length },
    { id: 'research-guide', label: 'Materials Research', icon: BookOpen, highlight: true },
    { id: 'specs', label: 'Package Sizes (BOM)', icon: Ruler },
    { id: 'runs', label: 'Packaging Runs', icon: Factory },
    { id: 'finished-goods', label: 'Finished Lots', icon: Boxes, badge: `${totalPackagedUnits}` },
    { id: 'dispatch', label: 'Dispatch Orders', icon: SendHorizontal },
    { id: 'partners', label: 'Suppliers & Clients', icon: Users },
  ];

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm">
      {/* Top Banner with Brand and Global Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold shadow-inner">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                Kisii Highlands Tea Processors
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/80">
                Kisii, Kenya • Factory OS
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Bulk intake, 50g–kg packaging line control &amp; material traceability • Kisii Plant
            </p>
          </div>
        </div>

        {/* Live Operational Metrics & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs">
          <div className="hidden lg:flex items-center gap-3 bg-stone-800/80 px-3 py-1.5 rounded-md border border-stone-700/60">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Bulk Floor Tea</span>
              <span className="font-semibold text-emerald-400">{totalBulkWt.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</span>
            </div>
            <div className="h-6 w-px bg-stone-700" />
            <div>
              <span className="text-stone-400 block text-[10px] uppercase tracking-wider">Packaged Units</span>
              <span className="font-semibold text-stone-100">{totalPackagedUnits.toLocaleString()} packs</span>
            </div>
            <div className="h-6 w-px bg-stone-700" />
            <div className="flex items-center gap-1.5">
              {lowStockMaterials.length === 0 ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Materials OK
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> {lowStockMaterials.length} Low Material{lowStockMaterials.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* New Run Button */}
          <button
            onClick={onOpenRunWizard}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3.5 py-1.5 rounded-md text-xs shadow-sm transition-colors cursor-pointer"
            title="Start a packaging production run"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Packaging Run</span>
          </button>

          {/* Backup & Reset Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExportData}
              title="Backup system data to JSON"
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
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
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : item.highlight
                    ? 'text-amber-300 hover:text-white hover:bg-stone-800 bg-amber-950/40 border border-amber-800/60'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-900 text-emerald-100' : 'bg-stone-800 text-stone-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.alertCount && item.alertCount > 0 ? (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-stone-950 font-bold">
                    {item.alertCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
