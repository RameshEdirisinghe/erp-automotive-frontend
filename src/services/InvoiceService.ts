import api from "../api/axios";
import type { 
  InvoiceResponse,
  BackendInvoiceData,
  PaymentStatusType,
  InvoiceCustomer 
} from "../types/invoice";
import type { InventoryItem } from "../types/inventory"; 

export interface NextInvoiceIdResponse {
  nextInvoiceId: string;
}

export interface DeleteInvoiceResponse {
  message: string;
}

export interface SalesOverviewResponse {
  period: string;
  totalSales: number;
  totalProducts: number;
  weeklyData: Array<{
    week: string;
    sales: number;
    products: number;
  }>;
}

export const invoiceService = {
  // Get all invoices
  async getAll(): Promise<InvoiceResponse[]> {
    try {
      const response = await api.get<InvoiceResponse[]>("/invoices");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching invoices:', error.message);
        if (error.message.includes('401')) {
          window.location.href = '/login';
        }
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch invoices");
    }
  },

  // Get all customers
  async getAllCustomers(): Promise<InvoiceCustomer[]> {
    try {
      const response = await api.get<InvoiceCustomer[]>("/customers");
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  // Get next invoice ID
  async getNextId(): Promise<string> {
    try {
      const response = await api.get<NextInvoiceIdResponse>("/invoices/next-id");
      return response.data.nextInvoiceId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to fetch next invoice ID";
      throw new Error(errorMessage);
    }
  },

  // Get invoice by ID
  async getById(id: string): Promise<InvoiceResponse> {
    try {
      const response = await api.get<InvoiceResponse>(`/invoices/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch invoice ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Get invoice by invoiceId
  async getByInvoiceId(invoiceId: string): Promise<InvoiceResponse> {
    try {
      const response = await api.get<InvoiceResponse>(`/invoices/invoice-id/${invoiceId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch invoice ${invoiceId}`;
      throw new Error(errorMessage);
    }
  },

  // Create new invoice
  async create(invoiceData: BackendInvoiceData): Promise<InvoiceResponse> {
    try {
      const response = await api.post<InvoiceResponse>("/invoices", invoiceData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create invoice";
      throw new Error(errorMessage);
    }
  },

  // Update invoice
  async update(invoiceId: string, updateData: Partial<BackendInvoiceData>): Promise<InvoiceResponse> {
    try {
      const response = await api.put<InvoiceResponse>(`/invoices/${invoiceId}`, updateData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update invoice ${invoiceId}`;
      throw new Error(errorMessage);
    }
  },

  // Update status
  async updatePaymentStatus(invoiceId: string, paymentStatus: PaymentStatusType): Promise<InvoiceResponse> {
    try {
      const response = await api.put<InvoiceResponse>(`/invoices/${invoiceId}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update payment status for invoice ${invoiceId}`;
      throw new Error(errorMessage);
    }
  },

  // Delete invoice
  async delete(invoiceId: string): Promise<DeleteInvoiceResponse> {
    try {
      const response = await api.delete<DeleteInvoiceResponse>(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to delete invoice ${invoiceId}`;
      throw new Error(errorMessage);
    }
  },

  // Get inventory items for dropdown
  async getInventoryItems(): Promise<InventoryItem[]> {
    try {
      const response = await api.get<InventoryItem[]>("/inventory-items");
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
  },

  // Create new customer
  async createCustomer(customerData: Omit<InvoiceCustomer, '_id' | 'customerCode'>) {
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
  async updateCustomer(customerId: string, customerData: Omit<InvoiceCustomer, '_id' | 'customerCode'>) {
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