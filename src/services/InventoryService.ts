import api from "../api/axios";
import type { 
  InventoryItem, 
  InventoryStats,
  NextInventoryIdRes,
  DeleteInventoryRes 
} from "../types/inventory";

export const inventoryService = {

  async getAll(): Promise<InventoryItem[]> {
    try {
      const response = await api.get<InventoryItem[]>("/inventory-items");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          window.location.href = '/login';
        }
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch inventory items");
    }
  },

  async getNextId(): Promise<string> {
    try {
      const response = await api.get<NextInventoryIdRes>("/inventory-items/next-id");
      return response.data.nextInventoryId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to fetch next inventory ID";
      throw new Error(errorMessage);
    }
  },

  async getById(id: string): Promise<InventoryItem> {
    try {
      const response = await api.get<InventoryItem>(`/inventory-items/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch inventory item ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Create new inventory item
  async create(itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'sold_count'>): Promise<InventoryItem> {
    try {
      const response = await api.post<InventoryItem>("/inventory-items", itemData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create inventory item";
      throw new Error(errorMessage);
    }
  },

  // Update inventory item
  async update(id: string, updateData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const response = await api.put<InventoryItem>(`/inventory-items/${id}`, updateData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update inventory item ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Delete inventory item
  async delete(id: string): Promise<DeleteInventoryRes> {
    try {
      const response = await api.delete<DeleteInventoryRes>(`/inventory-items/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to delete inventory item ${id}`;
      throw new Error(errorMessage);
    }
  },

  async getStats(): Promise<InventoryStats> {
    try {
      const items = await this.getAll();
      
      return {
        totalItems: items.length,
        inStock: items.filter(item => item.status === 'in_stock').length,
        outOfStock: items.filter(item => item.status === 'out_of_stock').length,
        discontinued: items.filter(item => item.status === 'discontinued').length,
      };
    } catch (error: unknown) {
      return {
        totalItems: 0,
        inStock: 0,
        outOfStock: 0,
        discontinued: 0
      };
    }
  }
};

export const getAllInventoryItems = inventoryService.getAll;
export const getNextInventoryId = inventoryService.getNextId;
export const getInventoryItemById = inventoryService.getById;
export const createInventoryItem = inventoryService.create;
export const updateInventoryItem = inventoryService.update;
export const deleteInventoryItem = inventoryService.delete;
export const getInventoryStats = inventoryService.getStats;