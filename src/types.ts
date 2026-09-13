export type TeaGrade =
  | 'BP1' // Broken Pekoe 1
  | 'PF1' // Pekoe Fannings 1
  | 'PD'  // Pekoe Dust
  | 'D1'  // Dust 1
  | 'FTGFOP' // Finest Tippy Golden Flowery Orange Pekoe (Orthodox)
  | 'TGFOP'  // Tippy Golden Flowery Orange Pekoe
  | 'BOP'    // Broken Orange Pekoe
  | 'OP'     // Orange Pekoe
  | 'Green Sencha'
  | 'Earl Grey Blend'
  | 'Jasmine Green'
  | 'Custom Blend';

export type MaterialCategory =
  | 'pouch'          // Stand-up pouches, zipper pouches, flat bottom
  | 'pyramid_mesh'   // PLA cornstarch or nylon mesh roll
  | 'filter_paper'   // Traditional tea bag paper roll
  | 'string_tag'     // Cotton thread & printed tags
  | 'envelope'       // Individual outer sachets
  | 'tin_caddy'      // Metal airtight tins
  | 'inner_foil'     // Metallized barrier liner bags
  | 'shipper_carton' // Corrugated master shipping cartons
  | 'label_sticker'  // Adhesive brand & barcode labels
  | 'sealing_tape'   // Carton sealing tape
  | 'oxygen_absorber';// Food grade scavengers

export interface Supplier {
  id: string;
  name: string;
  category: 'tea_estate' | 'packaging_converter' | 'both';
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  certification?: string; // e.g. Rainforest Alliance, Fairtrade, ISO 22000, FSSC 22000
  rating?: number; // 1 to 5
}

export interface BulkTeaBatch {
  id: string;
  batchNumber: string; // e.g. "BT-2026-089"
  estateName: string;   // e.g. "Kericho Highland Gardens", "Assam Valley", "Rukeri Estate"
  supplierId: string;
  grade: TeaGrade;
  harvestDate: string;
  receivedDate: string;
  initialWeightKg: number;
  remainingWeightKg: number;
  moisturePercent: number; // typically 4.5% - 7.5%
  tastingScore?: number;   // out of 100
  warehouseBin: string;    // e.g. "Bay 3 - Silo B"
  costPerKg: number;
  status: 'in_stock' | 'low_stock' | 'depleted';
  notes?: string;
}

export interface PackingMaterial {
  id: string;
  sku: string;             // e.g. "PK-POUCH-50G-KRAFT"
  name: string;            // e.g. "50g Matte Kraft Foil Stand-up Pouch with Zip"
  category: MaterialCategory;
  supplierId: string;
  unit: 'pieces' | 'rolls' | 'meters' | 'boxes';
  stockQuantity: number;
  minReorderLevel: number;
  unitCost: number;
  barrierSpecs?: {
    materialLayers: string; // e.g. "Kraft 50gsm / AL 7um / PE 60um"
    moistureBarrier: 'High' | 'Very High' | 'Medium';
    oxygenBarrier: 'High' | 'Very High' | 'Medium';
    lightProtection: '100% Opaque' | 'Semi-transparent' | 'Windowed';
    targetNetWeightG?: number; // e.g. 50g
    foodGradeCertified: boolean;
  };
  suitableForPacks: number[]; // e.g. [50] or [100, 250]
  leadTimeDays: number;
  location: string; // e.g. "Packaging Storage Shelf A-12"
}

export interface BomItem {
  materialId: string;
  quantityPerUnit: number; // e.g. 1 pouch per unit, or 0.02 cartons per unit (1 carton per 50 units)
  description: string;
}

