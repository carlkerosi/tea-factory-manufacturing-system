import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowDownToLine,
  BookOpen,
  Box,
  Boxes,
  Coins,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { PackingMaterial, Supplier, MaterialCategory } from '../types';

interface MaterialsViewProps {
  materials: PackingMaterial[];
  suppliers: Supplier[];
  onAddMaterial: (mat: Omit<PackingMaterial, 'id'>) => void;
  onReceiveStock: (materialId: string, additionalQuantity: number) => void;
  onNavigateToResearch: () => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  materials,
  suppliers,
  onAddMaterial,
  onReceiveStock,
  onNavigateToResearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPackSize, setSelectedPackSize] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Quick Restock modal state
  const [restockItem, setRestockItem] = useState<PackingMaterial | null>(null);
  const [restockQty, setRestockQty] = useState<number>(500);

  // Form State for new material
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('shipper_carton');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [unit, setUnit] = useState<'pieces' | 'rolls' | 'meters' | 'boxes'>('boxes');
  const [stockQuantity, setStockQuantity] = useState<number>(500);
  const [minReorderLevel, setMinReorderLevel] = useState<number>(150);
  const [unitCost, setUnitCost] = useState<number>(145.00); // Default in KSh
  const [materialLayers, setMaterialLayers] = useState('Double-wall corrugated kraft B/C-flute (175/150/175 gsm)');
  const [suitablePackG, setSuitablePackG] = useState<string>('50');
  const [location, setLocation] = useState('Carton Bay C-01');

  // Metrics Calculations
  const cartonMaterials = materials.filter((m) => m.category === 'shipper_carton');
  const totalCartonBoxes = cartonMaterials.reduce((sum, m) => sum + m.stockQuantity, 0);
  const pouchMaterials = materials.filter((m) => m.category === 'pouch');
  const totalPouches = pouchMaterials.reduce((sum, m) => sum + m.stockQuantity, 0);
  const totalValuationKSh = materials.reduce((sum, m) => sum + m.stockQuantity * m.unitCost, 0);
  const lowStockCount = materials.filter((m) => m.stockQuantity <= m.minReorderLevel).length;

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesPack =
      selectedPackSize === 'all' ||
      m.suitableForPacks.includes(Number(selectedPackSize));
    return matchesSearch && matchesCat && matchesPack;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    const packSizes = suitablePackG
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));

    onAddMaterial({
      sku,
      name,
      category,
      supplierId,
      unit,
      stockQuantity,
      minReorderLevel,
      unitCost,
      barrierSpecs: {
        materialLayers,
        moistureBarrier: category === 'shipper_carton' ? 'High ECT / Bursting Strength' : 'Very High',
        oxygenBarrier: category === 'shipper_carton' ? 'Secondary Transit Protection' : 'Very High',
        lightProtection: '100% Opaque',
        targetNetWeightG: packSizes[0] || 50,
        foodGradeCertified: true,
      },
      suitableForPacks: packSizes.length > 0 ? packSizes : [50],
      leadTimeDays: 7,
      location,
    });

    setIsAddModalOpen(false);
    setName('');
    setSku('');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockItem && restockQty > 0) {
      onReceiveStock(restockItem.id, restockQty);
      setRestockItem(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            <span>Packing Materials Inventory</span>
          </h2>
          <p className="text-xs text-stone-500">
            Real-time stock and valuation of all packing materials including pouches, cartons, tin caddies, adhesive labels, and sealing tapes (all prices in <strong>KSh</strong>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToResearch}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-medium text-xs px-3 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Materials Research Guide</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3.5 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Material</span>
          </button>
        </div>
      </div>

      {/* Unified Packing Materials KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Materials in Stock */}
        <div className="p-3.5 rounded-lg border bg-white border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium flex items-center gap-1.5 text-stone-900">
              <Package className="w-4 h-4 text-emerald-700" />
              Total Stocked Units
            </span>
            <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-800 font-mono text-[10px] font-semibold">
              {materials.length} SKUs
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            {materials.reduce((sum, m) => sum + m.stockQuantity, 0).toLocaleString()}{' '}
            <span className="text-xs font-normal text-stone-500">units in store</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Pouches, cartons, labels, caddies &amp; tapes
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="p-3.5 rounded-lg border bg-white border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium flex items-center gap-1.5 text-stone-900">
              <Boxes className="w-4 h-4 text-amber-700" />
              Packaging Categories
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-semibold">
              Active Stock
            </span>
          </div>
          <div className="text-xs font-medium text-stone-700 space-y-1 mt-1">
            <div className="flex justify-between">
              <span>Primary Pouches:</span>
              <span className="font-mono font-bold text-stone-900">{totalPouches.toLocaleString()} pcs</span>
            </div>
            <div className="flex justify-between">
              <span>Shipper Cartons:</span>
              <span className="font-mono font-bold text-stone-900">{totalCartonBoxes.toLocaleString()} boxes</span>
            </div>
          </div>
        </div>

        {/* Reorder & Inventory Health */}
        <div
          onClick={() => setSelectedCategory(lowStockCount > 0 ? 'low' : 'all')}
          className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
            lowStockCount > 0
              ? 'bg-amber-50/70 border-amber-300 hover:bg-amber-50'
              : 'bg-white border-stone-200 hover:border-emerald-300'
          } shadow-xs`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium flex items-center gap-1.5 text-stone-900">
              <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
              Reorder Alerts
            </span>
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                lowStockCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {lowStockCount > 0 ? `${lowStockCount} Low Stock` : 'Healthy'}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            {lowStockCount > 0 ? `${lowStockCount} SKUs` : 'All Stocked'}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {lowStockCount > 0 ? 'Items below minimum buffer level' : 'All buffer thresholds met'}
          </div>
        </div>

        {/* Total Valuation Card in KSh */}
        <div className="p-3.5 rounded-lg border bg-stone-900 text-stone-100 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
            <span className="font-medium flex items-center gap-1.5 text-stone-300">
              <Coins className="w-4 h-4 text-amber-400" />
              Packing Materials Valuation
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-semibold">
              KSh Denominated
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-white">
            KSh {totalValuationKSh.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Calculated across {materials.length} material lines
          </div>
        </div>
      </div>

      {/* Category Filter Tabs & Search Bar */}
      <div className="space-y-3">
        {/* Unified Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            All Materials ({materials.length})
          </button>
          <button
            onClick={() => setSelectedCategory('pouch')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'pouch'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Pouches ({pouchMaterials.length})
          </button>
          <button
            onClick={() => setSelectedCategory('shipper_carton')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'shipper_carton'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Cartons ({cartonMaterials.length})
          </button>
          <button
            onClick={() => setSelectedCategory('tin_caddy')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'tin_caddy'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Tin Caddies ({materials.filter((m) => m.category === 'tin_caddy').length})
          </button>
          <button
            onClick={() => setSelectedCategory('label_sticker')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'label_sticker'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Labels ({materials.filter((m) => m.category === 'label_sticker').length})
          </button>
          <button
            onClick={() => setSelectedCategory('sealing_tape')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'sealing_tape'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Sealing Tapes ({materials.filter((m) => m.category === 'sealing_tape').length})
          </button>
          <button
            onClick={() => setSelectedCategory('inner_foil')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'inner_foil'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            Barrier Liners ({materials.filter((m) => m.category === 'inner_foil').length})
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200 text-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search packing materials by SKU, name, material specs, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-stone-500">Pack Compatibility:</span>
            <select
              value={selectedPackSize}
              onChange={(e) => setSelectedPackSize(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">All Sizes</option>
              <option value="50">50g (Core Focus)</option>
              <option value="100">100g</option>
              <option value="250">250g</option>
              <option value="1000">1,000g (1kg)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Material Specification &amp; Layers</th>
                <th className="py-3 px-4 text-center">Category</th>
                <th className="py-3 px-4 text-center">Pack Compatibility</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4 text-right">Reorder Min</th>
                <th className="py-3 px-4 text-right">Unit Price (KSh)</th>
                <th className="py-3 px-4 text-right">Stock Valuation (KSh)</th>
                <th className="py-3 px-4">Storage Location</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMaterials.map((mat) => {
                const isLow = mat.stockQuantity <= mat.minReorderLevel;
                const isOut = mat.stockQuantity === 0;
                const supplier = suppliers.find((s) => s.id === mat.supplierId);
                const lineValuationKSh = mat.stockQuantity * mat.unitCost;
                const isCarton = mat.category === 'shipper_carton';

                return (
                  <tr
                    key={mat.id}
                    className="hover:bg-stone-50/70 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-stone-900">{mat.sku}</div>
                      <span className="font-medium text-stone-800 block mt-0.5">{mat.name}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs">
                      <div className="font-mono text-[11px] text-stone-700">
                        {mat.barrierSpecs?.materialLayers || 'Standard food contact material'}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Supplier: {supplier?.name || 'Packaging Converter'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {mat.category === 'shipper_carton'
                          ? 'Shipper Carton'
                          : mat.category === 'pouch'
                          ? 'Stand-Up Pouch'
                          : mat.category === 'tin_caddy'
                          ? 'Tin Caddy'
                          : mat.category === 'label_sticker'
                          ? 'Adhesive Label'
                          : mat.category === 'sealing_tape'
                          ? 'Sealing Tape'
                          : mat.category === 'inner_foil'
                          ? 'Barrier Liner'
                          : mat.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {mat.suitableForPacks.map((p) => (
                          <span
                            key={p}
                            className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-semibold ${
                              p === 50
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : p === 1000
                                ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {p >= 1000 ? `${p / 1000}kg` : `${p}g`}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      {mat.stockQuantity.toLocaleString()}{' '}
                      <span className="text-[11px] font-normal text-stone-500">{mat.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-500">
                      {mat.minReorderLevel.toLocaleString()} {mat.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-900">
                      KSh {mat.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-stone-900">
                      KSh {lineValuationKSh.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-stone-600 font-mono text-[11px]">
                      {mat.location}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isOut ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                          Depleted
                        </span>
                      ) : isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                          Adequate
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setRestockItem(mat);
                          setRestockQty(mat.minReorderLevel || 500);
                        }}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium text-xs px-2.5 py-1 rounded border border-emerald-200 hover:bg-emerald-50 cursor-pointer transition-colors"
                        title="Receive Stock"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ArrowDownToLine className="w-5 h-5 text-emerald-700" />
                <span>Receive Incoming Material Stock</span>
              </h3>
              <button
                onClick={() => setRestockItem(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div className="bg-stone-50 p-3 rounded border border-stone-200">
                <div className="font-mono text-stone-500 text-[11px]">{restockItem.sku}</div>
                <div className="font-bold text-stone-900 text-sm mt-0.5">{restockItem.name}</div>
                <div className="text-stone-600 text-xs mt-1.5 flex items-center justify-between">
                  <span>
                    Current Stock: <strong>{restockItem.stockQuantity.toLocaleString()} {restockItem.unit}</strong>
                  </span>
                  <span>
                    Unit Price: <strong className="text-emerald-800">KSh {restockItem.unitCost.toFixed(2)}</strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Quantity Received ({restockItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="bg-emerald-50/70 p-2.5 rounded border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                <div className="flex justify-between">
                  <span>New Total Inventory:</span>
                  <strong className="font-mono">
                    {(restockItem.stockQuantity + Number(restockQty || 0)).toLocaleString()} {restockItem.unit}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Incoming Stock Value:</span>
                  <strong className="font-mono">
                    KSh {(Number(restockQty || 0) * restockItem.unitCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-4 py-1.5 rounded border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium hover:bg-emerald-800 cursor-pointer"
                >
                  Confirm Restock in KSh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-xl w-full p-5 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                <span>Register Packing Material</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PK-CTN-SHIP-50G-48"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Material Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value as MaterialCategory;
                      setCategory(newCat);
                      if (newCat === 'shipper_carton') {
                        setUnit('boxes');
                        setUnitCost(145.00);
                        setMaterialLayers('Double-wall corrugated kraft B/C-flute (175/150/175 gsm)');
                      } else if (newCat === 'pouch') {
                        setUnit('pieces');
                        setUnitCost(18.00);
                        setMaterialLayers('Kraft 50gsm / AL 7µm / LLDPE 60µm');
                      } else if (newCat === 'sealing_tape') {
                        setUnit('rolls');
                        setUnitCost(350.00);
                        setMaterialLayers('Heavy-duty reinforced 48mm BOPP tape');
                      }
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 font-medium"
                  >
                    <option value="pouch">Stand-up Barrier Pouch</option>
                    <option value="shipper_carton">Corrugated Master Shipper Carton</option>
                    <option value="tin_caddy">Metal Airtight Tin Caddy</option>
                    <option value="label_sticker">Adhesive Brand / Compliance Label</option>
                    <option value="sealing_tape">Carton Sealing Tape Roll</option>
                    <option value="inner_foil">Carton Moisture Barrier Liner Bag</option>
                    <option value="pyramid_mesh">Pyramid Tea Mesh Roll</option>
                    <option value="envelope">Individual Tea Envelope</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Material Name &amp; Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Shipper Carton - 48 x 50g Pouches (Double Wall Kraft)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Initial Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Min Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={minReorderLevel}
                    onChange={(e) => setMinReorderLevel(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Unit of Measure</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="boxes">boxes</option>
                    <option value="pieces">pieces</option>
                    <option value="rolls">rolls</option>
                    <option value="meters">meters</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Unit Cost (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={unitCost}
                    onChange={(e) => setUnitCost(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">e.g. KSh 145.00</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Suitable Pack Grams</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 or 50, 100"
                    value={suitablePackG}
                    onChange={(e) => setSuitablePackG(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">Comma separated, e.g. 50, 100</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Warehouse Shelf / Bin</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Corrugated Flute / Barrier Layer Specs</label>
                <input
                  type="text"
                  placeholder="e.g. Double-wall B/C-flute (175/150/175 gsm) ECT 44"
                  value={materialLayers}
                  onChange={(e) => setMaterialLayers(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-1.5 rounded border border-stone-300 text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-700 text-white font-medium hover:bg-emerald-800 cursor-pointer"
                >
                  Save Material to Inventory (in KSh)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
