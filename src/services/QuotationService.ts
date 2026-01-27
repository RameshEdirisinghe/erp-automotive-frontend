import api from "../api/axios";
import type { 
  QuotationResponse,
  BackendQuotationData,
  QuotationStatusType,
  QuotationCustomer 
} from "../types/quotation";
import type { InventoryItem } from "../types/inventory"; 

export interface NextQuotationIdResponse {
  nextQuotationId: string;
}

export interface DeleteQuotationResponse {
  message: string;
}

export const quotationService = {
  // Get all quotations
  async getAll(): Promise<QuotationResponse[]> {
    try {
      const response = await api.get<QuotationResponse[]>("/quotations");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          window.location.href = '/login';
        }
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch quotations");
    }
  },

  // Get all customers
  async getAllCustomers(): Promise<QuotationCustomer[]> {
    try {
      const response = await api.get<QuotationCustomer[]>("/customers");
      return response.data;
    } catch (error: unknown) {
      return [];
    }
  },

  // Get next quotation ID
  async getNextId(): Promise<string> {
    try {
      const response = await api.get<NextQuotationIdResponse>("/quotations/next-id");
      return response.data.nextQuotationId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to fetch next quotation ID";
      throw new Error(errorMessage);
    }
  },

  // Get quotation by ID - Public
  async getById(id: string): Promise<QuotationResponse> {
    try {
      const response = await api.get<QuotationResponse>(`/quotations/public/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch quotation ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Get quotation by quotationId
  async getByQuotationId(quotationId: string): Promise<QuotationResponse> {
    try {
      const response = await api.get<QuotationResponse>(`/quotations/${quotationId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch quotation ${quotationId}`;
      throw new Error(errorMessage);
    }
  },

  // Create new quotation
  async create(quotationData: BackendQuotationData): Promise<QuotationResponse> {
    try {
      const response = await api.post<QuotationResponse>("/quotations", quotationData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create quotation";
      throw new Error(errorMessage);
    }
  },

  // Update quotation
  async update(quotationId: string, updateData: Partial<BackendQuotationData>): Promise<QuotationResponse> {
    try {
      const response = await api.put<QuotationResponse>(`/quotations/${quotationId}`, updateData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update quotation ${quotationId}`;
      throw new Error(errorMessage);
    }
  },

  // Update status
  async updateStatus(quotationId: string, status: QuotationStatusType): Promise<QuotationResponse> {
    try {
      const response = await api.put<QuotationResponse>(`/quotations/${quotationId}/status`, { status });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update status for quotation ${quotationId}`;
      throw new Error(errorMessage);
    }
  },

  // Delete quotation
  async delete(quotationId: string): Promise<DeleteQuotationResponse> {
    try {
      const response = await api.delete<DeleteQuotationResponse>(`/quotations/${quotationId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to delete quotation ${quotationId}`;
      throw new Error(errorMessage);
    }
  },

  // Get inventory items for dropdown
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const response = await api.get<InventoryItem[]>("/inventory-items");
      return response.data;
    } catch (error: unknown) {
      return [];
    }
  },

  // Create new customer
  async createCustomer(customerData: Omit<QuotationCustomer, '_id' | 'customerCode'>) {
    try {
      const response = await api.post("/customers", customerData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create customer";
      throw new Error(errorMessage);
    }
  },

  // Update customer
  async updateCustomer(customerId: string, customerData: Omit<QuotationCustomer, '_id' | 'customerCode'>) {
    try {
      const response = await api.put(`/customers/${customerId}`, customerData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to update customer";
      throw new Error(errorMessage);
    }
  }
};