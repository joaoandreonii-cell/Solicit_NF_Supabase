export interface Asset {
  code: string;
  description: string;
}

export interface Vehicle {
  plate: string;
  model: string;
}

export interface SelectedAsset {
  id: string; // Unique ID for the row (for React keys)
  assetCode: string;
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
  totalWeight: string;
  volume: string;
  hasOtherMaterials: 'Sim' | 'Não';
  returnDate: string;
  returnTime: string;
  observations: string; // New field
}

export interface HistoryItem {
  id: string;
  createdAt: number; // Timestamp
  formData: TripFormData;
  selectedAssets: SelectedAsset[];
  isDraft?: boolean; // New property to identify drafts
}