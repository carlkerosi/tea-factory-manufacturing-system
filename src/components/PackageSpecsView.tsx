import React, { useState } from 'react';
import {
  Ruler,
  Plus,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { PackagingSpec, PackingMaterial, TeaGrade } from '../types';

interface PackageSpecsViewProps {
  specs: PackagingSpec[];
  materials: PackingMaterial[];
  onAddSpec: (spec: Omit<PackagingSpec, 'id'>) => void;
  onLaunchRunWithSpec: (specId: string) => void;
}

export const PackageSpecsView: React.FC<PackageSpecsViewProps> = ({
  specs,
  materials,
  onAddSpec,
  onLaunchRunWithSpec,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [productName, setProductName] = useState('');
  const [sku, setSku] = useState('');
  const [targetGrade, setTargetGrade] = useState<TeaGrade>('BP1');
  const [weightUnit, setWeightUnit] = useState<'g' | 'kg'>('g');
  const [weightValue, setWeightValue] = useState<number>(50); // Default to 50g
  const [packageType, setPackageType] = useState<any>('pouch');
  const [unitsPerShipperCarton, setUnitsPerShipperCarton] = useState<number>(48);
  const [expectedScrapPercent, setExpectedScrapPercent] = useState<number>(1.2);
  const [primaryMaterialId, setPrimaryMaterialId] = useState<string>(materials[0]?.id || '');
  const [labelMaterialId, setLabelMaterialId] = useState<string>(
    materials.find((m) => m.category === 'label_sticker')?.id || ''
  );
  const [cartonMaterialId, setCartonMaterialId] = useState<string>(
    materials.find((m) => m.category === 'shipper_carton')?.id || ''
  );
  const [shelfLifeMonths, setShelfLifeMonths] = useState<number>(24);
  const [suggestedRetailPrice, setSuggestedRetailPrice] = useState<number>(150.00);

  const calculatedNetGrams =
    weightUnit === 'kg' ? Math.round(weightValue * 1000) : Math.max(1, weightValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !sku || calculatedNetGrams <= 0) return;

    onAddSpec({
      productName,
      sku,
      targetGrade,
      netWeightG: calculatedNetGrams,
      netWeightUnit: weightUnit,
      netWeightValue: weightValue,
      packageType,
      unitsPerShipperCarton,
      expectedScrapPercent,
      primaryMaterialId,
      labelMaterialId: labelMaterialId || undefined,
      cartonMaterialId: cartonMaterialId || undefined,
      shelfLifeMonths,
      suggestedRetailPrice,
    });

    setIsModalOpen(false);
    setProductName('');
    setSku('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Ruler className="w-5 h-5 text-emerald-700" />
            <span>Package Specifications &amp; Bill-of-Materials (BOM)</span>
          </h2>
          <p className="text-xs text-stone-500">
            Define target net weight in grams (<strong>50g</strong>, 100g, 250g), packaging pouch, labels, and master carton pack ratios.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3.5 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Package Size Spec</span>
        </button>
      </div>

      {/* Grid of Standard Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {specs.map((spec) => {
          const primaryMat = materials.find((m) => m.id === spec.primaryMaterialId);
          const labelMat = materials.find((m) => m.id === spec.labelMaterialId);
          const cartonMat = materials.find((m) => m.id === spec.cartonMaterialId);
          const is50g = spec.netWeightG === 50;
          const isKg = spec.netWeightUnit === 'kg' || spec.netWeightG >= 1000;
          const displayWeight = spec.netWeightValue
            ? `${spec.netWeightValue} ${spec.netWeightUnit || 'g'}`
            : isKg
            ? `${(spec.netWeightG / 1000).toFixed(1)} kg`
            : `${spec.netWeightG} g`;

          // Conversions
          const packsPerKg = (1000 / spec.netWeightG).toFixed(1);
          const teaPerCartonKg = ((spec.unitsPerShipperCarton * spec.netWeightG) / 1000).toFixed(2);

          return (
            <div
              key={spec.id}
              className={`rounded-lg border p-5 flex flex-col justify-between transition-all bg-white ${
                is50g ? 'border-emerald-400 shadow-xs ring-1 ring-emerald-400/50' : 'border-stone-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-stone-900">{spec.productName}</h3>
                      {is50g && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-bold">
                          50g Standard
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[11px] text-stone-500">{spec.sku}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded font-mono font-bold text-sm ${
                        isKg
                          ? 'bg-amber-800 text-white'
                          : is50g
                          ? 'bg-emerald-700 text-white'
                          : 'bg-stone-900 text-white'
                      }`}
                    >
                      {displayWeight}
                    </span>
                    <span className="block text-[10px] text-stone-400 mt-0.5">
                      {isKg ? `${spec.netWeightG}g • ` : ''}
                      {(spec.netWeightG * 0.035274).toFixed(2)} oz
                    </span>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-stone-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Target Tea Grade:</span>
                    <span className="font-mono font-semibold text-stone-900">{spec.targetGrade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Packs per 1 kg Bulk Tea:</span>
                    <span className="font-mono font-bold text-emerald-800">{packsPerKg} packs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Master Carton Pack Count:</span>
                    <span className="font-bold text-stone-900">
                      {spec.unitsPerShipperCarton} packs ({teaPerCartonKg} kg tea/box)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mechanical Scrap Allowance:</span>
                    <span className="font-mono text-stone-700">{spec.expectedScrapPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Certified Shelf Life:</span>
                    <span className="text-stone-800">{spec.shelfLifeMonths} months</span>
                  </div>
                </div>

                {/* BOM Items */}
                <div className="mt-3 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
                    Bill of Materials (BOM)
                  </span>
                  <div className="p-2 rounded bg-stone-50 border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-stone-600 truncate max-w-[190px]">
                        1× {primaryMat?.name || 'Assigned Pouch'}
                      </span>
                      <span className="font-mono text-stone-500 text-[10px]">
                        {primaryMat ? `${primaryMat.stockQuantity} in stock` : 'N/A'}
                      </span>
                    </div>
                    {labelMat && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-600 truncate max-w-[190px]">
                          1× {labelMat.name}
                        </span>
                        <span className="font-mono text-stone-500 text-[10px]">
                          {labelMat.stockQuantity} in stock
                        </span>
                      </div>
                    )}
                    {cartonMat && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-600 truncate max-w-[190px]">
                          1/{spec.unitsPerShipperCarton}× {cartonMat.name}
                        </span>
                        <span className="font-mono text-stone-500 text-[10px]">
                          {cartonMat.stockQuantity} in stock
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  MSRP: <strong className="text-stone-900">KSh {spec.suggestedRetailPrice?.toLocaleString() || '150'}</strong>
                </span>
                <button
                  onClick={() => onLaunchRunWithSpec(spec.id)}
                  className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors cursor-pointer"
                >
                  <span>Start Run</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Spec Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-xl w-full p-5 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-700" />
                <span>Configure New Packaging Specification &amp; BOM</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Product Finished Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Harvest BP1 50g Foil Pouch"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">SKU Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FG-BP1-050G-ROYAL"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-300">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-emerald-900 font-bold">Pack Weight</label>
                    <div className="flex rounded border border-emerald-300 overflow-hidden bg-white text-[10px]">
                      <button
                        type="button"
                        onClick={() => setWeightUnit('g')}
                        className={`px-2 py-0.5 font-bold ${
                          weightUnit === 'g'
                            ? 'bg-emerald-700 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        Grams (g)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('kg')}
                        className={`px-2 py-0.5 font-bold ${
                          weightUnit === 'kg'
                            ? 'bg-emerald-700 text-white'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        Kilograms (kg)
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step={weightUnit === 'kg' ? '0.1' : '1'}
                    min={weightUnit === 'kg' ? '0.1' : '1'}
                    required
                    value={weightValue}
                    onChange={(e) => setWeightValue(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-400 rounded px-3 py-1.5 font-mono text-sm font-bold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    = {calculatedNetGrams} grams ({((1000 / (calculatedNetGrams || 1))).toFixed(1)} packs/kg tea)
                  </span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Target Tea Grade</label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value as TeaGrade)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="BP1">BP1</option>
                    <option value="PF1">PF1</option>
                    <option value="PD">PD</option>
                    <option value="FTGFOP">FTGFOP</option>
                    <option value="Green Sencha">Green Sencha</option>
                    <option value="Earl Grey Blend">Earl Grey Blend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Package Format</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="pouch">Stand-up Barrier Pouch</option>
                    <option value="tin">Metal Tinplate Caddy</option>
                    <option value="vacuum_brick">Vacuum Brick Pack</option>
                    <option value="pyramid_box">Pyramid Teabag Box</option>
                  </select>
                </div>
              </div>

              {/* BOM Materials Linking */}
              <div className="border-t border-stone-200 pt-3 space-y-3">
                <span className="text-xs font-bold text-stone-900 block">
                  Bill of Materials (BOM) Component Linking
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Primary Pouch / Container</label>
                    <select
                      value={primaryMaterialId}
                      onChange={(e) => setPrimaryMaterialId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.stockQuantity} {m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Adhesive Label (Optional)</label>
                    <select
                      value={labelMaterialId}
                      onChange={(e) => setLabelMaterialId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">None (Pre-printed)</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-medium mb-1">Master Shipper Carton</label>
                    <select
                      value={cartonMaterialId}
                      onChange={(e) => setCartonMaterialId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    >
                      <option value="">None</option>
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Packs per Shipper Carton</label>
                  <input
                    type="number"
                    min="1"
                    value={unitsPerShipperCarton}
                    onChange={(e) => setUnitsPerShipperCarton(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">e.g. 48 for 50g packs</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Scrap Loss Tolerance (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={expectedScrapPercent}
                    onChange={(e) => setExpectedScrapPercent(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">Standard: 1.0% - 1.5%</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Shelf Life (Months)</label>
                  <input
                    type="number"
                    min="6"
                    value={shelfLifeMonths}
                    onChange={(e) => setShelfLifeMonths(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">Standard: 24 mos</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">MSRP Retail (KSh)</label>
                  <input
                    type="number"
                    min="1"
                    step="5"
                    value={suggestedRetailPrice}
                    onChange={(e) => setSuggestedRetailPrice(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">e.g. KSh 150</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium hover:bg-emerald-800 cursor-pointer"
                >
                  Register Package Spec
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
