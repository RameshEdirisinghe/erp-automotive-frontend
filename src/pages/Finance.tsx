import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import FinanceTable from "../components/FinanceTable";
import { 
  User, 
  DollarSign, 
  Search, 
  Filter, 
  Calendar, 
  ChevronDown, 
  FileText, 
  Download, 
  CheckCircle
} from "lucide-react";
import InvoiceCanvas from "../components/InvoiceCanvas";
import type { InvoiceResponse } from "../types/invoice";
import type { FinancePaymentData } from "../types/finance";
import { invoiceService } from "../services/InvoiceService";
import { financeService } from "../services/FinanceService";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Finance: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceView, setShowInvoiceView] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    method: "Bank Transfer" as 'Bank Transfer' | 'Cash' | 'Card' | 'Bank Deposit' | 'Cheque',
    bankName: "",
    accountNumber: "",
    transactionRef: "",
    amount: "",
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const invoiceRef = useRef<HTMLDivElement>(null);
  const tempInvoiceRef = useRef<HTMLDivElement>(null);

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
    
    // Validate required fields
    if (!paymentDetails.transactionDate) {
      alert("Please select a transaction date");
      return;
    }
    
    if (!paymentDetails.amount || parseFloat(paymentDetails.amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    
    // For Cash method, auto-fill required fields
    if (paymentDetails.method === 'Cash') {
      setPaymentDetails(prev => ({
        ...prev,
        bankName: 'N/A',
        accountNumber: 'N/A',
        transactionRef: 'CASH-' + Date.now()
      }));
    }
    
    // For Card method, require transaction reference
    if (paymentDetails.method === 'Card' && !paymentDetails.transactionRef.trim()) {
      alert("Please enter card transaction reference");
      return;
    }
    
    // For Bank Transfer/Deposit/Cheque, require all fields
    if (paymentDetails.method === 'Bank Transfer' || 
        paymentDetails.method === 'Bank Deposit' || 
        paymentDetails.method === 'Cheque') {
      if (!paymentDetails.bankName.trim()) {
        alert("Please enter bank name");
        return;
      }
      if (!paymentDetails.accountNumber.trim()) {
        alert("Please enter account number");
        return;
      }
      if (!paymentDetails.transactionRef.trim()) {
        alert("Please enter transaction reference");
        return;
      }
    }

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
    try {
      setIsGeneratingPDF(true);
      
      // Create a temporary div for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px';
      tempDiv.style.height = '1123px';
      tempDiv.style.background = 'white';
      tempDiv.style.zIndex = '9999';
      
      document.body.appendChild(tempDiv);
      
      // Render InvoiceCanvas in the temporary div
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '794px';
      tempContainer.style.height = '1123px';
      tempContainer.style.background = 'white';
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0';
      
      tempDiv.appendChild(tempContainer);
      
      const canvasContainer = document.createElement('div');
      canvasContainer.innerHTML = '<div style="width: 794px; height: 1123px; background: white; padding: 20px;"><div style="text-align: center; font-size: 24px; margin-top: 50px;">Generating PDF for invoice: ' + invoice.invoiceId + '</div></div>';
      tempContainer.appendChild(canvasContainer);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate PDF
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });
      
      // Clean up
      document.body.removeChild(tempDiv);
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('invoice-' + invoice.invoiceId + '.pdf');
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generatePDFFromView = async () => {
    if (!selectedInvoice || !invoiceRef.current) return;
    
    try {
      setIsGeneratingPDF(true);
      
      const invoiceContainer = invoiceRef.current;
      const originalWidth = invoiceContainer.style.width;
      const originalHeight = invoiceContainer.style.height;
      const originalBackground = invoiceContainer.style.background;

      // A4 size for PDF generation
      invoiceContainer.style.width = '794px';
      invoiceContainer.style.height = '1123px';
      invoiceContainer.style.background = 'white';
      invoiceContainer.style.padding = '0';
      invoiceContainer.style.margin = '0';

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(invoiceContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      invoiceContainer.style.width = originalWidth;
      invoiceContainer.style.height = originalHeight;
      invoiceContainer.style.background = originalBackground;

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save('invoice-' + selectedInvoice.invoiceId + '.pdf');
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Filter invoices based on search and date range
  const filteredInvoices = invoices.filter(invoice => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      invoice.invoiceId.toLowerCase().includes(query) ||
      invoice.customer?.fullName?.toLowerCase().includes(query) ||
      (invoice.vehicleNumber && invoice.vehicleNumber.toLowerCase().includes(query)) ||
      invoice.totalAmount.toString().includes(query);

    if (!matchesSearch) return false;

    // Date range filtering
    if (startDate || endDate) {
      const invoiceDate = new Date(invoice.issueDate);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (invoiceDate < start) return false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (invoiceDate > end) return false;
      }
    }

    // Field filtering
    if (selectedField !== "All Fields" && searchQuery.trim() !== "") {
      switch (selectedField) {
        case "Invoice ID":
          return invoice.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());
        case "Customer Name":
          return invoice.customer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
        case "Status":
          return invoice.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase());
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
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">Finance Invoices</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition">
              <User className="text-gray-200 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Search and Filters */}
          <div className="mb-8">
            <h2 className="text-sm text-gray-400 mb-4">
              Search by name, invoice ID, sales person, or other details
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Box */}
              <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="w-full bg-[#0f172a] border border-[#334155] rounded px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Field Filter */}
              <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Field
                </h3>
                <div className="relative">
                  <select
                    className="w-full bg-[#0f172a] border border-[#334155] rounded px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    value={selectedField}
                    onChange={(e) => setSelectedField(e.target.value)}
                  >
                    <option>All Fields</option>
                    <option>Invoice ID</option>
                    <option>Customer Name</option>
                    <option>Status</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Filter by Date
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded px-3 py-1 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <FinanceTable
            invoices={filteredInvoices}
            loading={loading}
            onViewInvoice={handleViewInvoice}
            onDownloadInvoice={handleDownloadInvoice}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="p-4 md:p-6 overflow-y-auto max-h-[85vh]">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  Mark as Paid
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-200 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Invoice Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Invoice ID: <span className="text-gray-200">{selectedInvoice.invoiceId}</span></p>
                    <p className="text-sm text-gray-400">Customer: <span className="text-gray-200">{selectedInvoice.customer?.fullName || "N/A"}</span></p>
                    <p className="text-sm text-gray-400">Total Amount: <span className="text-gray-200">LKR {selectedInvoice.totalAmount.toFixed(2)}</span></p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentDetails.method}
                    onChange={(e) => {
                      const method = e.target.value as any;
                      setPaymentDetails({
                        ...paymentDetails, 
                        method: method,
                        bankName: method === 'Cash' ? 'N/A' : method === 'Card' ? 'Credit Card' : '',
                        accountNumber: method === 'Cash' ? 'N/A' : '',
                        transactionRef: method === 'Cash' ? 'CASH-' + Date.now() : ''
                      });
                    }}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Bank Deposit">Bank Deposit</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {paymentDetails.method !== 'Cash' && (
                  <>
                    {(paymentDetails.method === 'Bank Transfer' || 
                      paymentDetails.method === 'Bank Deposit' || 
                      paymentDetails.method === 'Cheque') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={paymentDetails.bankName}
                            onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                            placeholder="Enter bank name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={paymentDetails.accountNumber}
                            onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})}
                            placeholder="Enter account number"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Transaction Reference
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={paymentDetails.transactionRef}
                        onChange={(e) => setPaymentDetails({...paymentDetails, transactionRef: e.target.value})}
                        placeholder={paymentDetails.method === 'Card' ? "Enter card transaction reference" : "Enter transaction reference"}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentDetails.transactionDate}
                    onChange={(e) => setPaymentDetails({...paymentDetails, transactionDate: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentDetails.amount}
                    onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-transparent border border-[#334155] text-gray-300 hover:bg-[#334155]/30 hover:text-gray-200 font-medium py-2 rounded-lg transition-colors"
                    disabled={isProcessingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    disabled={isProcessingPayment}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceView && selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl w-full max-w-6xl h-[90vh] flex flex-col mx-2 sm:mx-4">
            <div className="p-4 sm:p-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Invoice Preview - {selectedInvoice.invoiceId}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={generatePDFFromView}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg transition-colors"
                    disabled={isGeneratingPDF}
                  >
                    {isGeneratingPDF ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowInvoiceView(false)}
                    className="text-gray-400 hover:text-gray-200 p-2 text-xl"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            
            {/* Invoice Canvas Preview */}
            <div className="flex-1 overflow-auto p-2 sm:p-4">
              <div className="bg-white rounded-lg h-full w-full overflow-auto">
                <div 
                  ref={invoiceRef}
                  className="w-[210mm] min-h-[297mm] bg-white mx-auto p-8 shadow-lg"
                  style={{ 
                    boxSizing: 'border-box',
                    transform: 'scale(0.8)',
                    transformOrigin: 'top center'
                  }}
                >
                  <InvoiceCanvas
                    invoiceData={{
                      invoiceId: selectedInvoice.invoiceId,
                      customer: selectedInvoice.customer?._id || "",
                      customerDetails: selectedInvoice.customer,
                      items: selectedInvoice.items.map(item => ({
                        id: item._id || Date.now().toString(),
                        item: item.item?._id || "",
                        itemName: item.item?.itemName || item.item?.description || "Item",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        total: item.total,
                      })),
                      subTotal: selectedInvoice.subTotal,
                      discount: selectedInvoice.discount,
                      discountPercentage: selectedInvoice.discount > 0 ? (selectedInvoice.discount / selectedInvoice.subTotal) * 100 : 0,
                      totalAmount: selectedInvoice.totalAmount,
                      paymentStatus: selectedInvoice.paymentStatus,
                      paymentMethod: selectedInvoice.paymentMethod,
                      bankDepositDate: selectedInvoice.bankDepositDate,
                      issueDate: selectedInvoice.issueDate,
                      dueDate: selectedInvoice.dueDate,
                      vehicleNumber: selectedInvoice.vehicleNumber,
                      notes: selectedInvoice.notes,
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowInvoiceView(false)}
                  className="bg-transparent border border-[#334155] text-gray-300 hover:bg-[#334155]/30 hover:text-gray-200 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;