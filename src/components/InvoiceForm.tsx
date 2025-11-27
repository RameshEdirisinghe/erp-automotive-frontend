import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { InvoiceData, InvoiceItem } from "../types/invoice";
import { PaymentMethod, PaymentStatus } from "../types/invoice";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onFieldChange: (field: keyof InvoiceData, value: any) => void;
  onCustomerChange: (field: keyof InvoiceData['customer'], value: string) => void;
  onAddItem: (item: Omit<InvoiceItem, 'id' | 'total' | 'item'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<InvoiceItem>) => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  onFieldChange,
  onCustomerChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  const [newItem, setNewItem] = useState({
    itemName: "",
    description: "",
    additionalDescription: "",
    fqNo: "",
    serialNumber: "",
    quantity: 1,
    unitPrice: 0,
  });

  const handleAddItem = () => {
    if (!newItem.itemName || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      alert("Please fill all required item fields correctly");
      return;
    }

    onAddItem(newItem);
    setNewItem({
      itemName: "",
      description: "",
      additionalDescription: "",
      fqNo: "",
      serialNumber: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Create Invoice</h2>
        
        {/* Customer Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer name*
            </label>
            <input
              type="text"
              value={invoiceData.customer.name}
              onChange={(e) => onCustomerChange('name', e.target.value)}
              placeholder="Search Customer"
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Email*
              </label>
              <input
                type="email"
                value={invoiceData.customer.email}
                onChange={(e) => onCustomerChange('email', e.target.value)}
                placeholder="customer@email.com"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Phone*
              </label>
              <input
                type="tel"
                value={invoiceData.customer.phone}
                onChange={(e) => onCustomerChange('phone', e.target.value)}
                placeholder="+94 XXX XXX XXX"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Customer Address
            </label>
            <textarea
              value={invoiceData.customer.address}
              onChange={(e) => onCustomerChange('address', e.target.value)}
              placeholder="Enter customer address"
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Dates and Sales Person */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Issue Date*
              </label>
              <input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => onFieldChange('issueDate', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Due Date*
              </label>
              <input
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => onFieldChange('dueDate', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sales Person*
              </label>
              <input
                type="text"
                value={invoiceData.salesPerson}
                onChange={(e) => onFieldChange('salesPerson', e.target.value)}
                placeholder="Probable"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={invoiceData.discount}
                onChange={(e) => onFieldChange('discount', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method*
              </label>
              <select
                value={invoiceData.paymentMethod}
                onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(PaymentMethod).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Status*
              </label>
              <select
                value={invoiceData.paymentStatus}
                onChange={(e) => onFieldChange('paymentStatus', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(PaymentStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          {invoiceData.paymentMethod === PaymentMethod.BANK_DEPOSIT && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bank Deposit Date
              </label>
              <input
                type="date"
                value={invoiceData.bankDepositDate || ''}
                onChange={(e) => onFieldChange('bankDepositDate', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Document Type*
            </label>
            <div className="space-y-2">
              {["INVOICE", "Quotation", "Purchase Order"].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="documentType"
                    value={type}
                    checked={invoiceData.documentType === type}
                    onChange={(e) => onFieldChange('documentType', e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tax Mode*
            </label>
            <div className="space-y-2">
              {["Non-Tax", "Tax"].map((mode) => (
                <label key={mode} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="taxMode"
                    value={mode}
                    checked={invoiceData.taxMode === mode}
                    onChange={(e) => onFieldChange('taxMode', e.target.value)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-300">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={invoiceData.notes}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Add Item</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item name*
              </label>
              <input
                type="text"
                value={newItem.itemName}
                onChange={(e) => setNewItem(prev => ({ ...prev, itemName: e.target.value }))}
                placeholder="search item"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                FQ No*
              </label>
              <input
                type="text"
                value={newItem.fqNo}
                onChange={(e) => setNewItem(prev => ({ ...prev, fqNo: e.target.value }))}
                placeholder="Purchase order No"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description*
            </label>
            <input
              type="text"
              value={newItem.description}
              onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter your description"
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Description*
            </label>
            <input
              type="text"
              value={newItem.additionalDescription}
              onChange={(e) => setNewItem(prev => ({ ...prev, additionalDescription: e.target.value }))}
              placeholder="Serial numbers, Warranty & etc."
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Serial Number*
            </label>
            <input
              type="text"
              value={newItem.serialNumber}
              onChange={(e) => setNewItem(prev => ({ ...prev, serialNumber: e.target.value }))}
              placeholder="Enter Serial Number"
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Qty*
              </label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unit Price*
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      {/* Items List */}
      {invoiceData.items.length > 0 && (
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-gray-200 mb-4">Items List</h3>
          <div className="space-y-3">
            {invoiceData.items.map((item) => (
              <div key={item.id} className="bg-[#0f172a] p-4 rounded-lg border border-[#334155]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-200">{item.itemName}</h4>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>Qty: {item.quantity}</div>
                  <div>Unit Price: ${item.unitPrice.toFixed(2)}</div>
                  <div>Total: ${item.total.toFixed(2)}</div>
                  <div>Serial: {item.serialNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;