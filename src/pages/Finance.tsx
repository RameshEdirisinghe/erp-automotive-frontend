import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { User, DollarSign, Search, Filter, Calendar, ChevronDown, FileText, Building, UserCircle, CheckCircle, MoreVertical } from "lucide-react";

// Mock data 
const mockInvoices = [
  {
    id: "VIP-P025034-M41",
    customer: {
      name: "Vigilant Security & Investigation (PVT) LTD",
      address: "No. 33, Bufngamware Road, Raleighys",
      id: "2025844-4"
    },
    date: "2023-02-20T02:00:43.000Z",
    salesPerson: "Pintadih",
    terms: "30 Days",
    items: [
      {
        name: "SC To LC Fiber S/M Patch Code 15",
        quantity: 15,
        description: "SC To LC Fiber S/M Patch Code 15"
      },
      {
        name: "Cisco 10 S/M SFP Module",
        quantity: 15,
        description: "Cisco 10 S/M SFP Module"
      }
    ],
    total: "$3,250.00",
    status: "pending",
    actions: ["View", "Download", "Mark as Paid"]
  },
  {
    id: "VIP-P025035-M42",
    customer: {
      name: "Tech Solutions Inc",
      address: "123 Tech Street, Silicon Valley",
      id: "2025845-5"
    },
    date: "2023-02-18T10:30:00.000Z",
    salesPerson: "John Doe",
    terms: "15 Days",
    items: [
      {
        name: "Network Switch 24 Port",
        quantity: 5,
        description: "24-Port Gigabit Network Switch"
      }
    ],
    total: "$1,250.00",
    status: "paid",
    actions: ["View", "Download", "Receipt"]
  },
  {
    id: "VIP-P025036-M43",
    customer: {
      name: "Global Logistics Ltd",
      address: "456 Shipping Lane, Port City",
      id: "2025846-6"
    },
    date: "2023-02-15T14:20:00.000Z",
    salesPerson: "Jane Smith",
    terms: "30 Days",
    items: [
      {
        name: "Security Camera System",
        quantity: 10,
        description: "4K Security Camera System"
      },
      {
        name: "Network Cable",
        quantity: 50,
        description: "CAT6 Ethernet Cable"
      }
    ],
    total: "$4,500.00",
    status: "overdue",
    actions: ["View", "Download", "Mark as Paid"]
  }
];

const Finance: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedField, setSelectedField] = useState("All Fields");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    method: "bank_transfer",
    bankName: "",
    accountNumber: "",
    transactionRef: "",
    amount: "",
    transactionDate: new Date().toISOString().split('T')[0]
  });

  const handleMarkAsPaid = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentDetails({
      ...paymentDetails,
      amount: invoice.total.replace('$', '').replace(',', '')
    });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = () => {
    console.log("Payment details:", paymentDetails);
    console.log("Invoice:", selectedInvoice);
    
    alert(`Payment marked as paid for invoice ${selectedInvoice.id}`);
    setShowPaymentModal(false);
    setPaymentDetails({
      method: "bank_transfer",
      bankName: "",
      accountNumber: "",
      transactionRef: "",
      amount: "",
      transactionDate: new Date().toISOString().split('T')[0]
    });
  };

  const filteredInvoices = mockInvoices.filter(invoice => {
    const query = searchQuery.toLowerCase();
    return (
      invoice.id.toLowerCase().includes(query) ||
      invoice.customer.name.toLowerCase().includes(query) ||
      invoice.salesPerson.toLowerCase().includes(query) ||
      invoice.total.toLowerCase().includes(query)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

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
                    <option>Sales Person</option>
                    <option>Status</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Range */}
              <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Filter by Date (Newest First)
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
                  {filteredInvoices.map((invoice, index) => (
                    <tr key={invoice.id} className={`border-b border-[#334155]/50 ${index % 2 === 0 ? 'bg-[#1e293b]/30' : 'bg-[#1e293b]/10'}`}>
                      {/* IDs Column */}
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="font-medium text-gray-200">{invoice.id}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Date: {new Date(invoice.date).toLocaleDateString('en-US', {
                              month: '2-digit',
                              day: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <UserCircle className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-400">Sales Person: {invoice.salesPerson}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Terms: {invoice.terms}
                          </div>
                          <div className="text-xs text-blue-400">
                            PO Not: {invoice.id}
                          </div>
                        </div>
                      </td>

                      {/* Customer Column */}
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-green-400" />
                            <span className="font-medium text-gray-200">{invoice.customer.name}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {invoice.customer.address}
                          </div>
                          <div className="text-xs text-gray-400">
                            {invoice.customer.id}
                          </div>
                        </div>
                      </td>

                      {/* Items Column */}
                      <td className="py-4 px-6">
                        <div className="space-y-3">
                          {invoice.items.map((item, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="text-sm text-gray-200">
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="text-xs text-gray-400">
                                Desc: {item.description}
                              </div>
                              <div className="text-xs text-gray-400">
                                Qty: {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </td>

                      {/* Total Column */}
                      <td className="py-4 px-6">
                        <div className="text-lg font-semibold text-gray-200">
                          {invoice.total}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              List Pack: URL 216/750
                            </span>
                          </div>
                          {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                            <button
                              onClick={() => handleMarkAsPaid(invoice)}
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
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  Mark as Paid
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Invoice Details</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Invoice ID: <span className="text-gray-200">{selectedInvoice?.id}</span></p>
                    <p className="text-sm text-gray-400">Customer: <span className="text-gray-200">{selectedInvoice?.customer.name}</span></p>
                    <p className="text-sm text-gray-400">Total Amount: <span className="text-gray-200">{selectedInvoice?.total}</span></p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentDetails.method}
                    onChange={(e) => setPaymentDetails({...paymentDetails, method: e.target.value})}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {paymentDetails.method === 'bank_transfer' && (
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

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Transaction Reference
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={paymentDetails.transactionRef}
                        onChange={(e) => setPaymentDetails({...paymentDetails, transactionRef: e.target.value})}
                        placeholder="Enter transaction reference"
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
                    Amount
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={paymentDetails.amount}
                    onChange={(e) => setPaymentDetails({...paymentDetails, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 bg-transparent border border-[#334155] text-gray-300 hover:bg-[#334155]/30 hover:text-gray-200 font-medium py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePaymentSubmit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;