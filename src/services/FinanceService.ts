import api from "../api/axios";
import type { FinanceTransaction, FinancePaymentData } from "../types/finance";

export interface NextTransactionIdResponse {
  nextTransactionId: string;
}

export interface DeleteTransactionResponse {
  message: string;
}

export const financeService = {
  // Get all transactions
  async getAll(): Promise<FinanceTransaction[]> {
    try {
      const response = await api.get<FinanceTransaction[]>("/finance");
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching finance transactions:', error.message);
        throw new Error(error.message);
      }
      throw new Error("Failed to fetch finance transactions");
    }
  },

  // Get next transaction ID
  async getNextId(): Promise<string> {
    try {
      const response = await api.get<NextTransactionIdResponse>("/finance/next-id");
      return response.data.nextTransactionId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to fetch next transaction ID";
      throw new Error(errorMessage);
    }
  },

  // Get transaction by ID
  async getById(id: string): Promise<FinanceTransaction> {
    try {
      const response = await api.get<FinanceTransaction>(`/finance/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch transaction ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Create new transaction
  async create(transactionData: FinancePaymentData): Promise<FinanceTransaction> {
    try {
    
      const formattedData = {
        ...transactionData,
        transactionDate: new Date(transactionData.transactionDate).toISOString(),
      };
      
      const response = await api.post<FinanceTransaction>("/finance", formattedData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to create transaction";
      throw new Error(errorMessage);
    }
  },

  // Update transaction
  async update(id: string, updateData: Partial<FinancePaymentData>): Promise<FinanceTransaction> {
    try {
      const response = await api.put<FinanceTransaction>(`/finance/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          `Failed to update transaction ${id}`;
      throw new Error(errorMessage);
    }
  },

  // Delete transaction
  async delete(id: string): Promise<DeleteTransactionResponse> {
    try {
      const response = await api.delete<DeleteTransactionResponse>(`/finance/${id}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          `Failed to delete transaction ${id}`;
      throw new Error(errorMessage);
    }
  },
};