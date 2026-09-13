import React, { useState } from 'react';
import {
  Leaf,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Scale,
  Calendar,
  Layers,
  ChevronRight,
  Factory,
} from 'lucide-react';
import { BulkTeaBatch, Supplier, TeaGrade, PackagingRun } from '../types';

interface BulkTeaViewProps {
  batches: BulkTeaBatch[];
  suppliers: Supplier[];
  runs: PackagingRun[];
  onAddBatch: (batch: Omit<BulkTeaBatch, 'id' | 'remainingWeightKg' | 'status'>) => void;
  onSelectRun?: (runId: string) => void;
}

export const BulkTeaView: React.FC<BulkTeaViewProps> = ({
  batches,
  suppliers,
  runs,
  onAddBatch,
  onSelectRun,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeBatchDetail, setActiveBatchDetail] = useState<BulkTeaBatch | null>(null);

  // Form State
  const [batchNumber, setBatchNumber] = useState(`BT-${new Date().getFullYear()}-${String(batches.length + 101).padStart(3, '0')}`);
  const [estateName, setEstateName] = useState('');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [grade, setGrade] = useState<TeaGrade>('BP1');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [initialWeightKg, setInitialWeightKg] = useState<number>(1000);
  const [moisturePercent, setMoisturePercent] = useState<number>(5.5);
  const [tastingScore, setTastingScore] = useState<number>(90);
  const [warehouseBin, setWarehouseBin] = useState('Silo Bay 1 - Tank A');
  const [costPerKg, setCostPerKg] = useState<number>(520.00);
  const [notes, setNotes] = useState('');

  const teaSuppliers = suppliers.filter((s) => s.category !== 'packaging_converter');

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.estateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.warehouseBin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || b.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estateName || initialWeightKg <= 0) return;

    onAddBatch({
      batchNumber,
      estateName,
      supplierId,
      grade,
      harvestDate,
      receivedDate,
      initialWeightKg,
      moisturePercent,
      tastingScore,
      warehouseBin,
      costPerKg,
      notes,
    });

    setIsAddModalOpen(false);
    // Reset defaults
    setEstateName('');
    setNotes('');
    setBatchNumber(`BT-${new Date().getFullYear()}-${String(batches.length + 102).padStart(3, '0')}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-700" />
            <span>Bulk Tea Silo &amp; Intake Inventory</span>
          </h2>
          <p className="text-xs text-stone-500">
            Raw bulky tea intake from estates &amp; auctions. Tracks moisture %, tasting scores, and available kg for packaging lines.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-3.5 py-2 rounded-md shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Receive Bulk Tea Batch</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-lg border border-stone-200 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by batch #, estate name, silo location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500">Tea Grade:</span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded px-2.5 py-1.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value="all">All Grades ({batches.length})</option>
            <option value="BP1">BP1 (Broken Pekoe 1)</option>
            <option value="PF1">PF1 (Pekoe Fannings 1)</option>
            <option value="PD">PD (Pekoe Dust)</option>
            <option value="FTGFOP">FTGFOP (Orthodox)</option>
            <option value="Green Sencha">Green Sencha</option>
          </select>
        </div>
      </div>

      {/* Bulk Batches Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Estate &amp; Origin</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Intake Date</th>
                <th className="py-3 px-4 text-center">Moisture %</th>
                <th className="py-3 px-4 text-right">Original Intake</th>
                <th className="py-3 px-4 text-right">Available Weight</th>
                <th className="py-3 px-4">Location / Silo</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBatches.map((batch) => {
                const percentLeft = (batch.remainingWeightKg / batch.initialWeightKg) * 100;
                const supplier = suppliers.find((s) => s.id === batch.supplierId);
                const batchRuns = runs.filter((r) => r.teaBatchId === batch.id);

                return (
                  <tr key={batch.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-stone-900">{batch.batchNumber}</span>
                      {batch.tastingScore && (
                        <span className="block text-[10px] text-emerald-700 font-medium">
                          Cup Score: {batch.tastingScore}/100
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{batch.estateName}</div>
                      <div className="text-[11px] text-stone-400">{supplier?.name || 'Estate Supplier'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-semibold bg-stone-100 text-stone-800">
                        {batch.grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div>{batch.receivedDate}</div>
                      <div className="text-[10px] text-stone-400">Harvest: {batch.harvestDate}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                          batch.moisturePercent <= 6.5
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {batch.moisturePercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-stone-600">
                      {batch.initialWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1 })} kg
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-emerald-900">
                        {batch.remainingWeightKg.toLocaleString(undefined, { minimumFractionDigits: 1 })} kg
                      </div>
                      <div className="w-24 bg-stone-200 rounded-full h-1.5 ml-auto mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, percentLeft))}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">{percentLeft.toFixed(0)}% remaining</span>
                    </td>
                    <td className="py-3 px-4 text-stone-700 font-mono text-[11px]">
                      {batch.warehouseBin}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {batch.remainingWeightKg === 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] font-medium">
                          Depleted
                        </span>
                      ) : batch.remainingWeightKg < 200 ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-medium">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveBatchDetail(batch)}
                        className="text-emerald-700 hover:text-emerald-800 font-medium text-[11px] underline cursor-pointer"
                      >
                        History ({batchRuns.length})
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Details & Packaging History Modal */}
      {activeBatchDetail && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-lg max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>Batch Genealogy &amp; Usage: {activeBatchDetail.batchNumber}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono">
                    {activeBatchDetail.grade}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">{activeBatchDetail.estateName}</p>
              </div>
              <button
                onClick={() => setActiveBatchDetail(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3 rounded-md border border-stone-200">
              <div>
                <span className="text-stone-500 block">Intake Weight</span>
                <span className="font-bold text-stone-900">{activeBatchDetail.initialWeightKg} kg</span>
              </div>
              <div>
                <span className="text-stone-500 block">Current Remaining</span>
                <span className="font-bold text-emerald-700">{activeBatchDetail.remainingWeightKg.toFixed(1)} kg</span>
              </div>
              <div>
                <span className="text-stone-500 block">Cost / kg</span>
                <span className="font-bold text-stone-900 font-mono">KSh {activeBatchDetail.costPerKg?.toLocaleString() || 520}</span>
                <span className="text-[10px] text-stone-400 block">Val: KSh {((activeBatchDetail.costPerKg || 520) * activeBatchDetail.remainingWeightKg).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Storage Location</span>
                <span className="font-mono text-stone-800">{activeBatchDetail.warehouseBin}</span>
              </div>
            </div>

            {activeBatchDetail.notes && (
              <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded border border-stone-200 italic">
                &ldquo;{activeBatchDetail.notes}&rdquo;
              </p>
            )}

            <div>
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Packaging Runs Utilizing This Batch
              </h4>
              {runs.filter((r) => r.teaBatchId === activeBatchDetail.id).length === 0 ? (
                <p className="text-xs text-stone-400 py-3 text-center">
                  No packaging runs have consumed tea from this batch yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {runs
                    .filter((r) => r.teaBatchId === activeBatchDetail.id)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded border border-stone-200 bg-stone-50/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-stone-900">
                            {r.runNumber} • Lot {r.generatedLotNumber}
                          </div>
                          <div className="text-stone-500 text-[11px]">
                            Packed on {r.date} by {r.operatorName}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-stone-900 font-mono">
                            {r.actualUnitsProduced.toLocaleString()} packs ({r.netWeightG}g)
                          </span>
                          <span className="block text-[11px] text-emerald-800">
                            {r.teaActualUsedKg.toFixed(2)} kg bulk tea consumed
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 text-right">
              <button
                onClick={() => setActiveBatchDetail(null)}
                className="px-4 py-1.5 bg-stone-800 text-white rounded text-xs font-medium hover:bg-stone-700 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Bulk Tea Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-xl w-full p-5 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-700" />
                <span>Receive Raw Bulk Tea Batch</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Tea Grade</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as TeaGrade)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="BP1">BP1 (Broken Pekoe 1)</option>
                    <option value="PF1">PF1 (Pekoe Fannings 1)</option>
                    <option value="PD">PD (Pekoe Dust)</option>
                    <option value="D1">D1 (Dust 1)</option>
                    <option value="FTGFOP">FTGFOP (Orthodox Whole Leaf)</option>
                    <option value="TGFOP">TGFOP (Tippy Golden)</option>
                    <option value="BOP">BOP (Broken Orange Pekoe)</option>
                    <option value="OP">OP (Orange Pekoe)</option>
                    <option value="Green Sencha">Green Sencha</option>
                    <option value="Earl Grey Blend">Earl Grey Blend</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Estate / Plantation Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kericho Highland Estate"
                    value={estateName}
                    onChange={(e) => setEstateName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Supplier Entity</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {teaSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Net Weight Intake (kg)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={initialWeightKg}
                    onChange={(e) => setInitialWeightKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Moisture Content (%)</label>
                  <input
                    type="number"
                    min="2"
                    max="14"
                    step="0.1"
                    required
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">Target: 4.5% - 6.5%</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Tasting Score (0-100)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={tastingScore}
                    onChange={(e) => setTastingScore(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Warehouse Silo / Bay</label>
                  <input
                    type="text"
                    value={warehouseBin}
                    onChange={(e) => setWarehouseBin(e.target.value)}
                    placeholder="e.g. Silo Bay 2 - Tank A"
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Intake Date</label>
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Cost / kg (KSh)</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={costPerKg}
                    onChange={(e) => setCostPerKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">e.g. KSh 520 / kg</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Quality &amp; Sensory Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Brisk briskness, bright coppery infusion, ideal for 50g retail packs..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
                  Register Bulk Tea Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
