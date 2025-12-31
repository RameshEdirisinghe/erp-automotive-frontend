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
      console.log('[DEBUG] InvoiceService.create() called with data:', invoiceData);
      
      // Validate required fields before sending
      if (!invoiceData.customer) {
        console.error('[DEBUG] Validation failed: Customer ID is required');
        throw new Error('Customer ID is required');
      }
      
      if (!invoiceData.items || invoiceData.items.length === 0) {
        console.error('[DEBUG] Validation failed: At least one item is required');
        throw new Error('At least one item is required');
      }
      
      // Ensure all item fields are present
      invoiceData.items.forEach((item, index) => {
        if (!item.item) {
          console.error(`[DEBUG] Validation failed: Item ${index + 1} is missing item ID`);
          throw new Error(`Item ${index + 1} is missing item ID`);
        }
        if (!item.quantity || item.quantity <= 0) {
          console.error(`[DEBUG] Validation failed: Item ${index + 1} quantity must be greater than 0`);
          throw new Error(`Item ${index + 1} quantity must be greater than 0`);
        }
        if (!item.unitPrice || item.unitPrice < 0) {
          console.error(`[DEBUG] Validation failed: Item ${index + 1} unit price must be valid`);
          throw new Error(`Item ${index + 1} unit price must be valid`);
        }
      });

      console.log('[DEBUG] Sending POST request to /invoices');
      const response = await api.post<InvoiceResponse>("/invoices", invoiceData);
      
      console.log('[DEBUG] Invoice created successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('[DEBUG] Error creating invoice:', error);
      
      if (error instanceof Error) {
        console.error('[DEBUG] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // axios error response
        if (error.message.includes('status code 400')) {
          console.error('[DEBUG] 400 Bad Request - Likely backend validation error');
          console.error('[DEBUG] Check the Network tab in browser devtools for detailed error');
        }
        
        const axiosError = error as any;
        if (axiosError.response) {
          console.error('[DEBUG] Server response:', {
            status: axiosError.response.status,
            data: axiosError.response.data,
            headers: axiosError.response.headers
          });
          
          // Extract backend error message
          if (axiosError.response.data && axiosError.response.data.message) {
            throw new Error(`Backend error: ${axiosError.response.data.message}`);
          } else if (axiosError.response.data) {
            throw new Error(`Backend error: ${JSON.stringify(axiosError.response.data)}`);
          }
        } else if (axiosError.request) {
          console.error('[DEBUG] No response received:', axiosError.request);
          throw new Error('No response from server. Please check your connection.');
        }
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to create invoice";
      throw new Error(errorMessage);
    }
  },

  // Update invoice
  async update(id: string, updateData: Partial<BackendInvoiceData>): Promise<InvoiceResponse> {
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
  },

  // Search or create customer
  async searchCustomer(phone: string) {
    try {
      const response = await api.get(`/customers/phone/${phone}`);
      return response.data;
    } catch (error) {
      return null;
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
export const getAllCustomers = invoiceService.getAllCustomers;