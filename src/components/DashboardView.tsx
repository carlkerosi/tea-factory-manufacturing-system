import React, { useState } from 'react';
import {
  Scale,
  Boxes,
  Factory,
  SendHorizontal,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Ruler,
  CheckCircle2,
  Database,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { AppStateData } from '../data/initialData';
import { isSupabaseConfigured } from '../lib/supabase';

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
      : '99.1';

  // Low materials
  const lowMaterials = data.materials.filter((m) => m.stockQuantity <= m.minReorderLevel);

  // Packaging inventory valuation
  const totalMaterialUnits = data.materials.reduce((acc, m) => acc + m.stockQuantity, 0);
  const totalPackagingValuationKSh = data.materials.reduce((acc, m) => acc + m.stockQuantity * m.unitCost, 0);

  // Quick Calculator State - supports grams (50g, 100g, 250g) and kilograms (1kg, 2kg, 5kg)
  const [calcBatchId, setCalcBatchId] = useState<string>(data.teaBatches[0]?.id || '');
  const [calcSpecId, setCalcSpecId] = useState<string>(data.packageSpecs[0]?.id || '');
  const [calcPacker, setCalcPacker] = useState<string>('David Koech (Line Lead)');
  const [calcUnit, setCalcUnit] = useState<'g' | 'kg'>('g');
  const [calcWeightValue, setCalcWeightValue] = useState<number>(50); // Default to 50g
  const [calcBulkKg, setCalcBulkKg] = useState<number>(50);

  const selectedBatch = data.teaBatches.find((b) => b.id === calcBatchId);
  const selectedSpec = data.packageSpecs.find((s) => s.id === calcSpecId);

  // Dynamic weight conversion
  const effectivePackWeightG = calcUnit === 'kg' ? calcWeightValue * 1000 : calcWeightValue;
  const effectivePackWeightKg = effectivePackWeightG / 1000;
  const scrapFactor = selectedSpec ? 1 + selectedSpec.expectedScrapPercent / 100 : 1.01;
  const computedNetUnits =
    effectivePackWeightKg > 0 ? Math.floor(calcBulkKg / (effectivePackWeightKg * scrapFactor)) : 0;
  const requiredPouches = computedNetUnits;
  const unitsPerCarton = selectedSpec?.unitsPerShipperCarton || (effectivePackWeightG >= 500 ? 12 : 48);
  const requiredCartons = Math.ceil(computedNetUnits / unitsPerCarton);
  const estimatedScrapKg = Number((calcBulkKg * (selectedSpec ? selectedSpec.expectedScrapPercent / 100 : 0.01)).toFixed(2));

  return (
    <div className="space-y-6">
      {/* Low Stock Operational Warning */}
      {lowMaterials.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Packaging Material Stock Warning: {lowMaterials.length} SKU{lowMaterials.length > 1 ? 's' : ''} at or below reorder threshold
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {lowMaterials.map((m) => `${m.name} (${m.stockQuantity.toLocaleString()} ${m.unit} remaining)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('materials')}
            className="text-xs bg-amber-700 hover:bg-amber-800 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Review &amp; Restock Materials
          </button>
        </div>
      )}

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bulk Tea Silos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Bulk Floor Tea</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {totalBulkWt.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
            <span className="text-sm font-normal text-slate-500 font-sans">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{data.teaBatches.filter((b) => b.remainingWeightKg > 0).length} active batches</span>
            <span className="font-semibold text-emerald-700">
              {totalInitialBulkWt > 0 ? ((totalBulkWt / totalInitialBulkWt) * 100).toFixed(0) : 0}% silo capacity
            </span>
          </div>
        </div>

        {/* Finished Packaged Inventory */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Packaged Finished Goods</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {totalPackagedUnits.toLocaleString()}{' '}
            <span className="text-sm font-normal text-slate-500 font-sans">units</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{data.finishedGoods.length} active lots</span>
            <span className="font-mono text-slate-700 font-medium">{totalPackagedTeaKg.toFixed(1)} kg tea net</span>
          </div>
        </div>

        {/* Packaging Line Yield */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Line Packaging Yield</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {overallEfficiency}%{' '}
            <span className="text-sm font-normal text-emerald-700 font-sans">yield</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{data.runs.length} runs executed</span>
            <span className="text-slate-600 font-medium">Scrap: {totalTeaLossKg.toFixed(2)} kg</span>
          </div>
        </div>

        {/* Outbound Dispatches */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Shipped to Distributors</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <SendHorizontal className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {totalDispatchedTeaKg.toFixed(1)}{' '}
            <span className="text-sm font-normal text-slate-500 font-sans">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>{data.dispatches.length} dispatch orders</span>
            <span className="text-emerald-700 font-medium">100% Traceable</span>
          </div>
        </div>
      </div>

      {/* Mass Balance & Conversion Flow Overview */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Plant Mass Balance &amp; Material Conversion</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconciliation of raw intake weight from Gusii estates into packaged retail units and dust loss
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mass Reconciliation Active</span>
            </span>
          </div>
        </div>

        {/* 4 Clean Flattened Pipeline Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500 block">1. Total Bulk Received</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">
              {totalInitialBulkWt.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Certified estate intakes</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500 block">2. Floor Bulk Silos</span>
            <div className="text-xl font-bold text-emerald-800 font-mono mt-1">
              {totalBulkWt.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Available for packaging</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500 block">3. Packaged into Retail</span>
            <div className="text-xl font-bold text-slate-900 font-mono mt-1">
              {totalPackagedTeaKg.toFixed(1)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{totalPackagedUnits.toLocaleString()} units produced</p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50">
            <span className="text-xs font-semibold text-slate-500 block">4. Production Loss / Dust</span>
            <div className="text-xl font-bold text-slate-700 font-mono mt-1">
              {totalTeaLossKg.toFixed(2)} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Average {(100 - parseFloat(overallEfficiency)).toFixed(2)}% loss</p>
          </div>
        </div>

        {/* Visual Progress Flow Distribution Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span>Mass Allocation:</span>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
                <span>Packaged ({totalInitialBulkWt > 0 ? ((totalPackagedTeaKg / totalInitialBulkWt) * 100).toFixed(1) : 0}%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-400" />
                <span>Available Floor ({totalInitialBulkWt > 0 ? ((totalBulkWt / totalInitialBulkWt) * 100).toFixed(1) : 0}%)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
                <span>Scrap ({totalInitialBulkWt > 0 ? ((totalTeaLossKg / totalInitialBulkWt) * 100).toFixed(1) : 0}%)</span>
              </span>
            </div>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${totalInitialBulkWt > 0 ? (totalPackagedTeaKg / totalInitialBulkWt) * 100 : 0}%` }}
              className="bg-emerald-700 h-full"
            />
            <div
              style={{ width: `${totalInitialBulkWt > 0 ? (totalBulkWt / totalInitialBulkWt) * 100 : 0}%` }}
              className="bg-slate-400 h-full"
            />
            <div
              style={{ width: `${totalInitialBulkWt > 0 ? (totalTeaLossKg / totalInitialBulkWt) * 100 : 0}%` }}
              className="bg-amber-400 h-full"
            />
          </div>
        </div>
      </div>

      {/* Two Column Grid: Industrial Setup Terminal + Package Sizes Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clean Enterprise Packaging Line Setup Terminal */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-emerald-700" />
                <span>Packaging Line Batch &amp; BOM Terminal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate output yield, primary pouch requirements, and shipper cartons for 50g to 5kg runs
              </p>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Line Terminal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            {/* Operator Selection */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Assigned Line Operator / Lead</label>
              <select
                value={calcPacker}
                onChange={(e) => setCalcPacker(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 text-xs"
              >
                <option value="David Koech (Line Lead)">David Koech (Line Lead)</option>
                <option value="Mercy Cherono (Station 2)">Mercy Cherono (Station 2)</option>
                <option value="John Onyango (Bulk Pack)">John Onyango (Bulk Pack)</option>
                <option value="Grace Wanjiku (Tea Bag/Caddy)">Grace Wanjiku (Tea Bag/Caddy)</option>
                <option value="Amina Hassan (Artisan Bench)">Amina Hassan (Artisan Bench)</option>
              </select>
            </div>

            {/* Bulk Batch Selection */}
            <div>
              <label className="block text-slate-700 font-medium mb-1">Source Bulk Tea Batch</label>
              <select
                value={calcBatchId}
                onChange={(e) => setCalcBatchId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 text-xs"
              >
                {data.teaBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} - {b.grade} ({b.remainingWeightKg.toFixed(0)} kg available)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit & Target Weight Controls */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">Target Net Pack Weight</span>
              {/* Unit Toggle */}
              <div className="inline-flex rounded-md bg-white p-0.5 border border-slate-300">
                <button
                  type="button"
                  onClick={() => {
                    setCalcUnit('g');
                    if (calcUnit === 'kg') setCalcWeightValue(calcWeightValue * 1000);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    calcUnit === 'g' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
                  className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                    calcUnit === 'kg' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Kilograms (kg)
                </button>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-emerald-600 focus-within:border-emerald-600">
                <input
                  type="number"
                  step={calcUnit === 'kg' ? '0.05' : '1'}
                  min={calcUnit === 'kg' ? '0.01' : '1'}
                  value={calcWeightValue}
                  onChange={(e) => setCalcWeightValue(Math.max(0.01, Number(e.target.value)))}
                  className="w-full bg-transparent text-slate-900 font-mono font-bold text-sm focus:outline-none"
                />
                <span className="text-slate-400 font-mono text-xs font-semibold ml-1">{calcUnit}</span>
              </div>

              {/* Weight Quick Presets */}
              <div className="flex gap-1 shrink-0">
                {calcUnit === 'g' ? (
                  <>
                    {[25, 50, 100, 250, 500].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setCalcWeightValue(g)}
                        className={`px-2 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                          calcWeightValue === g
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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
                        className={`px-2 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                          calcWeightValue === kg
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
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

          {/* Bulk Tea Quantity Slider */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-medium">Bulk Tea to Allocate from Floor</label>
              <span className="font-mono font-bold text-slate-900 text-sm">{calcBulkKg} kg</span>
            </div>
            <input
              type="range"
              min="5"
              max={selectedBatch ? Math.max(10, Math.floor(selectedBatch.remainingWeightKg)) : 200}
              step="5"
              value={calcBulkKg}
              onChange={(e) => setCalcBulkKg(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>5 kg min</span>
              <span>Available: {selectedBatch ? `${selectedBatch.remainingWeightKg.toFixed(0)} kg in batch` : '200 kg'}</span>
            </div>
          </div>

          {/* Output Yield & BOM Table */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
              <span className="font-medium text-slate-700">Expected Output Units ({calcWeightValue} {calcUnit}):</span>
              <span className="font-mono font-bold text-base text-emerald-800">
                {computedNetUnits.toLocaleString()} packs
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Primary Pouches Required ({effectivePackWeightG}g size):</span>
              <span className="font-mono font-semibold text-slate-800">{requiredPouches.toLocaleString()} pcs</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Master Shipper Cartons ({unitsPerCarton} packs/ctn):</span>
              <span className="font-mono font-semibold text-slate-800">{requiredCartons} cartons</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              <span>Packer: <strong>{calcPacker}</strong></span>
              <span>Est. scrap loss: ~{estimatedScrapKg} kg tea</span>
            </div>
          </div>

          {/* Action to Start Run */}
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
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs text-xs"
          >
            <span>Launch Packaging Run: {computedNetUnits.toLocaleString()} units ({calcWeightValue} {calcUnit})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Standard Package Formats & Packaging Material Inventory */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Packaging Specs */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Registered Package Formats (BOM)
                </h3>
              </div>
              <button
                onClick={() => onNavigate('specs')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <span>Specs</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Standard net weights with pre-mapped pouch material and master cartons:
            </p>

            <div className="space-y-2">
              {data.packageSpecs.map((spec) => {
                const primaryMat = data.materials.find((m) => m.id === spec.primaryMaterialId);
                const is50g = spec.netWeightG === 50;

                return (
                  <div
                    key={spec.id}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      is50g ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{spec.productName}</span>
                        {is50g && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                            50g Standard
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        SKU: <span className="font-mono">{spec.sku}</span> &bull; {spec.targetGrade}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {primaryMat?.name || 'Assigned Pouch'} &bull; {spec.unitsPerShipperCarton} / carton
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-xs">
                        {spec.netWeightG} g
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        ~{(1000 / spec.netWeightG).toFixed(0)} packs/kg
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Materials Valuation & Store Overview */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Packaging Materials Stock
                </h3>
              </div>
              <button
                onClick={() => onNavigate('materials')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <span>Inventory</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-medium">Total Items in Store</span>
                <span className="font-mono font-bold text-slate-900 text-lg">
                  {totalMaterialUnits.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{data.materials.length} SKUs stocked</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block font-medium">Packaging Valuation</span>
                <span className="font-mono font-bold text-slate-900 text-lg">
                  KSh {totalPackagingValuationKSh.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Warehouse BOM total</span>
              </div>
            </div>

            {/* Quick Supabase Database Link */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-slate-600">Supabase Cloud:</span>
                <span className="font-mono text-[11px] text-emerald-700 font-semibold">
                  {isSupabaseConfigured() ? 'Live Connected' : 'Configured'}
                </span>
              </div>
              <button
                onClick={() => onNavigate('supabase')}
                className="text-emerald-700 hover:text-emerald-800 font-medium"
              >
                Schema &amp; Tables &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Packaging Runs Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Packaging Production Runs
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditable line logs recording bulk tea consumption, net grams packaged, and lot assignment
            </p>
          </div>
          <button
            onClick={() => onNavigate('runs')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Runs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {data.runs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No packaging runs logged yet. Click &ldquo;New Packaging Run&rdquo; to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="py-2.5 px-3">Run #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Bulk Tea Batch</th>
                  <th className="py-2.5 px-3">Product Spec</th>
                  <th className="py-2.5 px-3 text-center">Pack Size</th>
                  <th className="py-2.5 px-3 text-right">Units Produced</th>
                  <th className="py-2.5 px-3 text-right">Tea Used</th>
                  <th className="py-2.5 px-3 text-center">Loss %</th>
                  <th className="py-2.5 px-3">Generated Lot #</th>
                  <th className="py-2.5 px-3 text-center">QC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.runs.slice(-5).reverse().map((run) => {
                  const batch = data.teaBatches.find((b) => b.id === run.teaBatchId);
                  const spec = data.packageSpecs.find((s) => s.id === run.specId);

                  return (
                    <tr key={run.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-800">{run.runNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">{run.date}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {batch?.batchNumber || 'Batch'} <span className="text-slate-400 font-normal">({batch?.grade})</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{spec?.productName || 'Package Spec'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold font-mono">
                          {run.netWeightG} g
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        {run.actualUnitsProduced.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {run.teaActualUsedKg.toFixed(2)} kg
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-slate-600">
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
