import React, { useState, useMemo } from 'react';
import {
  Factory,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  Boxes,
  User,
  Filter,
} from 'lucide-react';
import { PackagingRun, BulkTeaBatch, PackagingSpec, PackingMaterial } from '../types';

interface PackagingRunsViewProps {
  runs: PackagingRun[];
  batches: BulkTeaBatch[];
  specs: PackagingSpec[];
  materials: PackingMaterial[];
  onOpenWizard: () => void;
  onPrintLotLabel: (lotNumber: string) => void;
}

export const PackagingRunsView: React.FC<PackagingRunsViewProps> = ({
  runs,
  batches,
  specs,
  materials,
  onOpenWizard,
  onPrintLotLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [packerFilter, setPackerFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(runs[0]?.id || null);

  // Collect unique packers across runs
  const uniquePackers = useMemo(() => {
    const set = new Set<string>();
    runs.forEach((r) => {
      const name = r.packerName || r.operatorName;
      if (name) set.add(name.split(' (')[0].trim());
    });
    return Array.from(set);
  }, [runs]);

  const filteredRuns = runs.filter((r) => {
    const batch = batches.find((b) => b.id === r.teaBatchId);
    const spec = specs.find((s) => s.id === r.specId);
    const packer = r.packerName || r.operatorName;

    // Search query match
    const matchesSearch =
      r.runNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.generatedLotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      packer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch && batch.grade.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (spec && spec.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    // Packer filter
    const matchesPacker =
      packerFilter === 'all' || packer.toLowerCase().includes(packerFilter.toLowerCase());

    // Unit / weight filter
    const matchesUnit =
      unitFilter === 'all' ||
      (unitFilter === 'grams' && (r.packWeightUnit === 'g' || r.netWeightG < 1000)) ||
      (unitFilter === 'kg' && (r.packWeightUnit === 'kg' || r.netWeightG >= 1000));

    return matchesSearch && matchesPacker && matchesUnit;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-emerald-700" />
            <span>Packaging Production Log &amp; Run History</span>
          </h2>
          <p className="text-xs text-stone-500">
            Comprehensive audit trail of bulk tea converted into custom weights (grams or kg) by assigned packers, tracking line loss and BOM materials.
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3.5 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <span>+ New Packaging Run</span>
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-3 rounded-lg border border-stone-200 flex flex-col md:flex-row items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search run #, lot #, tea grade, product, or packer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Filter by The One Packing */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="text-stone-500 font-medium whitespace-nowrap">Packer:</span>
          <select
            value={packerFilter}
            onChange={(e) => setPackerFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded px-2 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Packers ({uniquePackers.length})</option>
            {uniquePackers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Unit (Grams vs Kg) */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <Scale className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="text-stone-500 font-medium whitespace-nowrap">Unit:</span>
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded px-2 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Sizes (Grams &amp; Kg)</option>
            <option value="grams">Grams (&lt; 1 kg)</option>
            <option value="kg">Kilograms (&ge; 1 kg)</option>
          </select>
        </div>
      </div>

      {/* Runs List */}
      <div className="space-y-3">
        {filteredRuns.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-stone-200 text-center text-stone-400 text-xs">
            No packaging runs found matching your filters.
          </div>
        ) : (
          filteredRuns.map((run) => {
            const isExpanded = expandedRunId === run.id;
            const batch = batches.find((b) => b.id === run.teaBatchId);
            const spec = specs.find((s) => s.id === run.specId);
            const packer = run.packerName || run.operatorName;

            // Formatted pack weight label
            const displayWeight = run.packWeightValue
              ? `${run.packWeightValue} ${run.packWeightUnit || 'g'}`
              : `${run.netWeightG} g`;

            const isKg = run.packWeightUnit === 'kg' || run.netWeightG >= 1000;
            const is50g = run.netWeightG === 50;

            return (
              <div
                key={run.id}
                className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Collapsed Header Summary */}
                <div
                  onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                  className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-stone-100 text-stone-700 font-mono font-bold text-xs">
                      {run.runNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">
                          {spec?.productName || `${batch?.grade || 'Tea'} Packaged`}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isKg
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : is50g
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-800 text-white'
                          }`}
                        >
                          {displayWeight}
                        </span>

                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-700" />
                          <span>Packed by {packer.split(' (')[0]}</span>
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Batch: <span className="font-medium text-stone-800">{batch?.batchNumber}</span> ({batch?.grade}) •
                        Date: {run.date} • Line: {run.machineLine}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="font-mono font-bold text-stone-900 text-sm block">
                        {run.actualUnitsProduced.toLocaleString()} packs ({displayWeight})
                      </span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {run.teaActualUsedKg.toFixed(2)} kg tea used ({run.lossPercentage.toFixed(1)}% loss)
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="font-mono font-medium text-emerald-800 block text-xs">
                        Lot {run.generatedLotNumber}
                      </span>
                      <span className="text-[10px] text-stone-400">Exp: {run.expiryDate}</span>
                    </div>

                    <div className="text-stone-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-4 text-xs">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-md border border-stone-200">
                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase">Pack Net Weight</span>
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          {displayWeight}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono">
                          ({run.netWeightG}g net / pack)
                        </span>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase">The One Packing (Packer)</span>
                        <span className="font-bold text-amber-900 text-sm block flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          <span>{packer}</span>
                        </span>
                        <span className="text-[10px] text-stone-500">{run.machineLine}</span>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase">QC Tested Net Weight</span>
                        <span className="font-mono font-bold text-emerald-800 text-sm">
                          {run.qcSampleWeightG.toFixed(2)} g (Pass)
                        </span>
                        <span className="text-[10px] text-emerald-700 block">Verified hermetic seal</span>
                      </div>

                      <div>
                        <span className="text-stone-500 block text-[10px] uppercase">Bulk Tea Consumed</span>
                        <span className="font-mono font-bold text-stone-900 text-sm">
                          {run.teaActualUsedKg.toFixed(2)} kg
                        </span>
                        <span className="text-[10px] text-stone-400 block">
                          (Net {run.teaRequiredKg.toFixed(2)} kg + {run.teaLossKg.toFixed(2)} kg scrap)
                        </span>
                      </div>
                    </div>

                    {/* Materials Consumed Breakdown */}
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                        Packaging Material Breakdown &amp; Scrap Accounting
                      </h4>
                      <div className="bg-white rounded-md border border-stone-200 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px]">
                              <th className="py-2 px-3">Material Component</th>
                              <th className="py-2 px-3 text-right">Planned Qty</th>
                              <th className="py-2 px-3 text-right">Actual Consumed</th>
                              <th className="py-2 px-3 text-right">Machine Scrap</th>
                              <th className="py-2 px-3 text-right">Scrap Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {run.materialsConsumed.map((item, idx) => {
                              const mat = materials.find((m) => m.id === item.materialId);
                              const rate =
                                item.quantityUsed > 0
                                  ? ((item.quantityScrap / item.quantityUsed) * 100).toFixed(1)
                                  : '0.0';

                              return (
                                <tr key={idx}>
                                  <td className="py-2 px-3 font-medium text-stone-800">
                                    {mat?.name || 'Material Item'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono text-stone-600">
                                    {item.quantityPlanned} {mat?.unit || 'units'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                                    {item.quantityUsed} {mat?.unit || 'units'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono text-amber-700">
                                    {item.quantityScrap} {mat?.unit || 'units'}
                                  </td>
                                  <td className="py-2 px-3 text-right font-mono text-stone-500">
                                    {rate}%
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Quality Notes and Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-stone-600 italic">
                        {run.notes && <span>&ldquo;{run.notes}&rdquo;</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPrintLotLabel(run.generatedLotNumber)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium cursor-pointer shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Finished Lot Label ({displayWeight})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
