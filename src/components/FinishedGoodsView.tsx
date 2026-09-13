import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  Printer,
  ShieldCheck,
  GitFork,
  Calendar,
  Layers,
  Scale,
  SendHorizontal,
  ChevronRight,
  ExternalLink,
  User,
} from 'lucide-react';
import {
  FinishedGoodsLot,
  PackagingRun,
  BulkTeaBatch,
  PackagingSpec,
  PackingMaterial,
  DispatchOrder,
  Customer,
} from '../types';

interface FinishedGoodsViewProps {
  lots: FinishedGoodsLot[];
  runs: PackagingRun[];
  batches: BulkTeaBatch[];
  specs: PackagingSpec[];
  materials: PackingMaterial[];
  dispatches: DispatchOrder[];
  customers: Customer[];
  onPrintLabel: (lotNumber: string) => void;
}

export const FinishedGoodsView: React.FC<FinishedGoodsViewProps> = ({
  lots,
  runs,
  batches,
  specs,
  materials,
  dispatches,
  customers,
  onPrintLabel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('all');
  const [selectedPackerFilter, setSelectedPackerFilter] = useState<string>('all');
  const [activeTraceLot, setActiveTraceLot] = useState<FinishedGoodsLot | null>(null);

  // Extract unique packers from finished goods
  const uniquePackers = useMemo(() => {
    const set = new Set<string>();
    lots.forEach((l) => {
      const run = runs.find((r) => r.generatedLotNumber === l.lotNumber);
      const name = l.packerName || run?.packerName || run?.operatorName;
      if (name) set.add(name.split(' (')[0].trim());
    });
    return Array.from(set);
  }, [lots, runs]);

  const filteredLots = lots.filter((lot) => {
    const run = runs.find((r) => r.generatedLotNumber === lot.lotNumber);
    const packer = lot.packerName || run?.packerName || run?.operatorName || '';

    const matchesSearch =
      lot.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.warehouseLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      packer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSize =
      selectedSizeFilter === 'all' ||
      (selectedSizeFilter === '50' && lot.netWeightG === 50) ||
      (selectedSizeFilter === '100' && lot.netWeightG === 100) ||
      (selectedSizeFilter === '250' && lot.netWeightG === 250) ||
      (selectedSizeFilter === '1000' && lot.netWeightG === 1000) ||
      (selectedSizeFilter === 'kg' && lot.netWeightG >= 1000);

    const matchesPacker =
      selectedPackerFilter === 'all' ||
      packer.toLowerCase().includes(selectedPackerFilter.toLowerCase());

    return matchesSearch && matchesSize && matchesPacker;
  });

  // Calculate totals
  const totalUnits = lots.reduce((acc, l) => acc + l.currentUnits, 0);
  const totalTeaKg = lots.reduce((acc, l) => acc + l.totalTeaKgEquivalent, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-700" />
            <span>Packaged Finished Goods &amp; Lot Traceability</span>
          </h2>
          <p className="text-xs text-stone-500">
            Real-time warehouse inventory of packaged tea in custom weights (grams or kg) packed by line operators, with complete farm-to-shelf traceability.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 px-3 py-1.5 rounded-md border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Warehouse Stock</span>
            <span className="font-mono font-bold text-stone-900">{totalUnits.toLocaleString()} units</span>
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Bulk Equivalent</span>
            <span className="font-mono font-bold text-emerald-800">{totalTeaKg.toFixed(1)} kg tea</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search lot #, product name, warehouse location, packer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Filter by Size */}
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-emerald-700" />
          <span className="text-stone-500 font-medium">Pack Weight:</span>
          <select
            value={selectedSizeFilter}
            onChange={(e) => setSelectedSizeFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Sizes (Grams &amp; Kg)</option>
            <option value="50">50g (Focus)</option>
            <option value="100">100g</option>
            <option value="250">250g</option>
            <option value="1000">1.0 kg (1000g)</option>
            <option value="kg">All &ge; 1 kg Bulk Bags</option>
          </select>
        </div>

        {/* Filter by The One Packing */}
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-700" />
          <span className="text-stone-500 font-medium">Packer:</span>
          <select
            value={selectedPackerFilter}
            onChange={(e) => setSelectedPackerFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Packers ({uniquePackers.length})</option>
            {uniquePackers.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Finished Lots Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Lot Identifier</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Net Pack Weight</th>
                <th className="py-3 px-4">The One Packing</th>
                <th className="py-3 px-4 text-right">Available Packs</th>
                <th className="py-3 px-4 text-right">Tea Equivalent</th>
                <th className="py-3 px-4">Packaged Date</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredLots.map((lot) => {
                const run = runs.find((r) => r.generatedLotNumber === lot.lotNumber);
                const packer = lot.packerName || run?.packerName || run?.operatorName || 'Packer';

                const displayWeight = lot.packWeightValue
                  ? `${lot.packWeightValue} ${lot.packWeightUnit || 'g'}`
                  : lot.netWeightG >= 1000
                  ? `${(lot.netWeightG / 1000).toFixed(1)} kg`
                  : `${lot.netWeightG} g`;

                const is50g = lot.netWeightG === 50;
                const isKg = lot.packWeightUnit === 'kg' || lot.netWeightG >= 1000;

                return (
                  <tr key={lot.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-stone-900 block">{lot.lotNumber}</span>
                      <span className="text-[10px] text-emerald-700 font-medium">QC Certified</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900 block">{lot.productName}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded font-mono font-bold ${
                          isKg
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : is50g
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {displayWeight}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-stone-800 flex items-center gap-1">
                        <User className="w-3 h-3 text-amber-700" />
                        <span>{packer.split(' (')[0]}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      {lot.currentUnits.toLocaleString()}{' '}
                      <span className="text-[11px] font-normal text-stone-500">
                        ({lot.initialUnits} initial)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      {lot.totalTeaKgEquivalent.toFixed(1)} kg
                    </td>
                    <td className="py-3 px-4 text-stone-600">{lot.productionDate}</td>
                    <td className="py-3 px-4 text-stone-700 font-mono text-[11px]">{lot.warehouseLocation}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setActiveTraceLot(lot)}
                          className="text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          title="View Full Genealogy"
                        >
                          <GitFork className="w-3 h-3 text-emerald-700" />
                          <span>Trace</span>
                        </button>
                        <button
                          onClick={() => onPrintLabel(lot.lotNumber)}
                          className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                          title="Print Pack Label"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Label</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Lot Genealogy Traceability Modal */}
      {activeTraceLot && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-emerald-700" />
                  <span>Full Lineage Traceability: {activeTraceLot.lotNumber}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {activeTraceLot.productName} • Net Weight:{' '}
                  {activeTraceLot.packWeightValue
                    ? `${activeTraceLot.packWeightValue} ${activeTraceLot.packWeightUnit || 'g'}`
                    : `${activeTraceLot.netWeightG}g`}
                </p>
              </div>
              <button
                onClick={() => setActiveTraceLot(null)}
                className="text-stone-400 hover:text-stone-700 text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Traceability Flow Tree */}
            {(() => {
              const run = runs.find((r) => r.generatedLotNumber === activeTraceLot.lotNumber);
              const batch = batches.find((b) => b.id === (run?.teaBatchId || activeTraceLot.teaBatchId));
              const spec = specs.find((s) => s.id === activeTraceLot.specId);
              const lotDispatches = dispatches.filter((d) =>
                d.items.some((i) => i.lotId === activeTraceLot.id)
              );
              const packer = activeTraceLot.packerName || run?.packerName || run?.operatorName || 'Packer';

              return (
                <div className="space-y-4 text-xs">
                  {/* Step 1: Raw Tea Origin */}
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      1. Raw Bulk Tea Intake &amp; Plantation Origin
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-400 block">Batch Number</span>
                        <span className="font-mono font-bold text-stone-900">{batch?.batchNumber || 'Batch'}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Estate / Origin</span>
                        <span className="font-semibold text-stone-800">{batch?.estateName}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Tea Grade</span>
                        <span className="font-mono font-bold text-emerald-800">{batch?.grade}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Moisture at Intake</span>
                        <span className="font-mono font-bold text-emerald-800">{batch?.moisturePercent}%</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Intake Date</span>
                        <span className="text-stone-700">{batch?.receivedDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Packaging Line Execution */}
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      2. Packaging Line Execution &amp; The One Packing
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-400 block">Production Run #</span>
                        <span className="font-mono font-bold text-stone-900">{run?.runNumber || 'Run'}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">The One Packing (Packer)</span>
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-700" />
                          <span>{packer}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Packaging Date</span>
                        <span className="text-stone-800">{run?.date}</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Certified Net Weight</span>
                        <span className="font-mono font-bold text-stone-900">
                          {activeTraceLot.packWeightValue
                            ? `${activeTraceLot.packWeightValue} ${activeTraceLot.packWeightUnit || 'g'}`
                            : `${activeTraceLot.netWeightG} g`}
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Sample QC Weight</span>
                        <span className="font-mono font-bold text-emerald-800">
                          {run?.qcSampleWeightG.toFixed(2)} g (Pass)
                        </span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Line Station</span>
                        <span className="text-stone-800">{run?.machineLine}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Packaging Materials Used */}
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      3. Packaging Component Traceability (BOM)
                    </span>
                    <div className="space-y-1 text-[11px]">
                      {run?.materialsConsumed.map((mc, idx) => {
                        const mat = materials.find((m) => m.id === mc.materialId);
                        return (
                          <div key={idx} className="flex justify-between text-stone-700">
                            <span>{mat?.name || 'Packaging Component'}:</span>
                            <span className="font-mono font-semibold text-stone-900">
                              {mc.quantityUsed} consumed ({mc.quantityScrap} scrap)
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 4: Dispatch / Customers Shipped */}
                  <div className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      4. Customer Dispatch &amp; Fulfillment
                    </span>
                    {lotDispatches.length === 0 ? (
                      <p className="text-stone-400 text-[11px]">
                        No units dispatched yet. All {activeTraceLot.currentUnits} units currently held in warehouse.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {lotDispatches.map((dsp) => {
                          const cust = customers.find((c) => c.id === dsp.customerId);
                          const item = dsp.items.find((i) => i.lotId === activeTraceLot.id);
                          return (
                            <div
                              key={dsp.id}
                              className="flex items-center justify-between p-2 rounded bg-white border border-stone-200"
                            >
                              <div>
                                <span className="font-mono font-bold text-stone-900 block">
                                  {dsp.dispatchNumber} • {cust?.companyName}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  Carrier: {dsp.carrier} • Date: {dsp.dispatchDate}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-emerald-800 text-xs">
                                {item?.unitsDispatched} packs ({item?.totalTeaWeightKg.toFixed(1)} kg)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
