import { ResearchMaterialGuideItem } from '../types';

export const PACKAGING_RESEARCH_ITEMS: ResearchMaterialGuideItem[] = [
  {
    id: 'mat-kraft-al-pe',
    title: 'Multi-Layer Kraft Paper / Aluminum / PE Stand-Up Pouch (Doypack)',
    category: 'pouch',
    recommendedGrammages: [50, 100, 250],
    layerStructure: 'Natural Kraft Paper (50 gsm) / Aluminum Foil (7 µm) / Linear Low-Density Polyethylene LLDPE (60 µm)',
    barrierProperties: {
      oxygen: 'Near Zero (< 0.1 cm³/m²·24h) — Maximum oxidation prevention',
      moisture: 'Extreme (< 0.1 g/m²·24h) — Prevents dampness & mold in humid climates',
      light: '100% Total UV & Visible Light Block',
      aromaSealing: 'Exceptional — Volatile tea essential oils and terpenes are fully locked in',
    },
    pros: [
      'Authentic artisanal / organic natural shelf aesthetic',
      'The aluminum foil barrier provides the longest shelf-life (up to 36 months)',
      'Can be fitted with resealable press-lock zipper and tear notch',
      'Stiff structure allows stand-up presentation on retail supermarket shelves',
    ],
    cons: [
      'Multi-material laminate cannot be recycled in standard curb streams',
      'Higher material cost compared to metallized plastic film',
      'Requires heat sealer with calibrated dwell time (145°C - 165°C)',
    ],
    bestUseCases: 'Ideal for 50g & 100g premium single-origin orthodox leaf, specialty green tea, and export CTC grades.',
    shelfLifeRating: '★★★★★ (24 - 36 months)',
    sustainabilityRating: '★★★☆☆ (Laminate barrier, industrial disposal)',
    typicalCostRange: 'KSh 16.00 – KSh 28.00 per 50g pouch (printed)',
    sealingTemp: '150°C – 165°C (1.2s dwell, 3 bar pressure)',
  },
  {
    id: 'mat-bopp-vmpet-pe',
    title: 'Matte BOPP / Metallized PET / LLDPE High-Speed Foil Pouch',
    category: 'pouch',
    recommendedGrammages: [25, 50, 100, 250, 500],
    layerStructure: 'Matte Biaxially Oriented PP (18 µm) / Metallized Vacuum PET (12 µm) / Sealable PE (50 µm)',
    barrierProperties: {
      oxygen: 'Excellent (< 1.0 cm³/m²·24h)',
      moisture: 'Very High (< 0.8 g/m²·24h)',
      light: '99.5% Light Block with bright internal reflective foil',
      aromaSealing: 'Very High aroma preservation',
    },
    pros: [
      'Vibrant photographic rotogravure & flexographic printing capability',
      'Lighter and more puncture-resistant than pure aluminum leaf pouches',
      'Outstanding machine runnability on automated vertical form-fill-seal (VFFS)',
      'Lower unit cost than pure kraft foil pouches',
    ],
    cons: [
      'Non-biodegradable, requires dedicated plastic collection',
      'Slightly lower moisture barrier than 7µm solid aluminum foil over 3 years',
    ],
    bestUseCases: 'Fast-moving consumer goods (FMCG), daily 50g black tea pouches, flavored infusions, retail brand launches.',
    shelfLifeRating: '★★★★☆ (18 - 24 months)',
    sustainabilityRating: '★★☆☆☆ (Petroleum laminate)',
    typicalCostRange: 'KSh 10.00 – KSh 18.00 per 50g pouch',
    sealingTemp: '135°C – 150°C (0.8s dwell, 2.5 bar pressure)',
  },
  {
    id: 'mat-pla-pyramid-mesh',
    title: 'PLA Cornstarch Ultrasonic Pyramid Tea Bag Mesh Roll',
    category: 'pyramid_mesh',
    recommendedGrammages: [50], // e.g. 25 bags x 2g = 50g box
    layerStructure: '100% Poly-Lactic Acid (PLA) Bio-based Cornstarch Non-Woven / Woven Mesh (18 - 21 gsm)',
    barrierProperties: {
      oxygen: 'Porous water infusion membrane (requires barrier outer carton/envelope)',
      moisture: 'Allows instant hot water infusion (infusion rate > 95% in 45s)',
      light: 'Semi-translucent mesh showing whole tea leaf expansion',
      aromaSealing: 'Requires secondary barrier box with inner foil liner or outer wrap',
    },
    pros: [
      '100% Industrially compostable and microplastic-free',
      'Allows whole orthodox leaves and large CTC pellets to expand completely',
      'Fast ultrasonic cold-welding without adhesives or heat glue',
      'Premium customer perception of modern pyramid infusers',
    ],
    cons: [
      'Requires an ultrasonic pyramid packaging machine (e.g. FUSO / DXDC)',
      'Higher raw material cost than traditional paper tea bag rolls',
      'Secondary pouch or tin required to keep the tea dry before opening',
    ],
    bestUseCases: '50g retail formats containing 20 or 25 pyramid bags (2g - 2.5g each) in a printed outer box or tin.',
    shelfLifeRating: '★★★★★ (When paired with foil pouch outer)',
    sustainabilityRating: '★★★★★ (100% Bio-based PLA)',
    typicalCostRange: 'KSh 2.00 – KSh 3.50 per empty pyramid bag with tag',
    sealingTemp: 'Ultrasonic frequency 20 kHz / 35 kHz cold welding',
  },
  {
    id: 'mat-tinplate-caddy',
    title: 'Food-Grade Tinplate Metal Tea Caddy with Airtight Inner Plug',
    category: 'tin_caddy',
    recommendedGrammages: [50, 100, 125, 250],
    layerStructure: '0.23mm Electrolytic Tinplate (ETP) / Internal Food-Safe Epoxy Phenolic Lacquer / Outer Matt Varnish',
    barrierProperties: {
      oxygen: 'Hermetic / Zero Transmission when fitted with airtight inner bung',
      moisture: 'Zero Transmission (100% impervious to humidity)',
      light: '100% Absolute opaque light barrier',
      aromaSealing: 'Highest grade aroma containment; zero loss of volatile oils',
    },
    pros: [
      'Permanent shelf presence; customer re-uses container indefinitely',
      'Unsurpassed protection against mechanical crushing and puncture during export',
      '100% infinitely recyclable magnetic steel/tin material',
      'Allows premium retail pricing tier (KSh 1,500 – KSh 3,500 retail)',
    ],
    cons: [
      'Higher unit cost (KSh 90.00 – KSh 180.00 per tin)',
      'Substantial weight and bulk volume for freight shipping',
      'Requires internal heat-sealed foil pouch for initial factory tamper-seal',
    ],
    bestUseCases: 'Luxury 50g and 100g gift tins, rare single-estate flushes, ceremonial matcha, and export gift sets.',
    shelfLifeRating: '★★★★★ (36 - 60 months)',
    sustainabilityRating: '★★★★★ (Infinitely recyclable steel)',
    typicalCostRange: 'KSh 85.00 – KSh 150.00 per caddy',
    sealingTemp: 'Double-seamed mechanical lid or slip lid with tamper shrink band',
  },
  {
    id: 'mat-mono-pe-recyclable',
    title: 'Next-Gen Mono-Material Recyclable Barrier Pouch (MDO-PE / PE)',
    category: 'pouch',
    recommendedGrammages: [50, 100, 250],
    layerStructure: 'Machine-Direction Oriented PE with EVOH coating (25 µm) / Low-Temp Sealing LLDPE (65 µm)',
    barrierProperties: {
      oxygen: 'High (< 0.8 cm³/m²·24h via nano-EVOH layer)',
      moisture: 'Very High (< 1.2 g/m²·24h)',
      light: 'Printed full-coverage opaque white/amber inks',
      aromaSealing: 'High volatile aroma barrier',
    },
    pros: [
      'Fully recyclable under Category 4 (LDPE) recycling streams',
      'Meets EU Circular Economy and US modern supermarket packaging mandates',
      'Soft-touch matte tactile finish',
      'No metal content allows metal detectors to scan packaged bags for foreign bodies',
    ],
    cons: [
      'Narrower sealing temperature window (±5°C) to avoid film deformation',
      'Currently ~15% cost premium over traditional BOPP/VMPET',
    ],
    bestUseCases: 'Eco-conscious brands looking to export to European and North American markets demanding recyclable tea bags.',
    shelfLifeRating: '★★★★☆ (18 - 24 months)',
    sustainabilityRating: '★★★★☆ (Circular mono-PE recyclable)',
    typicalCostRange: 'KSh 18.00 – KSh 32.00 per 50g pouch',
    sealingTemp: '125°C – 135°C (Precision heat sealing)',
  },
  {
    id: 'mat-shipper-5ply',
    title: '5-Ply Heavy Duty Corrugated Master Shipper Carton',
    category: 'shipper_carton',
    recommendedGrammages: [50, 100],
    layerStructure: 'BC-Flute Double-Wall Corrugated Fiberboard (180 Kraft / 140 Flute / 140 Liner / 140 Flute / 180 Kraft) ECT 44',
    barrierProperties: {
      oxygen: 'Structural transport protection',
      moisture: 'Hydrophobic water-resistant exterior coating',
      light: 'Total block',
      aromaSealing: 'Ventilated or taped edge containment',
    },
    pros: [
      'Tested for container stacking up to 8 tiers without crushing',
      'Optimized dimensions to hold exactly 48 x 50g pouches or 24 x 100g pouches',
      'Recyclable biodegradable corrugated cardboard',
      'Clear printed carton labels with barcoding and lot identifiers',
    ],
    cons: [
      'Must be stored in low humidity warehouse (<65% RH) to preserve burst strength',
    ],
    bestUseCases: 'Consolidating 48 units of 50g retail packs for wholesale palletization and export container freight.',
    shelfLifeRating: 'N/A (Secondary logistics)',
    sustainabilityRating: '★★★★★ (100% Recyclable cardboard)',
    typicalCostRange: 'KSh 120.00 – KSh 180.00 per shipper carton',
    sealingTemp: 'BOPP water-activated reinforced gummed tape',
  }
];