export interface PackagingSpec {
  id: string;
  productName: string;       // e.g. "Premium Classic 50g Foil Pouch"
  sku: string;               // e.g. "FG-BP1-050G"
  targetGrade: TeaGrade;
  netWeightG: number;        // standardized weight in grams (e.g. 50g or 1000g for 1kg)
  netWeightUnit?: 'g' | 'kg'; // preferred display unit
  netWeightValue?: number;   // numerical value in preferred unit (e.g. 1 for 1kg)
  packageType: 'pouch' | 'tin' | 'pyramid_box' | 'pillow_pack' | 'vacuum_brick';
  unitsPerShipperCarton: number; // e.g. 48 packs per carton
  expectedScrapPercent: number;  // e.g. 1.0%
  primaryMaterialId: string;     // default pouch/container ID
  labelMaterialId?: string;      // default label ID
  cartonMaterialId?: string;     // default master carton ID
  shelfLifeMonths: number;       // e.g. 24
  suggestedRetailPrice?: number;
}

export interface PackagingRunMaterialUsage {
  materialId: string;
  quantityPlanned: number;
  quantityUsed: number;
  quantityScrap: number;
}

export interface PackagingRun {
  id: string;
  runNumber: string;         // e.g. "RUN-2026-0901"
  date: string;
  teaBatchId: string;
  specId: string;
  targetUnits: number;
  actualUnitsProduced: number;
  netWeightG: number;        // total grams per pack (e.g. 50 or 1000)
  packWeightValue?: number;  // value as entered by packer (e.g. 50 or 1.5)
  packWeightUnit?: 'g' | 'kg'; // unit selected by packer
  packerName?: string;       // name of the person/operator packing
  teaRequiredKg: number;     // e.g. 500 units * 0.050kg = 25.0 kg
  teaActualUsedKg: number;   // e.g. 25.3 kg (including loss)
  teaLossKg: number;         // e.g. 0.3 kg
  lossPercentage: number;    // e.g. 1.2%
  materialsConsumed: PackagingRunMaterialUsage[];
  operatorName: string;      // line operator / packer
  machineLine: string;       // e.g. "Form-Fill-Seal Line #2"
  qcSampleWeightG: number;   // e.g. 50.1g
  qcPassed: boolean;
  generatedLotNumber: string;// e.g. "LOT-202609-050-01"
  expiryDate: string;
  notes?: string;
}

export interface FinishedGoodsLot {
  id: string;
  lotNumber: string;         // e.g. "LOT-202609-050-01"
  runId: string;
  specId: string;
  teaBatchId: string;
  productName: string;
  netWeightG: number;        // standardized grams (e.g. 50 or 1000)
  packWeightValue?: number;  // value as entered by packer (e.g. 50, 100, 1, 2.5)
  packWeightUnit?: 'g' | 'kg'; // 'g' or 'kg'
  packerName?: string;       // person who packed this lot
  initialUnits: number;
  currentUnits: number;
  totalTeaKgEquivalent: number; // currentUnits * netWeightG / 1000
  productionDate: string;
  bestBeforeDate: string;
  warehouseLocation: string; // e.g. "FG Warehouse Bay 4, Rack 2"
  status: 'available' | 'reserved' | 'depleted';
  qcPassed: boolean;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  customerType: 'distributor' | 'retail_chain' | 'exporter' | 'tea_boutique';
}

export interface DispatchItem {
  lotId: string;
  unitsDispatched: number;
  netWeightG: number;
  totalTeaWeightKg: number;
}

export interface DispatchOrder {
  id: string;
  dispatchNumber: string;   // e.g. "DSP-2026-042"
  orderDate: string;
  dispatchDate: string;
  customerId: string;
  items: DispatchItem[];
  totalUnits: number;
  totalNetWeightKg: number;
  carrier: string;
  vehicleNumber: string;
  status: 'pending' | 'dispatched' | 'delivered';
  notes?: string;
}

export interface ResearchMaterialGuideItem {
  id: string;
  title: string;
  category: MaterialCategory;
  recommendedGrammages: number[]; // e.g. [25, 50, 100, 250]
  layerStructure: string;
  barrierProperties: {
    oxygen: string;
    moisture: string;
    light: string;
    aromaSealing: string;
  };
  pros: string[];
  cons: string[];
  bestUseCases: string;
  shelfLifeRating: string;
  sustainabilityRating: string;
  typicalCostRange: string;
  sealingTemp: string;
}
