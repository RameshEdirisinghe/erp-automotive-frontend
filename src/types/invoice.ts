export const PaymentMethod = {
  CASH: 'Cash',
  CARD: 'Card',
  BANK_DEPOSIT: 'Bank Deposit',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
} as const;

export const PaymentStatus = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];
export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface InvoiceCustomer {
  name: string;
  email: string;
  phone: string;
  address?: string;
  vat_number?: string;
  vehicle_number?: string;
  vehicle_model?: string;
  year_of_manufacture?: number;
}

export interface InvoiceItem {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemName?: string;
  description?: string;
}

export interface InventoryItem {
  _id: string;
  itemId: string;
  name: string;
  description?: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceData {
  invoiceId: string;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
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

export type { InvoiceCustomer, InvoiceItem, InvoiceData, InventoryItem };