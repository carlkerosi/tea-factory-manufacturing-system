import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BulkTeaView } from './components/BulkTeaView';
import { MaterialsView } from './components/MaterialsView';
import { ResearchGuideView } from './components/ResearchGuideView';
import { PackageSpecsView } from './components/PackageSpecsView';
import { PackagingRunsView } from './components/PackagingRunsView';
import { FinishedGoodsView } from './components/FinishedGoodsView';
import { DispatchView } from './components/DispatchView';
import { SuppliersCustomersView } from './components/SuppliersCustomersView';
import { PackagingRunWizard } from './components/PackagingRunWizard';
import { LotLabelModal } from './components/LotLabelModal';
import { loadStoredData, saveStoredData, resetStoredData } from './utils/storage';
import {
  BulkTeaBatch,
  PackingMaterial,
  PackagingSpec,
  PackagingRun,
  FinishedGoodsLot,
  DispatchOrder,
  Supplier,
  Customer,
} from './types';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => loadStoredData());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Wizard state
  const [isRunWizardOpen, setIsRunWizardOpen] = useState(false);
  const [wizardBatchId, setWizardBatchId] = useState<string | undefined>(undefined);
  const [wizardSpecId, setWizardSpecId] = useState<string | undefined>(undefined);
  const [wizardUnits, setWizardUnits] = useState<number | undefined>(undefined);
  const [wizardWeightValue, setWizardWeightValue] = useState<number | undefined>(undefined);
  const [wizardWeightUnit, setWizardWeightUnit] = useState<'g' | 'kg' | undefined>(undefined);

  // Label printing modal state
  const [printLotNumber, setPrintLotNumber] = useState<string | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Persist state changes
  useEffect(() => {
    saveStoredData(data);
  }, [data]);

  // Handler: Add Bulk Tea Batch
  const handleAddBatch = (
    batchInput: Omit<BulkTeaBatch, 'id' | 'remainingWeightKg' | 'status'>
  ) => {
    const newBatch: BulkTeaBatch = {
      ...batchInput,
      id: `bt_${Date.now()}`,
      remainingWeightKg: batchInput.initialWeightKg,
      status: 'in_stock',
    };

    setData((prev) => ({
      ...prev,
      teaBatches: [newBatch, ...prev.teaBatches],
    }));

    showToast(`Bulk Tea Batch #${newBatch.batchNumber} (${newBatch.grade}) received: ${newBatch.initialWeightKg} kg.`);
  };

  // Handler: Add Packing Material
  const handleAddMaterial = (matInput: Omit<PackingMaterial, 'id'>) => {
    const newMaterial: PackingMaterial = {
      ...matInput,
      id: `pm_${Date.now()}`,
    };

    setData((prev) => ({
      ...prev,
      materials: [newMaterial, ...prev.materials],
    }));

    showToast(`Packaging material "${newMaterial.name}" added to inventory.`);
  };

  // Handler: Receive Material Stock Restock
  const handleReceiveStock = (materialId: string, additionalQuantity: number) => {
    setData((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.id === materialId
          ? { ...m, stockQuantity: m.stockQuantity + additionalQuantity }
          : m
      ),
    }));

    const mat = data.materials.find((m) => m.id === materialId);
    showToast(`Restocked ${additionalQuantity} units of ${mat?.name || 'material'}.`);
  };

  // Handler: Add Packaging Spec (BOM)
  const handleAddSpec = (specInput: Omit<PackagingSpec, 'id'>) => {
    const newSpec: PackagingSpec = {
      ...specInput,
      id: `spec_${Date.now()}`,
    };

    setData((prev) => ({
      ...prev,
      packageSpecs: [...prev.packageSpecs, newSpec],
    }));

    showToast(`Package size specification "${newSpec.productName}" (${newSpec.netWeightG}g) registered.`);
  };

  // Handler: Execute Packaging Run (Mass Balance & Atomic Deduction)
  const handleExecuteRun = (
    runInput: Omit<PackagingRun, 'id'>,
    lotInput: Omit<FinishedGoodsLot, 'id'>
  ) => {
    const runId = `run_${Date.now()}`;
    const lotId = `lot_${Date.now()}`;

    const newRun: PackagingRun = {
      ...runInput,
      id: runId,
    };

    const newLot: FinishedGoodsLot = {
      ...lotInput,
      id: lotId,
      runId: runId,
    };

    setData((prev) => {
      // 1. Deduct raw tea from BulkTeaBatch
      const updatedBatches = prev.teaBatches.map((b) => {
        if (b.id === newRun.teaBatchId) {
          const newRemaining = Math.max(0, b.remainingWeightKg - newRun.teaActualUsedKg);
          return {
            ...b,
            remainingWeightKg: Math.round(newRemaining * 100) / 100,
            status: (newRemaining <= 0.05 ? 'depleted' : 'in_stock') as any,
          };
        }
        return b;
      });

      // 2. Deduct packing materials (pouches, labels, shipper cartons)
      const updatedMaterials = prev.materials.map((mat) => {
        const consumed = newRun.materialsConsumed.find((c) => c.materialId === mat.id);
        if (consumed) {
          return {
            ...mat,
            stockQuantity: Math.max(0, mat.stockQuantity - consumed.quantityUsed),
          };
        }
        return mat;
      });

      // 3. Append run and finished goods lot
      return {
        ...prev,
        teaBatches: updatedBatches,
        materials: updatedMaterials,
        runs: [newRun, ...prev.runs],
        finishedGoods: [newLot, ...prev.finishedGoods],
      };
    });

    showToast(
      `Packaging Run #${newRun.runNumber} completed! Packaged ${newRun.actualUnitsProduced} × ${newRun.netWeightG}g units. Lot #${newLot.lotNumber} created.`,
      'success'
    );
  };

  // Handler: Add Dispatch Order
  const handleAddDispatch = (dispatchInput: Omit<DispatchOrder, 'id'>) => {
    const newDispatch: DispatchOrder = {
      ...dispatchInput,
      id: `dsp_${Date.now()}`,
    };

    setData((prev) => {
      // Deduct units from matching finished goods lots
      const updatedLots = prev.finishedGoods.map((lot) => {
        const item = newDispatch.items.find((it) => it.lotId === lot.id);
        if (item) {
          const newUnits = Math.max(0, lot.currentUnits - item.unitsDispatched);
          return {
            ...lot,
            currentUnits: newUnits,
            status: (newUnits <= 0 ? 'shipped' : 'available') as any,
          };
        }
        return lot;
      });

      return {
        ...prev,
        dispatches: [newDispatch, ...prev.dispatches],
        finishedGoods: updatedLots,
      };
    });

    showToast(`Dispatch #${newDispatch.dispatchNumber} shipped: ${newDispatch.totalUnits} packs dispatched.`);
  };

  // Handler: Add Supplier
  const handleAddSupplier = (supInput: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = {
      ...supInput,
      id: `sup_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      suppliers: [...prev.suppliers, newSup],
    }));
    showToast(`Partner "${newSup.name}" saved.`);
  };

  // Handler: Add Customer
  const handleAddCustomer = (custInput: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...custInput,
      id: `cust_${Date.now()}`,
    };
    setData((prev) => ({
      ...prev,
      customers: [...prev.customers, newCust],
    }));
    showToast(`Customer "${newCust.companyName}" registered.`);
  };

  // Handler: Reset Demo Data
  const handleResetData = () => {
    const initial = resetStoredData();
    setData(initial);
    showToast('Factory database reset to standard baseline demo data.');
  };

  // Handler: Export Data JSON
  const handleExportData = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tea-packaging-system-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully.');
  };

  // Launch wizard with preselected params
  const launchRunWithParams = (
    batchId?: string,
    specId?: string,
    units?: number,
    weightValue?: number,
    weightUnit?: 'g' | 'kg'
  ) => {
    setWizardBatchId(batchId);
    setWizardSpecId(specId);
    setWizardUnits(units);
    setWizardWeightValue(weightValue);
    setWizardWeightUnit(weightUnit);
    setIsRunWizardOpen(true);
  };

  // Find lot details for print label modal
  const lotForPrint = printLotNumber
    ? data.finishedGoods.find((l) => l.lotNumber === printLotNumber) || null
    : null;
  const batchForPrint = lotForPrint
    ? data.teaBatches.find((b) => b.id === lotForPrint.teaBatchId)
    : undefined;
  const specForPrint = lotForPrint
    ? data.packageSpecs.find((s) => s.id === lotForPrint.specId)
    : undefined;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col">
      {/* Global Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenRunWizard={() => launchRunWithParams()}
        data={data}
        onResetData={handleResetData}
        onExportData={handleExportData}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-stone-900 text-white px-4 py-3 rounded-lg shadow-xl border border-stone-700 flex items-center gap-3 text-xs max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-snug">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            data={data}
            onNavigate={setCurrentTab}
            onStartRunFromCalc={(batchId, specId, units, weightValue, weightUnit) =>
              launchRunWithParams(batchId, specId, units, weightValue, weightUnit)
            }
          />
        )}

        {currentTab === 'bulk-tea' && (
          <BulkTeaView
            batches={data.teaBatches}
            suppliers={data.suppliers}
            runs={data.runs}
            onAddBatch={handleAddBatch}
            onSelectRun={(runId) => {
              setCurrentTab('runs');
            }}
          />
        )}

        {currentTab === 'materials' && (
          <MaterialsView
            materials={data.materials}
            suppliers={data.suppliers}
            onAddMaterial={handleAddMaterial}
            onReceiveStock={handleReceiveStock}
            onNavigateToResearch={() => setCurrentTab('research-guide')}
          />
        )}

        {currentTab === 'research-guide' && (
          <ResearchGuideView
            onAdoptMaterial={handleAddMaterial}
            onNavigateToSpecs={() => setCurrentTab('specs')}
          />
        )}

        {currentTab === 'specs' && (
          <PackageSpecsView
            specs={data.packageSpecs}
            materials={data.materials}
            onAddSpec={handleAddSpec}
            onLaunchRunWithSpec={(specId) => launchRunWithParams(undefined, specId)}
          />
        )}

        {currentTab === 'runs' && (
          <PackagingRunsView
            runs={data.runs}
            batches={data.teaBatches}
            specs={data.packageSpecs}
            materials={data.materials}
            onOpenWizard={() => launchRunWithParams()}
            onPrintLotLabel={(lotNum) => setPrintLotNumber(lotNum)}
          />
        )}

        {currentTab === 'finished-goods' && (
          <FinishedGoodsView
            lots={data.finishedGoods}
            runs={data.runs}
            batches={data.teaBatches}
            specs={data.packageSpecs}
            materials={data.materials}
            dispatches={data.dispatches}
            customers={data.customers}
            onPrintLabel={(lotNum) => setPrintLotNumber(lotNum)}
          />
        )}

        {currentTab === 'dispatch' && (
          <DispatchView
            dispatches={data.dispatches}
            customers={data.customers}
            lots={data.finishedGoods}
            onAddDispatch={handleAddDispatch}
          />
        )}

        {currentTab === 'partners' && (
          <SuppliersCustomersView
            suppliers={data.suppliers}
            customers={data.customers}
            onAddSupplier={handleAddSupplier}
            onAddCustomer={handleAddCustomer}
          />
        )}
      </main>

      {/* Production Run Wizard Modal */}
      <PackagingRunWizard
        isOpen={isRunWizardOpen}
        onClose={() => setIsRunWizardOpen(false)}
        batches={data.teaBatches}
        specs={data.packageSpecs}
        materials={data.materials}
        initialBatchId={wizardBatchId}
        initialSpecId={wizardSpecId}
        initialUnits={wizardUnits}
        initialWeightValue={wizardWeightValue}
        initialWeightUnit={wizardWeightUnit}
        onExecuteRun={handleExecuteRun}
      />

      {/* Printable Packaging Label Modal */}
      <LotLabelModal
        isOpen={!!printLotNumber}
        onClose={() => setPrintLotNumber(null)}
        lot={lotForPrint}
        batch={batchForPrint}
        spec={specForPrint}
      />

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Kisii Highlands Tea Processors Ltd &bull; Kisii Packaging &amp; Blending Plant, Kisii, Kenya
          </span>
          <span className="font-mono text-[11px] text-stone-400">
            TBK &amp; KEBS KS EAS 28:2020 Certified &bull; Gram &amp; Kilogram Packaging Control
          </span>
        </div>
      </footer>
    </div>
  );
}
