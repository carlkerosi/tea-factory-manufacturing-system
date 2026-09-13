import React, { useState } from 'react';
import {
  Scale,
  Boxes,
  Factory,
  SendHorizontal,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Package,
  Ruler,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import { AppStateData } from '../data/initialData';

interface DashboardViewProps {
  data: AppStateData;
  onNavigate: (tab: string) => void;
  onStartRunFromCalc: (
    batchId: string,
    specId: string,
    units: number,
    weightValue?: number,
    weightUnit?: 'g' | 'kg'
  ) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onStartRunFromCalc,
}) => {
  // Aggregate Metrics
  const totalBulkWt = data.teaBatches.reduce((acc, b) => acc + b.remainingWeightKg, 0);
  const totalInitialBulkWt = data.teaBatches.reduce((acc, b) => acc + b.initialWeightKg, 0);
  const totalPackagedUnits = data.finishedGoods.reduce((acc, g) => acc + g.currentUnits, 0);
  const totalPackagedTeaKg = data.finishedGoods.reduce((acc, g) => acc + g.totalTeaKgEquivalent, 0);
  const totalDispatchedTeaKg = data.dispatches.reduce((acc, d) => acc + d.totalNetWeightKg, 0);

  // Total packaging loss across runs
  const totalTeaLossKg = data.runs.reduce((acc, r) => acc + r.teaLossKg, 0);
  const totalTeaProcessedKg = data.runs.reduce((acc, r) => acc + r.teaActualUsedKg, 0);
  const overallEfficiency =
    totalTeaProcessedKg > 0
      ? (((totalTeaProcessedKg - totalTeaLossKg) / totalTeaProcessedKg) * 100).toFixed(1)
      : '99.0';

  // Low materials
  const lowMaterials = data.materials.filter((m) => m.stockQuantity <= m.minReorderLevel);

  // Packaging inventory valuation
  const totalMaterialUnits = data.materials.reduce((acc, m) => acc + m.stockQuantity, 0);
  const totalPackagingValuationKSh = data.materials.reduce((acc, m) => acc + m.stockQuantity * m.unitCost, 0);

  // Quick Calculator State - now varies according to the packer and grams vs kg
  const [calcBatchId, setCalcBatchId] = useState<string>(data.teaBatches[0]?.id || '');
  const [calcSpecId, setCalcSpecId] = useState<string>(data.packageSpecs[0]?.id || '');
  const [calcPacker, setCalcPacker] = useState<string>('David Koech (Line Lead)');
  const [calcUnit, setCalcUnit] = useState<'g' | 'kg'>('g');
  const [calcWeightValue, setCalcWeightValue] = useState<number>(50); // Default to 50g
  const [calcBulkKg, setCalcBulkKg] = useState<number>(50);

  const selectedBatch = data.teaBatches.find((b) => b.id === calcBatchId);
  const selectedSpec = data.packageSpecs.find((s) => s.id === calcSpecId);

  // Dynamic weight conversion:
  const effectivePackWeightG = calcUnit === 'kg' ? calcWeightValue * 1000 : calcWeightValue;
  const effectivePackWeightKg = effectivePackWeightG / 1000;
  const scrapFactor = selectedSpec ? 1 + selectedSpec.expectedScrapPercent / 100 : 1.01;
  const computedNetUnits =
    effectivePackWeightKg > 0 ? Math.floor(calcBulkKg / (effectivePackWeightKg * scrapFactor)) : 0;
  const requiredPouches = computedNetUnits;
  const unitsPerCarton = selectedSpec?.unitsPerShipperCarton || (effectivePackWeightG >= 500 ? 12 : 48);
  const requiredCartons = Math.ceil(computedNetUnits / unitsPerCarton);

  return (
    <div className="space-y-6">
      {/* Top Banner with Alert if materials are low */}
      {lowMaterials.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">
                Packaging Material Stock Warning ({lowMaterials.length} item{lowMaterials.length > 1 ? 's' : ''} at or below reorder threshold)
              </p>
              <p className="text-xs text-amber-700">
                {lowMaterials.map((m) => `${m.name} (${m.stockQuantity} ${m.unit} left)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('materials')}
            className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-medium px-3 py-1.5 rounded-md transition-colors"
          >
            Review Stock &amp; Restock
          </button>
        </div>
      )}

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Bulk Tea in Stock</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {totalBulkWt.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
            <span className="text-sm font-normal text-stone-500">kg</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Across {data.teaBatches.filter((b) => b.remainingWeightKg > 0).length} active batches</span>
            <span className="text-emerald-700 font-medium">
              {totalInitialBulkWt > 0 ? ((totalBulkWt / totalInitialBulkWt) * 100).toFixed(0) : 0}% capacity
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Packaged Inventory</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {totalPackagedUnits.toLocaleString()}{' '}
            <span className="text-sm font-normal text-stone-500">packs</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Equivalent to {totalPackagedTeaKg.toFixed(1)} kg tea</span>
            <span className="text-stone-700 font-medium">{data.finishedGoods.length} active lots</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Packaging Yield</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {overallEfficiency}%{' '}
            <span className="text-sm font-normal text-emerald-600">efficiency</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>Mechanical loss: {totalTeaLossKg.toFixed(2)} kg</span>
            <span className="text-stone-600 font-medium">{data.runs.length} runs completed</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1.5">
            <span className="text-xs font-medium uppercase tracking-wider">Dispatched to Clients</span>
            <SendHorizontal className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {totalDispatchedTeaKg.toFixed(1)}{' '}
            <span className="text-sm font-normal text-stone-500">kg shipped</span>
          </div>
          <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
            <span>{data.dispatches.length} customer order{data.dispatches.length !== 1 ? 's' : ''}</span>
            <span className="text-emerald-700 font-medium">100% Traceable</span>
          </div>
        </div>
      </div>

      {/* Packing Materials Quick Inventory Bar */}
      <div className="bg-stone-900 text-stone-100 rounded-lg p-3.5 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">
                Packing Materials Inventory
              </span>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                {data.materials.length} SKUs Stocked
              </span>
            </div>
            <p className="text-stone-300 text-[11px] mt-0.5">
              Integrated stock of pouches, corrugated cartons, tin caddies, labels, and tapes valued in Kenyan Shillings (KSh).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-stone-800/80 px-3 py-1.5 rounded border border-stone-700">
            <span className="text-[10px] text-stone-400 block uppercase font-medium">In Store</span>
            <span className="font-mono font-bold text-white text-sm">
              {totalMaterialUnits.toLocaleString()} units
            </span>
            <span className="text-[10px] text-stone-400 block">Across all lines</span>
          </div>

          <div className="bg-stone-800/80 px-3 py-1.5 rounded border border-stone-700">
            <span className="text-[10px] text-stone-400 block uppercase font-medium">Materials Valuation</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              KSh {totalPackagingValuationKSh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-stone-400 block">Warehouse BOM</span>
          </div>

          <button
            onClick={() => onNavigate('materials')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Manage Materials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tea Mass Balance & Material Flow Diagram */}
      <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              Tea Mass Balance &amp; Material Conversion Flow
            </h2>
            <p className="text-xs text-stone-500">
              Real-time reconciliation of bulk tea intake into packaged 50g/100g/250g finished goods with scrap tracking
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Mass Balanced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-stone-50 p-3.5 rounded-lg border border-stone-200">
          <div className="bg-white p-3 rounded border border-stone-200">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">1. Total Bulk Intake</span>
            <div className="text-lg font-bold text-stone-900 mt-0.5">
              {totalInitialBulkWt.toFixed(1)} kg
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">From certified estates &amp; auctions</p>
          </div>

          <div className="bg-white p-3 rounded border border-stone-200">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">2. In Bulk Silos</span>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">
              {totalBulkWt.toFixed(1)} kg
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Available for packaging lines</p>
          </div>

          <div className="bg-white p-3 rounded border border-stone-200">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">3. Packaged into Retail</span>
            <div className="text-lg font-bold text-stone-900 mt-0.5">
              {totalPackagedTeaKg.toFixed(1)} kg
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {totalPackagedUnits.toLocaleString()} packs (50g, 100g, etc.)
            </p>
          </div>

          <div className="bg-white p-3 rounded border border-stone-200">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">4. Production Loss</span>
            <div className="text-lg font-bold text-stone-700 mt-0.5">
              {totalTeaLossKg.toFixed(2)} kg
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">Averaging {(100 - parseFloat(overallEfficiency)).toFixed(2)}% dust &amp; filling loss</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Quick Packaging Calculator + Active Package Sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Packaging Calculator (User prompt: "if its 50g or anything it should reflect") */}
        <div className="lg:col-span-6 bg-gradient-to-br from-emerald-900 to-stone-900 text-white p-5 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-emerald-800/80 text-emerald-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold tracking-tight">
                Quick 50g / Custom Packaging Estimator
              </h3>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-700/50">
              Live Conversion Engine
            </span>
          </div>

          <p className="text-xs text-stone-300 mb-4">
            Test any bulk tea batch against 50g or other package sizes to calculate required pouches, cartons, and scrap allowance.
          </p>

          <div className="space-y-3 text-xs">
            {/* Packer Selector & Batch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1 font-medium">Assigned Packer</label>
                <select
                  value={calcPacker}
                  onChange={(e) => setCalcPacker(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="David Koech (Line Lead)">David Koech (Line Lead)</option>
                  <option value="Mercy Cherono (Station 2)">Mercy Cherono (Station 2)</option>
                  <option value="John Onyango (Bulk Pack)">John Onyango (Bulk Pack)</option>
                  <option value="Grace Wanjiku (Tea Bag/Caddy)">Grace Wanjiku (Tea Bag/Caddy)</option>
                  <option value="Amina Hassan (Artisan Bench)">Amina Hassan (Artisan Bench)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-300 mb-1 font-medium">Select Bulk Tea Batch</label>
                <select
                  value={calcBatchId}
                  onChange={(e) => setCalcBatchId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {data.teaBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.batchNumber} - {b.grade} ({b.remainingWeightKg.toFixed(0)} kg left)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pack Weight & Unit Controls (Grams vs Kilograms) */}
            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-stone-200 font-semibold text-xs flex items-center gap-1.5">
                  <span>Pack Weight (Grams or Kilograms)</span>
                </label>
                <div className="inline-flex rounded bg-stone-900 p-0.5 border border-stone-700">
                  <button
                    type="button"
                    onClick={() => {
                      setCalcUnit('g');
                      if (calcUnit === 'kg') setCalcWeightValue(calcWeightValue * 1000);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      calcUnit === 'g' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Grams (g)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCalcUnit('kg');
                      if (calcUnit === 'g') setCalcWeightValue(+(calcWeightValue / 1000).toFixed(3));
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                      calcUnit === 'kg' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-stone-900 border border-stone-700 rounded px-2 py-1">
                  <input
                    type="number"
                    step={calcUnit === 'kg' ? '0.05' : '1'}
                    min={calcUnit === 'kg' ? '0.01' : '1'}
                    value={calcWeightValue}
                    onChange={(e) => setCalcWeightValue(Math.max(0.01, Number(e.target.value)))}
                    className="w-full bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
                  />
                  <span className="text-stone-400 font-mono text-xs font-bold">{calcUnit}</span>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-1">
                  {calcUnit === 'g' ? (
                    <>
                      {[25, 50, 100, 250].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCalcWeightValue(g)}
                          className={`px-1.5 py-1 rounded text-[11px] font-mono cursor-pointer ${
                            calcWeightValue === g
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                          }`}
                        >
                          {g}g
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[0.5, 1, 2, 5].map((kg) => (
                        <button
                          key={kg}
                          type="button"
                          onClick={() => setCalcWeightValue(kg)}
                          className={`px-1.5 py-1 rounded text-[11px] font-mono cursor-pointer ${
                            calcWeightValue === kg
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                          }`}
                        >
                          {kg}kg
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-stone-300 font-medium">Bulk Tea to Pack ({selectedBatch?.grade || 'Tea'})</label>
                <span className="text-emerald-400 font-mono font-semibold">{calcBulkKg} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max={selectedBatch ? Math.max(10, Math.floor(selectedBatch.remainingWeightKg)) : 200}
                step="5"
                value={calcBulkKg}
                onChange={(e) => setCalcBulkKg(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                <span>5 kg</span>
                <span>{selectedBatch ? `${selectedBatch.remainingWeightKg.toFixed(0)} kg max available` : '200 kg'}</span>
              </div>
            </div>

            {/* Computation Output Box */}
            <div className="bg-stone-800/90 rounded-md p-3 border border-stone-700/80 space-y-2">
              <div className="flex items-center justify-between text-stone-300">
                <span>Expected Finished Units ({calcWeightValue} {calcUnit} each):</span>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {computedNetUnits.toLocaleString()} packs
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Required Bags/Pouches ({effectivePackWeightG}g net):</span>
                <span className="font-semibold text-stone-100 font-mono">{requiredPouches.toLocaleString()} pcs</span>
              </div>
              <div className="flex items-center justify-between text-stone-300">
                <span>Master Shipper Cartons ({unitsPerCarton} packs/ctn):</span>
                <span className="font-semibold text-stone-100 font-mono">{requiredCartons} cartons</span>
              </div>
              <div className="flex items-center justify-between text-stone-400 text-[11px] pt-1 border-t border-stone-700">
                <span>Packer in Charge: <strong>{calcPacker}</strong></span>
                <span>Loss: ~{((calcBulkKg * 0.01)).toFixed(2)} kg tea</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (calcBatchId && computedNetUnits > 0) {
                  onStartRunFromCalc(
                    calcBatchId,
                    calcSpecId,
                    computedNetUnits,
                    calcWeightValue,
                    calcUnit
                  );
                }
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Initialize Run: {computedNetUnits} units of {calcWeightValue} {calcUnit}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active Package Specifications Quick Reference */}
        <div className="lg:col-span-6 bg-white p-5 rounded-lg border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-stone-900">
                  Standard Package Formats (BOM Presets)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('specs')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                Manage Specs <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-3">
              Pre-configured net weights and packaging bill-of-materials configured in the system:
            </p>

            <div className="space-y-2">
              {data.packageSpecs.map((spec) => {
                const primaryMat = data.materials.find((m) => m.id === spec.primaryMaterialId);
                const cartonMat = data.materials.find((m) => m.id === spec.cartonMaterialId);
                const is50g = spec.netWeightG === 50;

                return (
                  <div
                    key={spec.id}
                    className={`p-2.5 rounded-md border text-xs flex items-center justify-between ${
                      is50g ? 'bg-emerald-50/60 border-emerald-300' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900">{spec.productName}</span>
                        {is50g && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-bold">
                            50g Focus
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        SKU: <span className="font-mono">{spec.sku}</span> • Target: {spec.targetGrade}
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5">
                        Pouch: <span className="font-medium text-stone-800">{primaryMat?.name || 'Assigned'}</span> •{' '}
                        {spec.unitsPerShipperCarton} units/carton
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="inline-block px-2.5 py-1 rounded bg-stone-900 text-white font-mono font-bold text-xs">
                        {spec.netWeightG} g
                      </span>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        ~{(1000 / spec.netWeightG).toFixed(0)} packs/kg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
            <span>Need advice on tea barrier films &amp; moisture rating?</span>
            <button
              onClick={() => onNavigate('research-guide')}
              className="text-emerald-700 hover:text-emerald-800 font-medium underline"
            >
              Open Materials Research Guide →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Packaging Runs Table */}
      <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              Recent Packaging Production Runs
            </h3>
            <p className="text-xs text-stone-500">
              Auditable records showing bulk tea consumption, net grams packaged, and lot assignment
            </p>
          </div>
          <button
            onClick={() => onNavigate('runs')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
          >
            All Runs <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {data.runs.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-xs">
            No packaging runs logged yet. Click &ldquo;New Packaging Run&rdquo; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Run #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Raw Tea Batch</th>
                  <th className="py-2.5 px-3">Product Spec</th>
                  <th className="py-2.5 px-3 text-center">Net Pack Size</th>
                  <th className="py-2.5 px-3 text-right">Units Output</th>
                  <th className="py-2.5 px-3 text-right">Tea Used</th>
                  <th className="py-2.5 px-3 text-center">Loss %</th>
                  <th className="py-2.5 px-3">Generated Lot #</th>
                  <th className="py-2.5 px-3 text-center">QC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.runs.slice(-5).reverse().map((run) => {
                  const batch = data.teaBatches.find((b) => b.id === run.teaBatchId);
                  const spec = data.packageSpecs.find((s) => s.id === run.specId);

                  return (
                    <tr key={run.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-stone-800">{run.runNumber}</td>
                      <td className="py-2.5 px-3 text-stone-600">{run.date}</td>
                      <td className="py-2.5 px-3 font-medium text-stone-900">
                        {batch?.batchNumber || 'Batch'} <span className="text-stone-400 font-normal">({batch?.grade})</span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-700">{spec?.productName || 'Package Spec'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-semibold font-mono">
                          {run.netWeightG} g
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-stone-900">
                        {run.actualUnitsProduced.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-stone-700">
                        {run.teaActualUsedKg.toFixed(2)} kg
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-stone-600">
                        {run.lossPercentage.toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-medium">{run.generatedLotNumber}</td>
                      <td className="py-2.5 px-3 text-center">
                        {run.qcPassed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="text-amber-700 text-[11px] font-medium">Flagged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
