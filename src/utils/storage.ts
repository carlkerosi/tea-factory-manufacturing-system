import { AppStateData, INITIAL_DATA } from '../data/initialData';

const STORAGE_KEY = 'tea_packaging_mfg_kisii_v3_ksh';

export function loadStoredData(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return INITIAL_DATA;
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical collections exist
    return {
      suppliers: parsed.suppliers || INITIAL_DATA.suppliers,
      teaBatches: parsed.teaBatches || INITIAL_DATA.teaBatches,
      materials: parsed.materials || INITIAL_DATA.materials,
      packageSpecs: parsed.packageSpecs || INITIAL_DATA.packageSpecs,
      runs: parsed.runs || INITIAL_DATA.runs,
      finishedGoods: parsed.finishedGoods || INITIAL_DATA.finishedGoods,
      customers: parsed.customers || INITIAL_DATA.customers,
      dispatches: parsed.dispatches || INITIAL_DATA.dispatches,
    };
  } catch (err) {
    console.warn('Failed to read from localStorage, using initial data:', err);
    return INITIAL_DATA;
  }
}

export function saveStoredData(data: AppStateData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
    return false;
  }
}

export function resetToDefaults(): AppStateData {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
  return INITIAL_DATA;
}

export const resetStoredData = resetToDefaults;

export function exportDataAsJson(data: AppStateData): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `tea-packaging-backup-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
