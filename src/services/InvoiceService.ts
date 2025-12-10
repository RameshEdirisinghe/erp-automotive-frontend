import api from "../api/axios";
import type { 
  InvoiceData, 
  PaymentStatusType,
  PaymentMethodType 
} from "../types/invoice";
import type { InventoryItem } from "../types/inventory"; 

export interface InvoiceResponse {
  _id: string;
  invoiceId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    vat_number?: string;
    vehicle_number?: string;
    vehicle_model?: string;
    year_of_manufacture?: number;
  };
  items: Array<{
    item: InventoryItem;
    quantity: number;
    unitPrice: number;
    total: number;
    _id?: string;
  }>;
  subTotal: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatusType;
  paymentMethod: PaymentMethodType;
  bankDepositDate?: string;
  issueDate: string;
  dueDate: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

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
  async create(invoiceData: Partial<InvoiceData>): Promise<InvoiceResponse> {
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
  async update(id: string, updateData: Partial<InvoiceData>): Promise<InvoiceResponse> {
    try {
      const response = await api.put<InvoiceResponse>(`/invoices/${id}`, updateData);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update invoice ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Update payment status
  async updatePaymentStatus(id: string, paymentStatus: PaymentStatusType): Promise<InvoiceResponse> {
    try {
      const response = await api.put<InvoiceResponse>(`/invoices/${id}/payment-status`, { paymentStatus });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to update payment status for invoice ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Delete invoice
  async delete(id: string): Promise<DeleteInvoiceResponse> {
    try {
      const response = await api.delete<DeleteInvoiceResponse>(`/invoices/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to delete invoice ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Get sales overview
  async getSalesOverview(): Promise<SalesOverviewResponse> {
    try {
      const response = await api.get<SalesOverviewResponse>("/invoices/analytics/sales-overview");
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to fetch sales overview";
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
  }
};

export const getAllInvoices = invoiceService.getAll;
export const getNextInvoiceId = invoiceService.getNextId;
export const getInvoiceById = invoiceService.getById;
export const getInvoiceByInvoiceId = invoiceService.getByInvoiceId;
export const createInvoice = invoiceService.create;
export const updateInvoice = invoiceService.update;
export const updateInvoicePaymentStatus = invoiceService.updatePaymentStatus;
export const deleteInvoice = invoiceService.delete;
export const getSalesOverview = invoiceService.getSalesOverview;
export const getInventoryItems = invoiceService.getInventoryItems;