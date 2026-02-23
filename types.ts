export interface Asset {
  fiscalCode: string;
  patrimony: string;
  description: string;
}

export interface Vehicle {
  plate: string;
  model: string;
  unit: string;
  sector: string;
}

export interface SelectedAsset {
  id: string; // Unique ID for the row (for React keys)
  assetFiscalCode: string;
  quantity: number;
}

export interface TripFormData {
  structureId: string;
  workName: string; // New field
  exitDate: string;
  exitTime: string;
  destinationCity: string;
  driverName: string;
  vehiclePlate: string;
  vehicleSector: string; // New field for customizable sector
  totalWeight: number;
  volume: number;
  hasOtherMaterials?: 'Sim' | 'Não';
  returnDate: string;
  returnTime: string;
  observations: string; // New field
  customVehicleModel?: string;
  customVehicleUnit?: string;
  customVehicleSector?: string;
}

export interface HistoryItem {
  id: string;
  createdAt: number; // Timestamp
  formData: TripFormData;
  selectedAssets: SelectedAsset[];
  isDraft?: boolean; // New property to identify drafts
}