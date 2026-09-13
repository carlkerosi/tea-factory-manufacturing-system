import React, { useState } from 'react';
import {
  BookOpen,
  ShieldCheck,
  Zap,
  Leaf,
  Layers,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Info,
} from 'lucide-react';
import { PACKAGING_RESEARCH_ITEMS, PACKAGING_SIZE_PRESETS } from '../data/packagingResearch';
import { ResearchMaterialGuideItem, PackingMaterial } from '../types';

interface ResearchGuideViewProps {
  onAdoptMaterial: (material: Omit<PackingMaterial, 'id'>) => void;
  onNavigateToSpecs: () => void;
}

export const ResearchGuideView: React.FC<ResearchGuideViewProps> = ({
  onAdoptMaterial,
  onNavigateToSpecs,
}) => {
  const [selectedGramFilter, setSelectedGramFilter] = useState<number | 'all'>(50); // Default to 50g focus
  const [selectedMaterial, setSelectedMaterial] = useState<ResearchMaterialGuideItem>(
    PACKAGING_RESEARCH_ITEMS[0]
  );
  const [adoptedFeedback, setAdoptedFeedback] = useState<string | null>(null);

  // Filtered items based on grammage suitability
  const filteredItems = PACKAGING_RESEARCH_ITEMS.filter((item) => {
    if (selectedGramFilter === 'all') return true;
    return item.recommendedGrammages.includes(selectedGramFilter);
  });

  const handleAdopt = (item: ResearchMaterialGuideItem) => {
    const newMat: Omit<PackingMaterial, 'id'> = {
      sku: `PK-${item.category.toUpperCase()}-${selectedGramFilter === 'all' ? 50 : selectedGramFilter}G-${Date.now().toString().slice(-4)}`,
      name: `${selectedGramFilter === 'all' ? '50g' : selectedGramFilter + 'g'} ${item.title.split('(')[0].trim()}`,
      category: item.category,
      supplierId: 'sup-3',
      unit: item.category === 'shipper_carton' ? 'boxes' : 'pieces',
      stockQuantity: 2500,
      minReorderLevel: 800,
      unitCost: item.category === 'tin_caddy' ? 110.0 : item.category === 'shipper_carton' ? 150.0 : 18.0,
      barrierSpecs: {
        materialLayers: item.layerStructure,
        moistureBarrier: 'Very High',
        oxygenBarrier: 'Very High',
        lightProtection: '100% Opaque',
        targetNetWeightG: typeof selectedGramFilter === 'number' ? selectedGramFilter : 50,
        foodGradeCertified: true,
      },
      suitableForPacks: typeof selectedGramFilter === 'number' ? [selectedGramFilter] : [50, 100],
      leadTimeDays: 14,
      location: 'Warehouse Receiving Bay',
    };

    onAdoptMaterial(newMat);
    setAdoptedFeedback(`Adopted "${item.title.split('(')[0].trim()}" into active packaging materials inventory!`);
    setTimeout(() => setAdoptedFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Research Header Banner */}
      <div className="bg-white p-6 rounded-lg border border-stone-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900">
                  Tea Packaging Materials Engineering &amp; Research Advisor
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                  50g Packaging Guide
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
                Tea is extremely hygroscopic and sensitive to light, oxygen, and ambient aromas. This guide provides
                empirical barrier specifications, layer laminations, and practical packaging guidance for packaging bulk tea
                into <strong>50g</strong>, 100g, 250g retail formats.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-stone-500 font-medium">Filter by Target Pack Size:</span>
            <div className="inline-flex rounded-md border border-stone-300 bg-stone-50 p-0.5 text-xs">
              <button
                onClick={() => setSelectedGramFilter(50)}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedGramFilter === 50 ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                50g (Focus)
              </button>
              <button
                onClick={() => setSelectedGramFilter(100)}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedGramFilter === 100 ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                100g
              </button>
              <button
                onClick={() => setSelectedGramFilter(250)}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedGramFilter === 250 ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                250g
              </button>
              <button
                onClick={() => setSelectedGramFilter('all')}
                className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                  selectedGramFilter === 'all' ? 'bg-emerald-700 text-white shadow-xs font-bold' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                All Materials
              </button>
            </div>
          </div>
        </div>

        {adoptedFeedback && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-md text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adoptedFeedback}</span>
          </div>
        )}
      </div>

      {/* The 4 Pillars of Tea Preservation Callout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>1. Moisture Barrier (WVTR)</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Bulk tea moisture must remain between <strong>4.5% - 6.5%</strong> in strict compliance with Kenya Bureau of Standards (KEBS KS EAS 28:2020). In the humid Kisii highlands, aluminum foil barrier (AL 7µm) prevents moisture uptake (&lt;0.1g/m²·24h) and prevents mold.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>2. Oxygen Barrier (OTR)</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Oxygen degrades theaflavins and catechins, causing rapid discoloration and flat liquor. Foil or metallized PET (VMPET) keeps OTR below 1.0 cm³/m²·24h to guarantee a 24-month fresh shelf-life.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>3. 100% Light Opacity</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Never pack premium tea in clear plastic windows on retail shelves. UV light photo-oxidizes chlorophyll and polyphenols within 30 days. Always use opaque metallized foil or printed solid paperboard.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>4. Resealability &amp; Aroma Seal</span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            A 50g tea pack lasts an individual consumer approximately 2 weeks (20 - 25 cups). A built-in press-to-close zipper or airtight tin inner plug ensures tea aroma terpenes do not evaporate after opening.
          </p>
        </div>
      </div>

      {/* Main Material Comparison & Deep-Dive Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Material Selection List (Left Column) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">
              Researched Material Solutions ({filteredItems.length})
            </h3>
            <span className="text-xs text-stone-500">Click to inspect technical sheet</span>
          </div>

          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const isSelected = selectedMaterial.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMaterial(item)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-1 ring-emerald-600'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">
                        {item.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 mt-1">{item.title}</h4>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-800 shrink-0 font-mono">
                      {item.typicalCostRange.split('(')[0]}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                    {item.layerStructure}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-600 pt-2 border-t border-stone-100">
                    <span>Shelf Life: {item.shelfLifeRating}</span>
                    <span className="font-semibold text-emerald-700">View Specs →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Material Deep-Dive (Right Column) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <span className="text-xs font-mono uppercase text-emerald-700 font-semibold">
                Technical Data Sheet • {selectedMaterial.category.replace('_', ' ')}
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">
                {selectedMaterial.title}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Recommended for: {selectedMaterial.recommendedGrammages.map((g) => `${g}g`).join(', ')} retail packaging
              </p>
            </div>

            <button
              onClick={() => handleAdopt(selectedMaterial)}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium px-3.5 py-2 rounded-md shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adopt into Live Inventory</span>
            </button>
          </div>

          {/* Layer Structure Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5 mb-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Lamination Architecture &amp; Gauge Thickness</span>
            </h4>
            <div className="bg-stone-50 p-3 rounded-md border border-stone-200 text-xs font-mono text-stone-800">
              {selectedMaterial.layerStructure}
            </div>
          </div>

          {/* Barrier Properties Matrix */}
          <div>
            <h4 className="text-xs font-semibold text-stone-900 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Barrier &amp; Preservation Performance</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded border border-stone-200 bg-stone-50/70">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Oxygen Barrier (OTR)</span>
                <span className="font-medium text-stone-900">{selectedMaterial.barrierProperties.oxygen}</span>
              </div>
              <div className="p-2.5 rounded border border-stone-200 bg-stone-50/70">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Moisture Barrier (WVTR)</span>
                <span className="font-medium text-stone-900">{selectedMaterial.barrierProperties.moisture}</span>
              </div>
              <div className="p-2.5 rounded border border-stone-200 bg-stone-50/70">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Light &amp; UV Protection</span>
                <span className="font-medium text-stone-900">{selectedMaterial.barrierProperties.light}</span>
              </div>
              <div className="p-2.5 rounded border border-stone-200 bg-stone-50/70">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Aroma Volatile Sealing</span>
                <span className="font-medium text-stone-900">{selectedMaterial.barrierProperties.aromaSealing}</span>
              </div>
            </div>
          </div>

          {/* Pros and Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50/50">
              <span className="font-semibold text-emerald-900 flex items-center gap-1 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Manufacturing Advantages
              </span>
              <ul className="space-y-1 text-emerald-950 list-disc list-inside">
                {selectedMaterial.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-md border border-amber-200 bg-amber-50/50">
              <span className="font-semibold text-amber-900 flex items-center gap-1 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Manufacturing Constraints
              </span>
              <ul className="space-y-1 text-amber-950 list-disc list-inside">
                {selectedMaterial.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sealing & Machine Setup Advice */}
          <div className="bg-stone-50 p-3 rounded-md border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-medium">Recommended Machine Sealing Window</span>
              <span className="font-semibold text-stone-800 font-mono">{selectedMaterial.sealingTemp}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px] uppercase font-medium">Typical Cost Range</span>
              <span className="font-semibold text-emerald-700 font-mono">{selectedMaterial.typicalCostRange}</span>
            </div>
          </div>

          <div className="p-3 bg-stone-100 rounded-md text-xs text-stone-700">
            <span className="font-semibold text-stone-900 block mb-0.5">Recommended Application:</span>
            {selectedMaterial.bestUseCases}
          </div>
        </div>
      </div>

      {/* Package Formats Architecture Guide (50g, 100g, 250g, etc.) */}
      <div className="bg-white p-5 rounded-lg border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Standard Package Dimensions &amp; Shipper Carton Pack Ratios
            </h3>
            <p className="text-xs text-stone-500">
              Engineering benchmarks for 50g, 100g, and 250g formats including carton packing densities and mechanical scrap factors
            </p>
          </div>
          <button
            onClick={onNavigateToSpecs}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
          >
            Configure Package Specs <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGING_SIZE_PRESETS.slice(0, 3).map((preset) => {
            const is50g = preset.netWeightG === 50;
            return (
              <div
                key={preset.netWeightG}
                className={`p-4 rounded-lg border text-xs flex flex-col justify-between ${
                  is50g ? 'bg-emerald-50/70 border-emerald-300' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-stone-900">{preset.title}</span>
                    <span className="px-2 py-0.5 rounded bg-stone-900 text-white font-mono font-bold text-xs">
                      {preset.netWeightG}g Net
                    </span>
                  </div>

                  <p className="text-stone-600 mb-3">{preset.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-stone-200/80 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Dimensions:</span>
                      <span className="font-mono text-stone-800 text-right">{preset.recommendedDimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Carton Packing Ratio:</span>
                      <span className="font-bold text-stone-900">{preset.cartonPackCount} packs / master carton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Master Carton Net Tea:</span>
                      <span className="font-mono text-emerald-800 font-medium">
                        {((preset.cartonPackCount * preset.netWeightG) / 1000).toFixed(2)} kg tea / box
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Machine Loss Factor:</span>
                      <span className="font-mono text-stone-800">{preset.standardTeaScrapTolerance}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-stone-200/80">
                  <span className="text-[10px] text-stone-500 block uppercase font-medium">Recommended Barrier</span>
                  <span className="text-[11px] font-medium text-stone-800">{preset.recommendedBarrier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
