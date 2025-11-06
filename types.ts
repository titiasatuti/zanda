
export interface Item {
  id: string;
  name: string;
  sku: string;
  category: string;
  locationId: string;
  quantity: number;
  minStock: number;
  description: string;
  imageUrl?: string;
}

export interface Location {
  id: string;
  name: string;
}

export enum TransactionType {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound',
  ADJUSTMENT = 'Adjustment',
}

export interface Transaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantityChange: number;
  timestamp: string;
  notes?: string;
}

export enum Page {
  DASHBOARD = 'Dashboard',
  INVENTORY = 'Inventory',
  ITEM_DETAIL = 'ItemDetail',
  ITEM_FORM = 'ItemForm',
  SCANNER = 'Scanner',
  LOCATIONS = 'Locations',
  REPORTS = 'Reports',
}
