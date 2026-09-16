import React, { useState, useEffect } from 'react';
import {
  Factory,
  Scale,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Tag,
  Boxes,
  User,
  Sliders,
} from 'lucide-react';
import {
  BulkTeaBatch,
  PackagingSpec,
  PackingMaterial,
  PackagingRun,
  FinishedGoodsLot,
  PackagingRunMaterialUsage,
} from '../types';

interface PackagingRunWizardProps {
  isOpen: boolean;
  onClose: () => void;
  batches: BulkTeaBatch[];
  specs: PackagingSpec[];
  materials: PackingMaterial[];
  initialBatchId?: string;
  initialSpecId?: string;
  initialUnits?: number;
  initialWeightValue?: number;
  initialWeightUnit?: 'g' | 'kg';
  onExecuteRun: (
    run: Omit<PackagingRun, 'id'>,
    newLot: Omit<FinishedGoodsLot, 'id'>
  ) => void;
}

const REGISTERED_PACKERS = [
  'David Koech (Line 1 VFFS Lead)',
  'Mercy Cherono (Station 2 Weigher)',
  'John Onyango (Bulk Pack Operator)',
  'Grace Wanjiku (Tea Bag & Caddy Packer)',
  'Amina Hassan (Artisan Bench Specialist)',
];

export const PackagingRunWizard: React.FC<PackagingRunWizardProps> = ({
  isOpen,
  onClose,
  batches,
  specs,
  materials,
  initialBatchId,
  initialSpecId,
  initialUnits,
  initialWeightValue,
  initialWeightUnit = 'g',
  onExecuteRun,
}) => {
  // Filter available batches with remaining weight
  const availableBatches = batches.filter((b) => b.remainingWeightKg > 0);

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId && availableBatches.some((b) => b.id === initialBatchId)
      ? initialBatchId
      : availableBatches[0]?.id || ''
  );

  const [selectedSpecId, setSelectedSpecId] = useState<string>(
    initialSpecId || specs[0]?.id || ''
  );

  // Packer identity ("the one packing")
  const [packerSelect, setPackerSelect] = useState<string>(REGISTERED_PACKERS[0]);
  const [customPackerName, setCustomPackerName] = useState<string>('');
  const isCustomPacker = packerSelect === 'custom';
  const effectivePackerName = isCustomPacker
    ? customPackerName.trim() || 'Factory Packer'
    : packerSelect;

  // Pack Weight Customization (Grams vs Kilograms)
  const defaultSpec = specs.find((s) => s.id === selectedSpecId);
  const [useCustomWeight, setUseCustomWeight] = useState<boolean>(
    initialWeightValue !== undefined || false
  );
  const [weightUnit, setWeightUnit] = useState<'g' | 'kg'>(initialWeightUnit || 'g');
  const [weightValue, setWeightValue] = useState<number>(
    initialWeightValue || (defaultSpec ? defaultSpec.netWeightG : 50)
  );

  // Production Target Units
  const [unitsTarget, setUnitsTarget] = useState<number>(initialUnits || 1000);

  // Packaging Line & Operator
  const [machineLine, setMachineLine] = useState('Line 1 - Automated VFFS Pouch Filler');
  const [runDate, setRunDate] = useState(new Date().toISOString().slice(0, 10));

  // When spec selection changes and not in custom weight mode, sync weight
  useEffect(() => {
    if (!useCustomWeight && defaultSpec) {
      if (defaultSpec.netWeightUnit === 'kg') {
        setWeightUnit('kg');
        setWeightValue(defaultSpec.netWeightValue || defaultSpec.netWeightG / 1000);
      } else {
        setWeightUnit('g');
        setWeightValue(defaultSpec.netWeightG);
      }
    }
  }, [selectedSpecId, useCustomWeight, defaultSpec]);

  // Unified Effective Weight Calculations
  const effectiveWeightG =
    weightUnit === 'kg' ? Math.round(weightValue * 1000) : Math.max(1, weightValue);
  const effectiveWeightKg = effectiveWeightG / 1000;

  // QC Verification
  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const selectedSpec = defaultSpec;

  const [qcWeightG, setQcWeightG] = useState<number>(effectiveWeightG + 0.1);
  const [qcSealChecked, setQcSealChecked] = useState(true);
  const [qcBarcodeVerified, setQcBarcodeVerified] = useState(true);
  const [notes, setNotes] = useState('');

  // Sync QC sample weight with effective weight
  useEffect(() => {
    setQcWeightG(
      weightUnit === 'kg' ? +(effectiveWeightG + 1).toFixed(1) : +(effectiveWeightG + 0.1).toFixed(2)
    );
  }, [effectiveWeightG, weightUnit]);

  // Mass Balance Math
  // Net tea needed = unitsTarget * effectiveWeightKg
  const theoreticalTeaKg = unitsTarget * effectiveWeightKg;
  const lossPercent = selectedSpec?.expectedScrapPercent || 1.0;
  const scrapTeaKg = (theoreticalTeaKg * lossPercent) / 100;
  const totalActualTeaKg = theoreticalTeaKg + scrapTeaKg;

  // Check if bulk tea is sufficient
  const teaAvailable = selectedBatch?.remainingWeightKg || 0;
  const hasEnoughTea = teaAvailable >= totalActualTeaKg;

  // Material BOM Calculations
  // Dynamically select primary material suitable for pack size if custom
  const primaryMat =
    materials.find((m) => m.id === selectedSpec?.primaryMaterialId) ||
    materials.find((m) => m.suitableForPacks.includes(effectiveWeightG)) ||
    materials[0];

  const labelMat = materials.find((m) => m.id === selectedSpec?.labelMaterialId);
  const cartonMat =
    materials.find((m) => m.id === selectedSpec?.cartonMaterialId) ||
    materials.find((m) => m.category === 'shipper_carton' && m.suitableForPacks.includes(effectiveWeightG)) ||
    materials.find((m) => m.category === 'shipper_carton');

  // Material usage with setup loss
  const primaryPouchScrap = Math.ceil(unitsTarget * 0.008);
  const primaryPouchNeeded = unitsTarget + primaryPouchScrap;

  const labelScrap = labelMat ? Math.ceil(unitsTarget * 0.005) : 0;
  const labelNeeded = labelMat ? unitsTarget + labelScrap : 0;

  const unitsPerCarton = selectedSpec?.unitsPerShipperCarton || (effectiveWeightG >= 500 ? 12 : 48);
  const cartonsNeeded = cartonMat ? Math.ceil(unitsTarget / unitsPerCarton) : 0;

  // Stock checks
  const primaryMatHasStock = (primaryMat?.stockQuantity || 0) >= primaryPouchNeeded;

  const canExecute =
    selectedBatch &&
    unitsTarget > 0 &&
    weightValue > 0 &&
    hasEnoughTea &&
    primaryMatHasStock &&
    qcSealChecked;

  // Auto-generate Lot Number and Expiry Date (+24 months)
  const weightTag =
    weightUnit === 'kg'
      ? `${weightValue}KG`.replace('.', '_')
      : `${String(effectiveWeightG).padStart(3, '0')}G`;

  const lotNumber = `LOT-${runDate.replace(/-/g, '').slice(0, 6)}-${weightTag}-${String(
    Math.floor(Math.random() * 89 + 10)
  )}`;

  const expiryDateObj = new Date(runDate);
  expiryDateObj.setMonth(expiryDateObj.getMonth() + (selectedSpec?.shelfLifeMonths || 24));
  const expiryDate = expiryDateObj.toISOString().slice(0, 10);

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canExecute) return;

    const materialsConsumed: PackagingRunMaterialUsage[] = [];

    if (primaryMat) {
      materialsConsumed.push({
        materialId: primaryMat.id,
        quantityPlanned: unitsTarget,
        quantityUsed: primaryPouchNeeded,
        quantityScrap: primaryPouchScrap,
      });
    }

    if (labelMat) {
      materialsConsumed.push({
        materialId: labelMat.id,
        quantityPlanned: unitsTarget,
        quantityUsed: labelNeeded,
        quantityScrap: labelScrap,
      });
    }

    if (cartonMat && cartonsNeeded > 0) {
      materialsConsumed.push({
        materialId: cartonMat.id,
        quantityPlanned: cartonsNeeded,
        quantityUsed: cartonsNeeded,
        quantityScrap: 0,
      });
    }

    const runNumber = `RUN-${runDate.replace(/-/g, '').slice(0, 6)}-${String(
      Math.floor(Math.random() * 899 + 100)
    )}`;

    const productName = useCustomWeight
      ? `${selectedBatch.grade} Packed (${weightValue}${weightUnit})`
      : selectedSpec?.productName || `${selectedBatch.grade} Packaged (${effectiveWeightG}g)`;

    const newRun: Omit<PackagingRun, 'id'> = {
      runNumber,
      date: runDate,
      teaBatchId: selectedBatch.id,
      specId: selectedSpec?.id || 'custom-spec',
      targetUnits: unitsTarget,
      actualUnitsProduced: unitsTarget,
      netWeightG: effectiveWeightG,
      packWeightValue: weightValue,
      packWeightUnit: weightUnit,
      packerName: effectivePackerName,
      operatorName: effectivePackerName,
      teaRequiredKg: theoreticalTeaKg,
      teaActualUsedKg: Math.round(totalActualTeaKg * 100) / 100,
      teaLossKg: Math.round(scrapTeaKg * 100) / 100,
      lossPercentage: lossPercent,
      materialsConsumed,
      machineLine,
      qcSampleWeightG: qcWeightG,
      qcPassed: qcSealChecked && qcBarcodeVerified,
      generatedLotNumber: lotNumber,
      expiryDate,
      notes:
        notes ||
        `Packaged by ${effectivePackerName}. Packed ${unitsTarget} units of ${weightValue}${weightUnit} (${effectiveWeightG}g net). Tested QC sample: ${qcWeightG}g.`,
    };

    const newLot: Omit<FinishedGoodsLot, 'id'> = {
      lotNumber,
      runId: '',
      specId: selectedSpec?.id || 'custom-spec',
      teaBatchId: selectedBatch.id,
      productName,
      netWeightG: effectiveWeightG,
      packWeightValue: weightValue,
      packWeightUnit: weightUnit,
      packerName: effectivePackerName,
      initialUnits: unitsTarget,
      currentUnits: unitsTarget,
      totalTeaKgEquivalent: theoreticalTeaKg,
      productionDate: runDate,
      bestBeforeDate: expiryDate,
      warehouseLocation: `FG Warehouse Bay 1, Pallet Active (${weightValue}${weightUnit})`,
      status: 'available',
      qcPassed: true,
    };

    onExecuteRun(newRun, newLot);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-lg border border-stone-200 shadow-2xl max-w-3xl w-full p-5 space-y-5 max-h-[96vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-emerald-700 text-white shadow-xs">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Execute Packaging Production Run
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs font-mono font-bold">
                  Target: {weightValue} {weightUnit} ({effectiveWeightG}g)
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Packaging weights in <strong>grams or kg</strong> adjust dynamically according to the operator in charge.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleExecute} className="space-y-4 text-xs">
          {/* SECTION 1: The One Packing (Packer / Operator In Charge) */}
          <div className="bg-amber-50/70 p-3.5 rounded-lg border border-amber-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-stone-900 font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-amber-700" />
                <span>1. Operator / The One Packing</span>
              </label>
              <span className="text-[11px] text-amber-800 font-medium">
                Active Packer: <strong>{effectivePackerName}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 mb-1 text-[11px]">Select Assigned Packer</label>
                <select
                  value={packerSelect}
                  onChange={(e) => setPackerSelect(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {REGISTERED_PACKERS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                  <option value="custom">+ Other / Custom Operator Name</option>
                </select>
              </div>

              {isCustomPacker ? (
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Enter Packer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel Kiprop (Station 3)"
                    value={customPackerName}
                    onChange={(e) => setCustomPackerName(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-stone-600 mb-1 text-[11px]">Packaging Machine / Station</label>
                  <select
                    value={machineLine}
                    onChange={(e) => setMachineLine(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="Line 1 - Automated VFFS Pouch Filler">Line 1 - Automated VFFS Pouch Filler</option>
                    <option value="Line 2 - Rotary Multi-Head Weigher">Line 2 - Rotary Multi-Head Weigher</option>
                    <option value="Line 3 - Ultrasonic Pyramid Teabag Packer">Line 3 - Ultrasonic Pyramid Teabag Packer</option>
                    <option value="Line 4 - Manual Craft Packing Bench">Line 4 - Manual Craft Packing Bench</option>
                    <option value="Line 5 - Bulk Sacking & 1kg-5kg Kraft Line">Line 5 - Bulk Sacking &amp; 1kg-5kg Kraft Line</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Dynamic Pack Weight (Varies in Grams or Kg by Packer) */}
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-xs uppercase tracking-wider text-stone-900">
                  2. Pack Weight &amp; Size Control (Grams or Kilograms)
                </span>
              </div>

              {/* Toggle Custom Weight vs Spec */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-600">Weight mode:</span>
                <div className="inline-flex rounded border border-stone-300 bg-white p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomWeight(false);
                      if (defaultSpec) {
                        setWeightUnit(defaultSpec.netWeightUnit || 'g');
                        setWeightValue(defaultSpec.netWeightValue || defaultSpec.netWeightG);
                      }
                    }}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                      !useCustomWeight ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Preset Spec
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseCustomWeight(true)}
                    className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                      useCustomWeight ? 'bg-emerald-700 text-white' : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Packer Custom Weight
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Weight Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Unit Selector: Grams vs Kilograms */}
              <div className="sm:col-span-4 bg-white p-2.5 rounded border border-stone-300 space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-700">Packing Unit</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setWeightUnit('g');
                      if (weightUnit === 'kg') setWeightValue(Math.max(1, weightValue * 1000));
                    }}
                    className={`py-1.5 px-3 rounded text-xs font-bold transition-colors cursor-pointer text-center ${
                      weightUnit === 'g'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Grams (g)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWeightUnit('kg');
                      if (weightUnit === 'g') setWeightValue(+(weightValue / 1000).toFixed(3));
                    }}
                    className={`py-1.5 px-3 rounded text-xs font-bold transition-colors cursor-pointer text-center ${
                      weightUnit === 'kg'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    Kilograms (kg)
                  </button>
                </div>
              </div>

              {/* Exact Weight Value Input */}
              <div className="sm:col-span-4 bg-white p-2.5 rounded border border-stone-300 space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-700">
                  Weight Per Pack ({weightUnit === 'kg' ? 'kg' : 'grams'})
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step={weightUnit === 'kg' ? '0.05' : '1'}
                    min={weightUnit === 'kg' ? '0.01' : '1'}
                    required
                    value={weightValue}
                    onChange={(e) => setWeightValue(Math.max(0.01, Number(e.target.value)))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 font-mono text-base font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="font-mono font-bold text-stone-700 text-sm px-1.5">{weightUnit}</span>
                </div>
              </div>

              {/* Calculated Equivalent */}
              <div className="sm:col-span-4 bg-emerald-50 p-2.5 rounded border border-emerald-300 space-y-0.5 text-[11px]">
                <span className="text-emerald-900 font-bold block uppercase tracking-wider text-[10px]">
                  Effective Pack Weight
                </span>
                <div className="text-base font-black font-mono text-emerald-950">
                  {effectiveWeightG} g
                  <span className="text-xs font-normal text-emerald-800 ml-1">
                    ({effectiveWeightKg.toFixed(3)} kg)
                  </span>
                </div>
                <div className="text-[10px] text-emerald-800">
                  Equivalent to {(1000 / effectiveWeightG).toFixed(1)} packs per 1 kg bulk tea
                </div>
              </div>
            </div>

            {/* Quick Weight Presets */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-stone-500 font-medium">Quick Presets:</span>
              {weightUnit === 'g' ? (
                <>
                  {[25, 50, 75, 100, 200, 250, 500].map((presetG) => (
                    <button
                      key={presetG}
                      type="button"
                      onClick={() => setWeightValue(presetG)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                        weightValue === presetG
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {presetG}g
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {[0.5, 1.0, 1.5, 2.0, 5.0, 10.0].map((presetKg) => (
                    <button
                      key={presetKg}
                      type="button"
                      onClick={() => setWeightValue(presetKg)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                        weightValue === presetKg
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {presetKg} kg
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* SECTION 3: Bulk Tea Batch & Units Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
              <label className="block text-stone-900 font-bold flex items-between justify-between">
                <span>3. Raw Bulk Tea Batch</span>
                <span className="text-[11px] font-normal text-stone-500">
                  {selectedBatch ? `${selectedBatch.remainingWeightKg.toFixed(1)} kg available` : ''}
                </span>
              </label>

              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} • {b.grade} ({b.remainingWeightKg.toFixed(1)} kg) - {b.estateName.slice(0, 20)}
                  </option>
                ))}
              </select>

              {selectedBatch && (
                <div className="text-[11px] text-stone-600 pt-0.5">
                  Grade: <span className="font-mono font-bold text-stone-800">{selectedBatch.grade}</span> &bull; Moisture: <span className="font-mono font-semibold text-emerald-800">{selectedBatch.moisturePercent}%</span> &bull; Bin: <span className="font-mono">{selectedBatch.warehouseBin}</span>
                </div>
              )}
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-2">
              <label className="block text-stone-900 font-bold flex items-between justify-between">
                <span>4. Production Quantity (Units)</span>
                <span className="text-[11px] font-mono text-stone-500">
                  @{weightValue} {weightUnit} each
                </span>
              </label>

              <input
                type="number"
                min="1"
                step="1"
                required
                value={unitsTarget}
                onChange={(e) => setUnitsTarget(Math.max(1, Number(e.target.value)))}
                className="w-full bg-white border border-stone-300 rounded px-3 py-1.5 font-mono text-sm font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />

              <div className="flex gap-1.5">
                {[100, 500, 1000, 2000, 5000].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setUnitsTarget(quick)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 text-[10px] text-stone-700 border border-stone-300 cursor-pointer font-mono"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 4: Live Mass Balance Engine */}
          <div className="bg-emerald-950 text-white p-4 rounded-lg shadow-inner space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-emerald-800/80">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span className="font-bold uppercase tracking-wider text-emerald-300">
                  Live Mass Balance: {unitsTarget} packs × {weightValue} {weightUnit}
                </span>
              </div>
              <span className="font-mono text-emerald-300 text-[11px]">
                Packed by {effectivePackerName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase">Theoretical Net Tea Needed</span>
                <span className="font-mono font-bold text-white text-base">
                  {theoreticalTeaKg.toFixed(2)} kg
                </span>
                <span className="text-[10px] text-stone-400 block">
                  ({unitsTarget} × {effectiveWeightG}g net)
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase">
                  Machine Scrap Buffer ({lossPercent}%)
                </span>
                <span className="font-mono font-bold text-amber-300 text-base">
                  +{scrapTeaKg.toFixed(2)} kg
                </span>
                <span className="text-[10px] text-stone-400 block">Line hopper &amp; filling loss</span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase">
                  Total Bulk Tea Deducted From Silo
                </span>
                <span className="font-mono font-bold text-emerald-400 text-lg">
                  {totalActualTeaKg.toFixed(2)} kg
                </span>
                <span
                  className={`text-[11px] font-bold block ${
                    hasEnoughTea ? 'text-emerald-300' : 'text-red-400'
                  }`}
                >
                  {hasEnoughTea
                    ? `✓ Silo has ${teaAvailable.toFixed(1)} kg available`
                    : `✗ Insufficient! Need ${(totalActualTeaKg - teaAvailable).toFixed(1)} kg more`}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Packaging Materials (BOM) Live Validation */}
          <div className="bg-white p-3.5 rounded-lg border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-emerald-700" />
              <span>Packaging Material Live Stock Deduction (BOM)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-2.5 rounded border text-xs ${
                  primaryMatHasStock ? 'bg-stone-50 border-stone-200' : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="text-stone-500 text-[10px] uppercase font-bold">
                  1. Primary Pack ({weightValue} {weightUnit})
                </div>
                <div className="font-semibold text-stone-900 truncate mt-0.5">{primaryMat?.name}</div>
                <div className="mt-2 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Needed:</span>
                    <span className="font-mono font-bold text-stone-800">
                      {primaryPouchNeeded} {primaryMat?.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">In Stock:</span>
                    <span
                      className={`font-mono font-bold ${
                        primaryMatHasStock ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {primaryMat?.stockQuantity} {primaryMat?.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded border border-stone-200 bg-stone-50 text-xs">
                <div className="text-stone-500 text-[10px] uppercase font-bold">2. Brand &amp; Barcode Label</div>
                <div className="font-semibold text-stone-900 truncate mt-0.5">
                  {labelMat?.name || 'Pre-printed Packaging'}
                </div>
                <div className="mt-2 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Needed:</span>
                    <span className="font-mono font-bold text-stone-800">
                      {labelNeeded} {labelMat?.unit || 'pcs'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">In Stock:</span>
                    <span className="font-mono font-bold text-stone-700">
                      {labelMat ? `${labelMat.stockQuantity} pcs` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded border border-stone-200 bg-stone-50 text-xs">
                <div className="text-stone-500 text-[10px] uppercase font-bold">3. Master Shipper Carton</div>
                <div className="font-semibold text-stone-900 truncate mt-0.5">
                  {cartonMat?.name || 'Master Corrugated Box'}
                </div>
                <div className="mt-2 space-y-0.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Cartons:</span>
                    <span className="font-mono font-bold text-stone-800">
                      {cartonsNeeded} cartons ({unitsPerCarton}/box)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">In Stock:</span>
                    <span className="font-mono font-bold text-stone-700">
                      {cartonMat ? `${cartonMat.stockQuantity} boxes` : 'N/A'}
                    </span>
                  </div>
                  {cartonMat && (
                    <div className="flex justify-between text-[10px] text-stone-500 pt-0.5 border-t border-stone-200">
                      <span>Carton Price:</span>
                      <span className="font-mono font-semibold text-emerald-800">
                        KSh {cartonMat.unitCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: In-Line QC Signoff */}
          <div className="bg-stone-50 p-3.5 rounded-lg border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>In-Line Quality Assurance (QA) Sample Check</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Sample Net Weight Test (Target: {weightValue} {weightUnit})
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={qcWeightG}
                    onChange={(e) => setQcWeightG(Number(e.target.value))}
                    className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-stone-500 font-mono">g</span>
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col justify-center space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcSealChecked}
                    onChange={(e) => setQcSealChecked(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-800 font-medium">
                    Hermetic Heat Seal / Bag Closure Integrity Verified by {effectivePackerName}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcBarcodeVerified}
                    onChange={(e) => setQcBarcodeVerified(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-stone-800 font-medium">
                    Net Weight Marking ({weightValue} {weightUnit}) &amp; Barcode Inkjet Legibility Verified
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Generated Lot Identifier Preview */}
          <div className="p-3 bg-stone-100 rounded-md border border-stone-300 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">
                Auto-Generated Finished Goods Lot #
              </span>
              <span className="font-mono font-bold text-sm text-stone-900">{lotNumber}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Packer Assigned</span>
              <span className="font-bold text-stone-900">{effectivePackerName}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Net Pack Content</span>
              <span className="font-mono font-bold text-emerald-800">
                {weightValue} {weightUnit} ({effectiveWeightG}g net)
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-bold">Best Before</span>
              <span className="font-mono font-semibold text-stone-800">{expiryDate}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canExecute}
              className={`px-5 py-2 rounded font-medium text-white shadow-xs transition-colors flex items-center gap-2 ${
                canExecute
                  ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
                  : 'bg-stone-400 cursor-not-allowed opacity-70'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Execute Run &amp; Create Lot ({weightValue} {weightUnit})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
