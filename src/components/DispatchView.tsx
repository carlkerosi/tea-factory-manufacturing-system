import React, { useState } from 'react';
import {
  SendHorizontal,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Calendar,
  Scale,
  Printer,
  Boxes,
  Users,
} from 'lucide-react';
import { DispatchOrder, Customer, FinishedGoodsLot } from '../types';

interface DispatchViewProps {
  dispatches: DispatchOrder[];
  customers: Customer[];
  lots: FinishedGoodsLot[];
  onAddDispatch: (dispatch: Omit<DispatchOrder, 'id'>) => void;
}

export const DispatchView: React.FC<DispatchViewProps> = ({
  dispatches,
  customers,
  lots,
  onAddDispatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePrintDispatch, setActivePrintDispatch] = useState<DispatchOrder | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || '');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().slice(0, 10));
  const [carrier, setCarrier] = useState('Swift Freight Logistics');
  const [vehicleNumber, setVehicleNumber] = useState('KDA 392X (Van)');
  const [selectedLotId, setSelectedLotId] = useState<string>(
    lots.filter((l) => l.currentUnits > 0)[0]?.id || ''
  );
  const [unitsToDispatch, setUnitsToDispatch] = useState<number>(240);
  const [notes, setNotes] = useState('');

  const availableLots = lots.filter((l) => l.currentUnits > 0);
  const selectedLot = lots.find((l) => l.id === selectedLotId);

  // Math
  const netGrams = selectedLot?.netWeightG || 50;
  const maxAvailableUnits = selectedLot?.currentUnits || 0;
  const dispatchWeightKg = (unitsToDispatch * netGrams) / 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || unitsToDispatch <= 0 || unitsToDispatch > maxAvailableUnits) return;

    const dispatchNumber = `DSP-${new Date().getFullYear()}-${String(dispatches.length + 43).padStart(3, '0')}`;

    onAddDispatch({
      dispatchNumber,
      orderDate: new Date().toISOString().slice(0, 10),
      dispatchDate,
      customerId,
      items: [
        {
          lotId: selectedLot.id,
          unitsDispatched: unitsToDispatch,
          netWeightG: netGrams,
          totalTeaWeightKg: dispatchWeightKg,
        },
      ],
      totalUnits: unitsToDispatch,
      totalNetWeightKg: dispatchWeightKg,
      carrier,
      vehicleNumber,
      status: 'dispatched',
      notes,
    });

    setIsModalOpen(false);
  };

  const filteredDispatches = dispatches.filter((d) => {
    const cust = customers.find((c) => c.id === d.customerId);
    return (
      d.dispatchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.carrier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust && cust.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <SendHorizontal className="w-5 h-5 text-emerald-700" />
            <span>Customer Dispatches &amp; Shipping Orders</span>
          </h2>
          <p className="text-xs text-stone-500">
            Fulfill wholesale &amp; retail customer orders with specific packaged lot allocation and delivery manifests.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={availableLots.length === 0}
          className={`flex items-center gap-1.5 text-white font-medium text-xs px-3.5 py-2 rounded-md shadow-xs transition-colors ${
            availableLots.length > 0
              ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
              : 'bg-stone-400 cursor-not-allowed opacity-70'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch Shipment</span>
        </button>
      </div>

      {/* Dispatches Table */}
      <div className="bg-white rounded-lg border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider">
                <th className="py-3 px-4">Dispatch Order</th>
                <th className="py-3 px-4">Client / Destination</th>
                <th className="py-3 px-4">Shipment Date</th>
                <th className="py-3 px-4">Lots Shipped</th>
                <th className="py-3 px-4 text-right">Units Shipped</th>
                <th className="py-3 px-4 text-right">Net Tea Weight</th>
                <th className="py-3 px-4">Carrier &amp; Vehicle</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Manifest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDispatches.map((d) => {
                const customer = customers.find((c) => c.id === d.customerId);

                return (
                  <tr key={d.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-stone-900 block">{d.dispatchNumber}</span>
                      <span className="text-[10px] text-stone-400">Order: {d.orderDate}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900">{customer?.companyName}</span>
                      <span className="block text-[10px] text-stone-400 truncate max-w-xs">
                        {customer?.address}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-700">{d.dispatchDate}</td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        {d.items.map((item, i) => {
                          const lot = lots.find((l) => l.id === item.lotId);
                          return (
                            <div key={i} className="text-[11px] font-mono">
                              <span className="font-semibold text-emerald-800">{lot?.lotNumber || item.lotId}</span>{' '}
                              <span className="text-stone-500">({item.netWeightG}g × {item.unitsDispatched})</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      {d.totalUnits.toLocaleString()} packs
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-800">
                      {d.totalNetWeightKg.toFixed(1)} kg
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      <div>{d.carrier}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{d.vehicleNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-medium capitalize">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActivePrintDispatch(d)}
                        className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-emerald-700" />
                        <span>Slip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Delivery Note / Dispatch Slip Modal */}
      {activePrintDispatch && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-300 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b-2 border-stone-900 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-stone-900">
                  Kisii Highlands Tea Processors Ltd
                </h3>
                <p className="text-xs text-stone-600">
                  Kisii Packaging &amp; Blending Plant, Kisii, Kenya &bull; Factory Dispatch Note
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-base text-stone-900">{activePrintDispatch.dispatchNumber}</span>
                <span className="block text-[11px] text-stone-500">Date: {activePrintDispatch.dispatchDate}</span>
              </div>
            </div>

            {/* Consignee */}
            {(() => {
              const customer = customers.find((c) => c.id === activePrintDispatch.customerId);
              return (
                <div className="grid grid-cols-2 gap-4 text-xs bg-stone-50 p-3 rounded border border-stone-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Consignee / Customer</span>
                    <strong className="text-stone-900 text-sm">{customer?.companyName}</strong>
                    <div className="text-stone-600 mt-0.5">{customer?.address}</div>
                    <div className="text-stone-600">Attn: {customer?.contactName} ({customer?.phone})</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">Logistics Information</span>
                    <div className="text-stone-700">Carrier: <strong>{activePrintDispatch.carrier}</strong></div>
                    <div className="text-stone-700">Vehicle: <span className="font-mono">{activePrintDispatch.vehicleNumber}</span></div>
                    <div className="text-stone-700 mt-1">Status: <span className="text-emerald-800 font-bold uppercase">{activePrintDispatch.status}</span></div>
                  </div>
                </div>
              );
            })()}

            {/* Items Table */}
            <div>
              <table className="w-full text-left text-xs border border-stone-200">
                <thead className="bg-stone-100 border-b border-stone-200 text-stone-700">
                  <tr>
                    <th className="py-2 px-3">Lot Number</th>
                    <th className="py-2 px-3">Product Description</th>
                    <th className="py-2 px-3 text-center">Pack Size</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-right">Net Tea Kg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {activePrintDispatch.items.map((it, idx) => {
                    const lot = lots.find((l) => l.id === it.lotId);
                    return (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-mono font-bold text-stone-900">{lot?.lotNumber || it.lotId}</td>
                        <td className="py-2 px-3 text-stone-800">{lot?.productName}</td>
                        <td className="py-2 px-3 text-center font-mono font-bold">{it.netWeightG}g</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">{it.unitsDispatched} units</td>
                        <td className="py-2 px-3 text-right font-mono">{it.totalTeaWeightKg.toFixed(2)} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-stone-50 font-bold text-stone-900 border-t border-stone-200">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right">Total Shipment:</td>
                    <td className="py-2 px-3 text-right font-mono">{activePrintDispatch.totalUnits} packs</td>
                    <td className="py-2 px-3 text-right font-mono text-emerald-800">
                      {activePrintDispatch.totalNetWeightKg.toFixed(2)} kg
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Signatures */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-stone-500 border-t border-stone-200">
              <div>
                <div className="border-b border-stone-400 pb-8" />
                <span className="block mt-1">Dispatched By (Warehouse QA Lead)</span>
              </div>
              <div>
                <div className="border-b border-stone-400 pb-8" />
                <span className="block mt-1">Received By (Customer / Carrier Sign)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-emerald-700 text-white rounded text-xs font-medium hover:bg-emerald-800 cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => setActivePrintDispatch(null)}
                className="px-4 py-1.5 bg-stone-800 text-white rounded text-xs font-medium hover:bg-stone-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-stone-200 shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <SendHorizontal className="w-5 h-5 text-emerald-700" />
                <span>Create Customer Dispatch Order</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-base font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Customer / Client</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.customerType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Select Finished Packaged Lot to Ship
                </label>
                <select
                  value={selectedLotId}
                  onChange={(e) => {
                    setSelectedLotId(e.target.value);
                    const chosen = lots.find((l) => l.id === e.target.value);
                    if (chosen) setUnitsToDispatch(Math.min(240, chosen.currentUnits));
                  }}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {availableLots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lotNumber} • {l.productName} ({l.netWeightG}g) - {l.currentUnits} packs available
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">
                    Units to Dispatch ({netGrams}g packs)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxAvailableUnits}
                    required
                    value={unitsToDispatch}
                    onChange={(e) => setUnitsToDispatch(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  <span className="text-[10px] text-stone-400">Max available: {maxAvailableUnits} packs</span>
                </div>

                <div className="bg-stone-50 p-2.5 rounded border border-stone-200">
                  <span className="text-[10px] text-stone-500 block uppercase font-medium">Net Tea Dispatched</span>
                  <span className="text-base font-bold text-emerald-800 font-mono">
                    {dispatchWeightKg.toFixed(2)} kg
                  </span>
                  <span className="block text-[10px] text-stone-400">
                    ~{(unitsToDispatch / 48).toFixed(1)} master cartons
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Carrier / Freight</label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-medium mb-1">Vehicle License #</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Dispatch Date</label>
                <input
                  type="date"
                  value={dispatchDate}
                  onChange={(e) => setDispatchDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
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
                  Dispatch Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
