export interface VehicleInfo {
  brand: string;
  model: string;
  chassis_no: string;
  year: number;
}

export interface InventoryItem {
  id: string;
  product_name: string;
  product_code: string;
  quantity: number;
  sold_count: number;
  discount_rate?: number;
  status: 'in_stock' | 'out_of_stock' | 'discontinued';
  vehicle: VehicleInfo;
  purchase_price: number;
  sell_price: number;
  shipment_code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryItemData {
  product_name: string;
  product_code: string;
  quantity: number;
  vehicle: VehicleInfo;
  purchase_price: number;
  sell_price: number;
  shipment_code: string;
}

export interface UpdateInventoryItemData {
  product_name?: string;
  product_code?: string;
  quantity?: number;
  status?: 'in_stock' | 'out_of_stock' | 'discontinued';
  vehicle?: VehicleInfo;
  purchase_price?: number;
  sell_price?: number;
  shipment_code?: string;
}

export interface InventoryStats {
  totalItems: number;
  inStock: number;
  outOfStock: number;
  discontinued: number;
}

export interface NextInventoryIdRes {
  nextInventoryId: string;
}

export interface DeleteInventoryRes {
  message: string;
}