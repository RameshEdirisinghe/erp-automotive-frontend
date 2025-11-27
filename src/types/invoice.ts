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
}

export interface InvoiceItem {
  id: string;
  item: string;
  itemName: string;
  description: string;
  additionalDescription: string;
  fqNo: string;
  serialNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
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
  documentType: string;
  taxMode: string;
  salesPerson: string;
}

export type { InvoiceCustomer, InvoiceItem, InvoiceData };