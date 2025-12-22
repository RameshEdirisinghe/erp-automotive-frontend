export const QuotationStatus = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
} as const;

export type QuotationStatusType = typeof QuotationStatus[keyof typeof QuotationStatus];

export interface QuotationCustomer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  vatNumber: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    zip?: string;
  };
  customerCode: string;
  vehicle_number?: string;
  vehicle_model?: string;
  year_of_manufacture?: number;
}

export interface QuotationItem {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemName?: string;
  description?: string;
}

export interface QuotationItemBackend {
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
  _id?: string;
}

export interface QuotationData {
  _id?: string;
  quotationId: string;
  customer: string;
  customerDetails?: QuotationCustomer;
  items: QuotationItem[];
  subTotal: number;
  discount: number;
  discountPercentage: number;
  totalAmount: number;
  paymentMethod: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatusType;
  notes?: string;
}

export interface BackendQuotationData {
  quotationId?: string;
  customer: string;
  items: Array<{
    item: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subTotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatusType;
  notes?: string;
}

export interface QuotationResponse {
  _id: string;
  quotationId: string;
  customer: QuotationCustomer;
  items: Array<{
    item: any;
    quantity: number;
    unitPrice: number;
    total: number;
    _id?: string;
  }>;
  subTotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  issueDate: string;
  validUntil: string;
  status: QuotationStatusType;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}