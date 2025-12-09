import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, AlertCircle } from "lucide-react";
import type { InvoiceData, InvoiceItem } from "../types/invoice";
import type { InventoryItem } from "../types/inventory"; 
import { PaymentMethod, PaymentStatus } from "../types/invoice";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onFieldChange: (field: keyof InvoiceData, value: string | number | boolean | Date) => void;
  onCustomerChange: (field: keyof InvoiceData['customer'], value: string | number | undefined) => void;
  onAddItem: (item: Omit<InvoiceItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  inventoryItems: InventoryItem[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  onFieldChange,
  onCustomerChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  inventoryItems,
}) => {
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id' | 'total'>>({
    item: "",
    quantity: 1,
    unitPrice: 0,
    itemName: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [itemTotal, setItemTotal] = useState(0);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  useEffect(() => {
    setItemTotal(newItem.quantity * newItem.unitPrice);
    
    // Check stock availability
    if (newItem.item) {
      const selectedItem = inventoryItems.find(item => item.id === newItem.item);
      if (selectedItem && newItem.quantity > selectedItem.quantity) {
        setStockWarning(`Only ${selectedItem.quantity} items in stock`);
      } else {
        setStockWarning(null);
      }
    }
  }, [newItem.quantity, newItem.unitPrice, newItem.item, inventoryItems]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setFilteredItems([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase().trim();
    const filtered = inventoryItems.filter(item => {
      // Check product_name
      if (item.product_name && item.product_name.toLowerCase().includes(searchTermLower)) return true;
      
      // Check product_code
      if (item.product_code && item.product_code.toLowerCase().includes(searchTermLower)) return true;
      
      // Check vehicle brand/model
      if (item.vehicle?.brand && item.vehicle.brand.toLowerCase().includes(searchTermLower)) return true;
      if (item.vehicle?.model && item.vehicle.model.toLowerCase().includes(searchTermLower)) return true;
      
      return false;
    });
    
    setFilteredItems(filtered);
  }, [searchTerm, inventoryItems]);

  const handleItemSelect = (inventoryItem: InventoryItem) => {
    setNewItem({
      item: inventoryItem.id,
      itemName: inventoryItem.product_name,
      quantity: 1,
      unitPrice: inventoryItem.sell_price,
    });
    setSearchTerm(`${inventoryItem.product_name} (${inventoryItem.product_code})`);
    setShowSuggestions(false);
    setStockWarning(null);
  };

  const handleAddItem = () => {
    if (!newItem.item || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      alert("Please select an item and fill all required fields");
      return;
    }

    // Check stock availability
    const selectedItem = inventoryItems.find(item => item.id === newItem.item);
    if (selectedItem && newItem.quantity > selectedItem.quantity) {
      alert(`Cannot add ${newItem.quantity} items. Only ${selectedItem.quantity} in stock.`);
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
    setStockWarning(null);
  };

  const handleUpdateItemQuantity = (id: string, newQuantity: number) => {
    const item = invoiceData.items.find(item => item.id === id);
    if (item) {
      const inventoryItem = inventoryItems.find(inv => inv.id === item.item);
      if (inventoryItem && newQuantity > inventoryItem.quantity) {
        alert(`Cannot update to ${newQuantity} items. Only ${inventoryItem.quantity} in stock.`);
        return;
      }
      onUpdateItem(id, { quantity: newQuantity });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                required
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
                required
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                  onCustomerChange('year_of_manufacture', value);
                }}
                placeholder="Year"
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Issue Date*
              </label>
              <input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => onFieldChange('issueDate', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                required
              />
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payment Method*
              </label>
              <select
                value={invoiceData.paymentMethod}
                onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
                required
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

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discount ($)
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
      </div>

      {/* Add Item Form */}
      <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Add Item</h3>
        
        <div className="space-y-4 search-container">
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
                  const value = e.target.value;
                  setSearchTerm(value);
                  if (value.trim().length >= 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchTerm.trim().length >= 2 && filteredItems.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Type to search items..."
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchTerm.trim().length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-[#0f172a] border border-[#334155] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="px-3 py-2 text-gray-400 text-sm italic">
                      No items found matching "{searchTerm}"
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="px-3 py-2 hover:bg-[#1e293b] cursor-pointer border-b border-[#334155] last:border-b-0 transition-colors duration-150"
                        onClick={() => handleItemSelect(item)}
                      >
                        <div className="font-medium text-white">{item.product_name || 'Unnamed Item'}</div>
                        <div className="text-sm text-gray-400 flex justify-between mt-1">
                          <span>Code: {item.product_code || 'N/A'}</span>
                          <span className="text-green-400">${(item.sell_price || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            Stock: {item.quantity || 0} units
                          </span>
                          <span className="text-xs text-blue-400">
                            Status: {item.status || 'N/A'}
                          </span>
                        </div>
                        {item.vehicle && (
                          <div className="text-xs text-gray-500 mt-1">
                            Vehicle: {item.vehicle.brand} {item.vehicle.model} ({item.vehicle.year})
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Search by product name, code, or vehicle brand/model
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
                    setStockWarning(null);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Clear Selection
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              {stockWarning && (
                <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-300 text-sm">{stockWarning}</span>
                </div>
              )}
            </div>
          )}

          {/* Quantity and Total */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            {invoiceData.items.map((item) => {
              const inventoryItem = inventoryItems.find(inv => inv.id === item.item);
              return (
                <div key={item.id} className="bg-[#0f172a] p-4 rounded-lg border border-[#334155]">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-200">{item.itemName || inventoryItem?.product_name || `Item ${item.item.substring(0, 8)}...`}</h4>
                          <div className="text-sm text-gray-400">Code: {inventoryItem?.product_code || item.item.substring(0, 12)}...</div>
                          {inventoryItem && (
                            <div className="text-xs text-gray-500 mt-1">
                              Stock: {inventoryItem.quantity || 0} units
                              {item.quantity > (inventoryItem.quantity || 0) && (
                                <span className="text-red-400 ml-2">(Insufficient stock!)</span>
                              )}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-400 hover:text-red-300 ml-4"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-gray-400">
                          <div>Quantity</div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-full bg-[#1e293b] border border-[#334155] rounded px-2 py-1 text-white mt-1"
                          />
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
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-[#334155]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-white font-medium">${invoiceData.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Discount:</span>
              <span className="text-red-400 font-medium">-${invoiceData.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-[#334155]">
              <span className="text-gray-200">Total Amount:</span>
              <span className="text-green-400">${invoiceData.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;