export const PACKAGING_SIZE_PRESETS = [
  {
    netWeightG: 50,
    title: '50g Retail Stand-Up Pouch',
    description: 'The global standard retail size for premium loose leaf tea and CTC. Equivalent to 20 - 25 servings (2g - 2.5g per cup).',
    recommendedDimensions: '110mm width × 170mm height + 60mm bottom gusset',
    cartonPackCount: 48, // 48 packs * 50g = 2.4 kg net tea per master carton
    standardTeaScrapTolerance: '1.0% - 1.5%',
    recommendedBarrier: 'Kraft/AL/PE or Matte BOPP/VMPET/PE with press-to-close zipper',
  },
  {
    netWeightG: 100,
    title: '100g Classic Family / Pantry Size',
    description: 'Popular staple household pack. Provides 40 - 50 cups of tea. Excellent balance of shelf impact and cost per gram.',
    recommendedDimensions: '130mm width × 200mm height + 70mm bottom gusset',
    cartonPackCount: 24, // 24 packs * 100g = 2.4 kg net tea per master carton
    standardTeaScrapTolerance: '1.0%',
    recommendedBarrier: 'Stand-up zipper pouch or 100g round metal tinplate canister',
  },
  {
    netWeightG: 250,
    title: '250g Economy / CTC Brick Pack',
    description: 'High volume packaging for heavy tea drinkers, popular across East Africa, Middle East, UK and South Asia.',
    recommendedDimensions: '160mm width × 260mm height + 80mm bottom gusset (or side gusset brick pack)',
    cartonPackCount: 20, // 20 packs * 250g = 5.0 kg net tea per master carton
    standardTeaScrapTolerance: '0.8%',
    recommendedBarrier: 'Side-gusset foil pouch with quad-seal or vacuum brick pack',
  },
  {
    netWeightG: 500,
    title: '500g Commercial / Club Store Pack',
    description: 'Bulk retail size. Requires heavy-duty tear resistance and extra strong heat seal integrity.',
    recommendedDimensions: '190mm width × 310mm height + 90mm bottom gusset',
    cartonPackCount: 12, // 12 packs * 500g = 6.0 kg net tea
    standardTeaScrapTolerance: '0.5%',
    recommendedBarrier: 'Heavy gauge PET/AL/LLDPE (120 µm total thickness)',
  },
  {
    netWeightG: 1000,
    title: '1kg Foodservice / Cafe Wholesale Bag',
    description: 'Wholesale bag for cafes, hotels, and restaurant chains. Often fitted with one-way degassing valve or resealable zip.',
    recommendedDimensions: '220mm width × 360mm height + 100mm bottom gusset',
    cartonPackCount: 10, // 10 packs * 1kg = 10.0 kg net tea
    standardTeaScrapTolerance: '0.5%',
    recommendedBarrier: 'Side gusset foil pouch with tin-tie or zipper',
  }
];
