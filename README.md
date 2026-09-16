# Tea Packaging and Bulk Inventory System

Enterprise tea manufacturing, bulk inventory, and packaging execution system for Kisii Highlands Tea Processors (Kisii, Kenya).

## Features

- **Bulk Tea Silo & Intake Tracking**: Manage green and processed CTC bulk tea batches from Gusii highland estates (BP1, PF1, PD, D1) with silo bin allocation and moisture verification.
- **Packaging Lines & Bill of Materials (BOM)**: Real-time packaging line setup for custom weights (50g, 100g, 250g, 500g, 1kg, 2kg, 5kg) with live BOM deduction for foil pouches, labels, and master cartons.
- **Packer Line Accountability**: Track individual operator output, throughput rates, and mechanical scrap loss.
- **Supabase Cloud Sync**: Cloud-managed PostgreSQL configuration and entity sync for batches, materials, packaging specs, and production runs.
- **Barcode & Lot Label Generation**: Compliant batch labeling with GS1 barcode rendering, best-before calculation, and inspection verification.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Icons**: Lucide React
- **Backend / Database**: Supabase (PostgreSQL) + Express API integration
- **Typography**: IBM Plex Sans & IBM Plex Mono

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
