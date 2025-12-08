import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import type { InvoiceData, InvoiceItem, InventoryItem } from "../types/invoice";
import { PaymentMethod, PaymentStatus } from "../types/invoice";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onFieldChange: (field: keyof InvoiceData, value: any) => void;
  onCustomerChange: (field: keyof InvoiceData['customer'], value: string | number) => void;
  onAddItem: (item: Omit<InvoiceItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<InvoiceItem>) => void;
}

const mockInventoryItems: InventoryItem[] = [
  {
    _id: "1",
    itemId: "ITM-001",
    name: "Engine Oil",
    description: "Synthetic engine oil 5W-30",
    category: "Lubricants",
    stock: 50,
    price: 45.99,
    unit: "Liter",
    reorderLevel: 10,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "2",
    itemId: "ITM-002",
    name: "Air Filter",
    description: "High-performance air filter",
    category: "Filters",
    stock: 25,
    price: 32.50,
    unit: "Piece",
    reorderLevel: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "3",
    itemId: "ITM-003",
    name: "Brake Pads",
    description: "Ceramic brake pads set",
    category: "Brakes",
    stock: 15,
    price: 89.99,
    unit: "Set",
    reorderLevel: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "4",
    itemId: "ITM-004",
    name: "Spark Plugs",
    description: "Iridium spark plugs",
    category: "Ignition",
    stock: 40,
    price: 18.75,
    unit: "Piece",
    reorderLevel: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: "5",
    itemId: "ITM-005",
    name: "Car Battery",
    description: "12V 60Ah car battery",
    category: "Electrical",
    stock: 12,
    price: 129.99,
    unit: "Piece",
    reorderLevel: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  onFieldChange,
  onCustomerChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id' | 'total'>>({
    item: "",
    quantity: 1,
    unitPrice: 0,
    itemName: "",
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [itemTotal, setItemTotal] = useState(0);

  useEffect(() => {
    setItemTotal(newItem.quantity * newItem.unitPrice);
  }, [newItem.quantity, newItem.unitPrice]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setFilteredItems([]);
      return;
    }

    const filtered = inventoryItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, inventoryItems]);

  const handleItemSelect = (inventoryItem: InventoryItem) => {
    setNewItem({
      item: inventoryItem._id,
      itemName: inventoryItem.name,
      quantity: 1,
      unitPrice: inventoryItem.price,
    });
    setSearchTerm(`${inventoryItem.name} (${inventoryItem.itemId})`);
    setShowSuggestions(false);
  };

  const handleAddItem = () => {
    if (!newItem.item || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      alert("Please select an item and fill all required fields");
      return;
    }

    onAddItem(newItem);
    setNewItem({
      item: "",
      quantity: 1,
      unitPrice: 0,
      itemName: "",
    });
    setSearchTerm("");
    setItemTotal(0);
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
              placeholder="Customer Name"
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
              value={invoiceData.customer.address || ''}
              onChange={(e) => onCustomerChange('address', e.target.value)}
              placeholder="Enter customer address"
              rows={2}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Customer Additional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                VAT Number
              </label>
              <input
                type="text"
                value={invoiceData.customer.vat_number || ''}
                onChange={(e) => onCustomerChange('vat_number', e.target.value)}
                placeholder="VAT Number"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                value={invoiceData.customer.vehicle_number || ''}
                onChange={(e) => onCustomerChange('vehicle_number', e.target.value)}
                placeholder="Vehicle Number"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vehicle Model
              </label>
              <input
                type="text"
                value={invoiceData.customer.vehicle_model || ''}
                onChange={(e) => onCustomerChange('vehicle_model', e.target.value)}
                placeholder="Vehicle Model"
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year of Manufacture
              </label>
              <input
                type="number"
                value={invoiceData.customer.year_of_manufacture || ''}
                onChange={(e) => onCustomerChange('year_of_manufacture', e.target.value)}
                placeholder="Year"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates */}
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

          {/* Discount */}
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
        </div>
      </div>

      {/* Add Item Form */}
      <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Add Item</h3>
        
        <div className="space-y-4">
          {/* Item Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Item*
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type to search items..."
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchTerm.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-[#0f172a] border border-[#334155] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="px-3 py-2 text-gray-400 text-sm">No items found</div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item._id}
                        className="px-3 py-2 hover:bg-[#1e293b] cursor-pointer border-b border-[#334155] last:border-b-0"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="font-medium text-white">{item.name}</div>
                        <div className="text-sm text-gray-400 flex justify-between">
                          <span>ID: {item.itemId}</span>
                          <span className="text-green-400">${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Item Details */}
          {newItem.itemName && (
            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-white">Selected Item Details</h4>
                <button
                  onClick={() => {
                    setNewItem({ item: "", quantity: 1, unitPrice: 0, itemName: "" });
                    setSearchTerm("");
                    setItemTotal(0);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Clear Selection
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Item Name</div>
                  <div className="font-medium text-white">{newItem.itemName}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Unit Price</div>
                  <div className="font-medium text-green-400">${newItem.unitPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-1">Status</div>
                  <div className="font-medium text-blue-400">Ready to Add</div>
                </div>
              </div>
            </div>
          )}

          {/* Quantity and Total */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity*
              </label>
              <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 1 
                }))}
                disabled={!newItem.item}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                readOnly
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed"
              />
              <div className="text-xs text-gray-500 mt-1">Auto-filled from item selection</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Total
              </label>
              <div className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2">
                <div className="text-lg font-semibold text-green-400">
                  ${itemTotal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Add Item Button */}
          <button
            onClick={handleAddItem}
            disabled={!newItem.item}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Item to Invoice
          </button>
        </div>
      </div>

      {/* Items List */}
      {invoiceData.items.length > 0 && (
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Items List ({invoiceData.items.length} items)</h3>
            <div className="text-sm text-gray-400">
              Subtotal: <span className="text-green-400 font-semibold">${invoiceData.subTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-3">
            {invoiceData.items.map((item) => (
              <div key={item.id} className="bg-[#0f172a] p-4 rounded-lg border border-[#334155]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-200">{item.itemName || `Item ${item.item.substring(0, 8)}...`}</h4>
                        <div className="text-sm text-gray-400">ID: {item.item.substring(0, 12)}...</div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 ml-4"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-gray-400">
                        <div>Quantity</div>
                        <div className="text-white font-medium">{item.quantity}</div>
                      </div>
                      <div className="text-gray-400">
                        <div>Unit Price</div>
                        <div className="text-white font-medium">${item.unitPrice.toFixed(2)}</div>
                      </div>
                      <div className="text-gray-400">
                        <div>Total</div>
                        <div className="text-green-400 font-semibold">${item.total.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
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