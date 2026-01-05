import React, { useState, useMemo } from "react";
import { FileText, Building, Eye, Download, CheckCircle } from "lucide-react";
import { Button } from "./common";
import type { InvoiceResponse } from "../types/invoice";

interface FinanceTableProps {
  invoices: InvoiceResponse[];
  loading: boolean;
  onViewInvoice: (invoice: InvoiceResponse) => void;
  onDownloadInvoice: (invoice: InvoiceResponse) => void;
  onMarkAsPaid: (invoice: InvoiceResponse) => void;
  pageSize?: number; // optional, default 10
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusMap: Record<string, { bg: string; text: string; dot: string; label?: string }> = {
    Completed: { bg: "bg-green-500/20 border-green-500/30", text: "text-green-400", dot: "bg-green-400", label: "Paid" },
    Pending: { bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", dot: "bg-yellow-400" },
    Overdue: { bg: "bg-red-500/20 border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
    Default: { bg: "bg-gray-500/20 border-gray-500/30", text: "text-gray-400", dot: "bg-gray-400" },
  };
  const { bg, text, dot, label } = statusMap[status] || statusMap.Default;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${text} border`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {label || status}
    </span>
  );
};

const FinanceTable: React.FC<FinanceTableProps> = ({
  invoices,
  loading,
  onViewInvoice,
  onDownloadInvoice,
  onMarkAsPaid,
  pageSize = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const formatDate = (date: string) => new Intl.DateTimeFormat("en-GB").format(new Date(date));
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR", minimumFractionDigits: 2 }).format(amount);

  const sortedInvoices = useMemo(
    () => [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()),
    [invoices]
  );

  const totalPages = Math.ceil(sortedInvoices.length / pageSize);

  const paginatedInvoices = useMemo(
    () => sortedInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedInvoices, currentPage, pageSize]
  );

  if (!invoices.length)
    return (
      <div className="text-center py-16 bg-[#1e293b]/30 rounded-xl border border-[#334155] border-dashed">
        <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">No invoices found</h3>
        <p className="text-gray-400 text-sm">Try adjusting your search or date filters</p>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block bg-[#1e293b]/50 backdrop-blur-sm border border-[#334155] rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#1e293b]/80">
                {["Invoice ID", "Customer", "Due Date", "Amount", "Status", "Actions"].map((title) => (
                  <th key={title} className="text-left py-4 px-6 text-gray-300 font-semibold">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedInvoices.map((invoice, idx) => (
                <tr
                  key={invoice._id}
                  className={`border-b border-[#334155]/50 transition-colors hover:bg-[#1e293b]/50 ${
                    idx % 2 === 0 ? "bg-[#1e293b]/30" : "bg-[#1e293b]/10"
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-gray-200">{invoice.invoiceId}</span>
                      <span className="text-xs text-gray-500">{formatDate(invoice.issueDate)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-200">{invoice.customer?.fullName || "N/A"}</span>
                  </td>
                  <td className="py-4 px-6 text-gray-200">{formatDate(invoice.dueDate)}</td>
                  <td className="py-4 px-6 text-blue-400 font-bold">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={invoice.paymentStatus} />
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye className="w-3 h-3" />}
                        onClick={() => onViewInvoice(invoice)}
                        aria-label="View Invoice"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Download className="w-3 h-3" />}
                        onClick={() => onDownloadInvoice(invoice)}
                        aria-label="Download Invoice"
                      />
                      {invoice.paymentStatus === "Pending" ? (
                        <Button variant="primary" size="sm" onClick={() => onMarkAsPaid(invoice)}>
                          <span className="hidden lg:inline">Mark Paid</span>
                          <span className="lg:hidden">Pay</span>
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-green-400">
                          <CheckCircle className="w-3 h-3" /> Paid
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 text-gray-300">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedInvoices.map((invoice) => (
          <div
            key={invoice._id}
            className="bg-[#1e293b]/50 border border-[#334155] rounded-lg p-4 space-y-3 hover:bg-[#1e293b]/70 transition-colors"
          >
            {/* Card Content (same as before) */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-blue-400" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-200 truncate">{invoice.invoiceId}</p>
                  <p className="text-xs text-gray-500">{formatDate(invoice.issueDate)}</p>
                </div>
              </div>
              <StatusBadge status={invoice.paymentStatus} />
            </div>

            <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#334155]/50">
              <div>
                <p className="text-xs text-gray-400">Customer</p>
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-green-400" />
                  <p className="text-sm font-medium text-gray-200 truncate">{invoice.customer?.fullName || "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Vehicle</p>
                <p className="text-sm font-medium text-gray-200">{invoice.vehicleNumber || "—"}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-400 mb-1">Issued</p>
                <p className="font-medium text-gray-200">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Due</p>
                <p className="font-medium text-gray-200">{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Total</p>
                <p className="font-bold text-blue-400">{formatCurrency(invoice.totalAmount)}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Eye className="w-3 h-3" />}
                onClick={() => onViewInvoice(invoice)}
                className="flex-1"
              >
                View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<Download className="w-3 h-3" />}
                onClick={() => onDownloadInvoice(invoice)}
                className="flex-1"
              >
                PDF
              </Button>
              {invoice.paymentStatus === "Pending" ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircle className="w-3 h-3" />}
                  onClick={() => onMarkAsPaid(invoice)}
                  className="flex-1"
                >
                  Pay
                </Button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Paid
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Mobile Pagination */}
        <div className="flex justify-between items-center p-4 text-gray-300">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceTable;
