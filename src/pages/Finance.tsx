import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FinanceTable from "../components/FinanceTable";
import SearchFilterBar from "../components/SearchFilterBar";
import PaymentModal from "../components/PaymentModal";
import InvoiceViewModal from "../components/InvoiceViewModal";
import { LoadingSpinner } from "../components/common";
import { DollarSign, User } from "lucide-react";
import type { InvoiceResponse } from "../types/invoice";
import type { FinancePaymentData } from "../types/finance";
import { invoiceService } from "../services/InvoiceService";
import { financeService } from "../services/FinanceService";

const Finance: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterConfig, setFilterConfig] = useState({
    searchQuery: "",
    selectedField: "All Fields",
    startDate: "",
    endDate: ""
  });
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    method: "Bank Transfer" as 'Bank Transfer' | 'Cash' | 'Card' | 'Bank Deposit' | 'Cheque',
    bankName: "",
    accountNumber: "",
    transactionRef: "",
    amount: "",
    transactionDate: new Date().toISOString().split('T')[0]
  });

  // Load invoices from backend
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await invoiceService.getAll();
        setInvoices(data);
      } catch (error) {
        console.error('Error loading invoices:', error);
        alert('Failed to load invoices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const handleMarkAsPaid = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setPaymentDetails({
      method: "Bank Transfer",
      bankName: "",
      accountNumber: "",
      transactionRef: "",
      amount: invoice.totalAmount.toFixed(2),
      transactionDate: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoice) return;

    try {
      setIsProcessingPayment(true);

      // First get the next transaction ID
      const transactionId = await financeService.getNextId();

      // Prepare payment data matching backend schema
      const paymentData: FinancePaymentData = {
        transactionId: transactionId,
        transactionDate: new Date(paymentDetails.transactionDate).toISOString(),
        paymentMethod: {
          type: paymentDetails.method,
          bankName: paymentDetails.bankName || 'N/A',
          accountNumber: paymentDetails.accountNumber || 'N/A',
          transactionRef: paymentDetails.transactionRef || 'PAY-' + Date.now(),
        },
        invoice: {
          invoiceId: selectedInvoice.invoiceId,
        },
        amount: 'LKR ' + parseFloat(paymentDetails.amount).toFixed(2),
      };

      // Create finance transaction
      await financeService.create(paymentData);

      // Update invoice payment status
      await invoiceService.updatePaymentStatus(selectedInvoice._id, 'Completed');

      // Refresh invoices list
      const updatedInvoices = await invoiceService.getAll();
      setInvoices(updatedInvoices);

      // Show success message
      alert('Payment successfully recorded for invoice ' + selectedInvoice.invoiceId);

      // Reset form
      setShowPaymentModal(false);
      setPaymentDetails({
        method: "Bank Transfer",
        bankName: "",
        accountNumber: "",
        transactionRef: "",
        amount: "",
        transactionDate: new Date().toISOString().split('T')[0]
      });

    } catch (error: any) {
      console.error('Error processing payment:', error);
      alert('Failed to process payment: ' + (error.message || 'Please try again.'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleViewInvoice = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setShowInvoiceView(true);
  };

  const handleDownloadInvoice = async (invoice: InvoiceResponse) => {
    // Implemented in InvoiceViewModal now
    setSelectedInvoice(invoice);
    setShowInvoiceView(true);
  };

  // Filter invoices based on search and date range
  const filteredInvoices = invoices.filter(invoice => {
    const query = filterConfig.searchQuery.toLowerCase();
    const matchesSearch = 
      invoice.invoiceId.toLowerCase().includes(query) ||
      invoice.customer?.fullName?.toLowerCase().includes(query) ||
      (invoice.vehicleNumber && invoice.vehicleNumber.toLowerCase().includes(query)) ||
      invoice.totalAmount.toString().includes(query);

    if (!matchesSearch) return false;

    // Date range filtering
    if (filterConfig.startDate || filterConfig.endDate) {
      const invoiceDate = new Date(invoice.issueDate);
      
      if (filterConfig.startDate) {
        const start = new Date(filterConfig.startDate);
        start.setHours(0, 0, 0, 0);
        if (invoiceDate < start) return false;
      }
      
      if (filterConfig.endDate) {
        const end = new Date(filterConfig.endDate);
        end.setHours(23, 59, 59, 999);
        if (invoiceDate > end) return false;
      }
    }

    // Field filtering
    if (filterConfig.selectedField !== "All Fields" && filterConfig.searchQuery.trim() !== "") {
      switch (filterConfig.selectedField) {
        case "Invoice ID":
          return invoice.invoiceId.toLowerCase().includes(filterConfig.searchQuery.toLowerCase());
        case "Customer Name":
          return invoice.customer?.fullName?.toLowerCase().includes(filterConfig.searchQuery.toLowerCase());
        case "Status":
          return invoice.paymentStatus.toLowerCase().includes(filterConfig.searchQuery.toLowerCase());
        default:
          return true;
      }
    }

    return true;
  });

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-4 sm:px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-400 w-6 h-6" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-200">Finance</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition-colors">
              <User className="text-gray-200 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Search and Filters */}
          <div className="mb-8 bg-[#1e293b] border border-[#334155] rounded-lg p-4 sm:p-6">
            <SearchFilterBar
              config={filterConfig}
              onSearchChange={(query) => setFilterConfig({ ...filterConfig, searchQuery: query })}
              onFieldChange={(field) => setFilterConfig({ ...filterConfig, selectedField: field })}
              onDateRangeChange={(dates) => setFilterConfig({ ...filterConfig, ...dates })}
            />
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <LoadingSpinner size="lg" text="Loading invoices..." />
            </div>
          ) : (
            /* Invoices Table */
            <FinanceTable
              invoices={filteredInvoices}
              loading={false}
              onViewInvoice={handleViewInvoice}
              onDownloadInvoice={handleDownloadInvoice}
              onMarkAsPaid={handleMarkAsPaid}
            />
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        selectedInvoice={selectedInvoice}
        paymentDetails={paymentDetails}
        onPaymentDetailsChange={setPaymentDetails}
        onSubmit={handlePaymentSubmit}
        isProcessing={isProcessingPayment}
      />

      {/* Invoice View Modal */}
      <InvoiceViewModal
        isOpen={showInvoiceView}
        onClose={() => setShowInvoiceView(false)}
        selectedInvoice={selectedInvoice}
      />
    </div>
  );
};

export default Finance;