import React from 'react';
import { Printer, ShieldCheck, Leaf, X, User } from 'lucide-react';
import { FinishedGoodsLot, BulkTeaBatch, PackagingSpec } from '../types';

interface LotLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: FinishedGoodsLot | null;
  batch?: BulkTeaBatch;
  spec?: PackagingSpec;
}

export const LotLabelModal: React.FC<LotLabelModalProps> = ({
  isOpen,
  onClose,
  lot,
  batch,
  spec,
}) => {
  if (!isOpen || !lot) return null;

  const netGrams = lot.netWeightG;
  const netOz = (netGrams * 0.035274).toFixed(2);

  const displayWeight = lot.packWeightValue
    ? `${lot.packWeightValue} ${lot.packWeightUnit || 'g'}`
    : lot.netWeightG >= 1000
    ? `${(lot.netWeightG / 1000).toFixed(1)} kg`
    : `${lot.netWeightG} g`;

  const isKg = lot.packWeightUnit === 'kg' || lot.netWeightG >= 1000;
  const packerName = lot.packerName || 'Line Lead';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg border border-stone-300 shadow-2xl max-w-lg w-full p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-sm text-stone-900">
              Packaging Lot Label &amp; Compliance Tag
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-base font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Printable Label Artwork Container */}
        <div
          id="printable-tea-label"
          className="border-2 border-stone-900 rounded-lg p-5 bg-stone-50/40 text-stone-900 font-sans space-y-3 shadow-inner"
        >
          {/* Header Brand */}
          <div className="border-b-2 border-stone-900 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                <Leaf className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest block leading-tight">
                  KISII HIGHLANDS TEA PROCESSORS
                </span>
                <span className="text-[9px] text-stone-600 uppercase tracking-wider block">
                  Kisii Packaging Plant • Kisii, Kenya • TBK/PK/KSI/2026
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold bg-stone-900 text-white px-2 py-0.5 rounded block">
                GRADE {batch?.grade || spec?.targetGrade || 'BP1'}
              </span>
              <span className="text-[8px] text-emerald-800 font-bold block mt-0.5">
                KEBS KS EAS 28:2020
              </span>
            </div>
          </div>

          {/* Product Name & SKU */}
          <div className="pt-1">
            <h2 className="text-base font-black text-stone-950 uppercase tracking-tight">
              {lot.productName}
            </h2>
            <div className="flex items-center justify-between text-[11px] text-stone-600 mt-0.5">
              <span>Origin: {batch?.estateName || 'Kisii Highlands, Kenya'}</span>
              <span className="font-mono">{spec?.sku || 'FG-TEA-PACK'}</span>
            </div>
          </div>

          {/* PROMINENT NET WEIGHT BADGE - Displays grams or kg dynamically */}
          <div className="bg-stone-900 text-white p-3 rounded text-center my-2 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block mb-0.5">
              Certified Net Content
            </span>
            <div className="text-2xl font-black font-mono tracking-tight">
              NET WT. {displayWeight}
              <span className="text-sm font-normal text-stone-300 ml-2 font-sans">
                ({isKg ? `${netGrams} g / ` : ''}{netOz} oz)
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Pure Natural Tea • No Artificial Flavors or Preservatives
            </span>
          </div>

          {/* Lot, Expiry & Packer Details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-stone-300 font-mono">
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-sans">Lot Number</span>
              <strong className="text-stone-900 text-xs">{lot.lotNumber}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-sans">The One Packing</span>
              <strong className="text-amber-900 text-xs">{packerName}</strong>
            </div>
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-sans">Bulk Batch Source</span>
              <span className="text-stone-800 text-xs">{batch?.batchNumber || 'BT-2026-SOURCE'}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-sans">Packaged Date</span>
              <span className="text-stone-800">{lot.productionDate}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-sans">Best Before</span>
              <span className="text-emerald-800 font-bold">{lot.bestBeforeDate}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[9px] uppercase font-sans">Storage Location</span>
              <span className="text-stone-700">{lot.warehouseLocation}</span>
            </div>
          </div>

          {/* Simulated Industrial Barcode SVG */}
          <div className="text-center pt-2">
            <div className="h-10 mx-auto max-w-[260px] flex items-end justify-center gap-0.5 px-2 bg-white rounded border border-stone-200 py-1">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2].map(
                (w, i) => (
                  <div
                    key={i}
                    className="bg-stone-950 h-full"
                    style={{ width: `${w * 2}px` }}
                  />
                )
              )}
            </div>
            <span className="font-mono text-[10px] text-stone-600 block mt-1 tracking-widest">
              * {lot.lotNumber.replace(/-/g, '')} *
            </span>
          </div>

          {/* Storage & Regulatory Info */}
          <div className="pt-2 border-t border-stone-300 flex items-center justify-between text-[9px] text-stone-500">
            <span>P.O. Box 1420, Kisii, Kenya • Packed by: {packerName}</span>
            <span className="font-semibold text-stone-700">KEBS &amp; ISO 22000 Certified</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-stone-500">Ready for thermal or laser packaging printer</span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
