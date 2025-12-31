import React from "react";
import { FileText, Building, UserCircle, Eye, Download, CheckCircle } from "lucide-react";
import type { InvoiceResponse } from "../types/invoice";

interface FinanceTableProps {
  invoices: InvoiceResponse[];
  loading: boolean;
  onViewInvoice: (invoice: InvoiceResponse) => void;
  onDownloadInvoice: (invoice: InvoiceResponse) => void;
  onMarkAsPaid: (invoice: InvoiceResponse) => void;
}

const FinanceTable: React.FC<FinanceTableProps> = ({
  invoices,
  loading,
  onViewInvoice,
  onDownloadInvoice,
  onMarkAsPaid,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed': return 'Paid';
      case 'Pending': return 'Pending';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString.split('T')[0] || "N/A";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-[#1e293b]/30 rounded-xl border border-[#334155]">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No invoices found</h3>
        <p className="text-gray-400 mt-2">Create your first invoice to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1e293b]/50 backdrop-blur-sm border border-[#334155] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155] bg-[#1e293b]/80">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">IDs</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Customer</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Items</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Total</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice, index) => (
              <tr key={invoice._id} className={`border-b border-[#334155]/50 ${index % 2 === 0 ? 'bg-[#1e293b]/30' : 'bg-[#1e293b]/10'}`}>
                {/* IDs Column */}
                <td className="py-4 px-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-gray-200">{invoice.invoiceId}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Date: {formatDate(invoice.issueDate)}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <UserCircle className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-400">Invoice ID: {invoice.invoiceId}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Due: {formatDate(invoice.dueDate)}
                    </div>
                    <div className="text-xs text-blue-400">
                      PO Not: {invoice.invoiceId}
                    </div>
                  </div>
                </td>

                {/* Customer Column */}
                <td className="py-4 px-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-gray-200">{invoice.customer?.fullName || "N/A"}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {invoice.customer?.address?.street || "No address"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {invoice.customer?.phone || "No phone"}
                    </div>
                  </div>
                </td>

                {/* Items Column */}
                <td className="py-4 px-6">
                  <div className="space-y-3">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-sm text-gray-200">
                          <span className="font-medium">
                            {item.item?.itemName || item.item?.description || `Item ${idx + 1}`}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </div>
                        <div className="text-xs text-gray-400">
                          Price: LKR {formatPrice(item.unitPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Status Column */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.paymentStatus)}`}>
                    {getStatusText(invoice.paymentStatus)}
                  </span>
                </td>

                {/* Total Column */}
                <td className="py-4 px-6">
                  <div className="text-lg font-semibold text-gray-200">
                    {formatCurrency(invoice.totalAmount)}
                  </div>
                </td>

                {/* Actions Column */}
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        List Pack: URL 216/750
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewInvoice(invoice)}
                        className="p-2 bg-transparent border border-[#334155] text-gray-300 hover:bg-[#334155]/30 hover:text-white rounded-lg transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDownloadInvoice(invoice)}
                        className="p-2 bg-transparent border border-[#334155] text-gray-300 hover:bg-[#334155]/30 hover:text-white rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    {invoice.paymentStatus === 'Pending' ? (
                      <button
                        onClick={() => onMarkAsPaid(invoice)}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Paid
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Paid</span>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceTable;