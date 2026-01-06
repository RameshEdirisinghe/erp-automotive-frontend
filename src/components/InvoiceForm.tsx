import React, { useState, useMemo, useCallback } from "react";
import type { InvoiceData, InvoiceItem } from "../types/invoice";
import type { InventoryItem } from "../types/inventory";
import { PaymentMethod, PaymentStatus } from "../types/invoice";
import { useCustomerSearch, type Customer } from "../hooks/useCustomerSearch";
import { useItemSearch } from "../hooks/useItemSearch";
import { CustomerSearchAndManagement } from "./invoice/CustomerSearchAndManagement";
import { CustomerViewModal } from "./invoice/CustomerViewModal";
import { CustomerFormModal } from "./invoice/CustomerFormModal";
import { ItemSearchAndAdd } from "./invoice/ItemSearchAndAdd";
import { InvoiceItemsList } from "./invoice/InvoiceItemsList";
import { InvoiceSummary } from "./invoice/InvoiceSummary";

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  onFieldChange: (field: keyof InvoiceData, value: string | number | boolean | Date) => void;
  onCustomerIdChange: (customerId: string, customerDetails?: unknown) => void;
  onAddItem: (item: Omit<InvoiceItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  inventoryItems: InventoryItem[];
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoiceData,
  onFieldChange,
  onCustomerIdChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  inventoryItems,
}) => {
  const {
    filteredCustomers,
    searchTerm: customerSearchTerm,
    setSearchTerm: setCustomerSearchTerm,
    showSuggestions: showCustomerSuggestions,
    setShowSuggestions: setShowCustomerSuggestions,
    createCustomer,
    updateCustomer,
  } = useCustomerSearch();

  const {
    searchTerm: itemSearchTerm,
    setSearchTerm: setItemSearchTerm,
    filteredItems,
    showSuggestions: showItemSuggestions,
    setShowSuggestions: setShowItemSuggestions,
  } = useItemSearch(inventoryItems);

  const [newItem, setNewItem] = useState({ 
    item: "", 
    quantity: "1", 
    unitPrice: "0", 
    itemName: "" 
  });

  const [discountInput, setDiscountInput] = useState(invoiceData.discountPercentage.toString());

  React.useEffect(() => {
    setDiscountInput(invoiceData.discountPercentage.toString());
  }, [invoiceData.discountPercentage]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerModalMode, setCustomerModalMode] = useState<'view' | 'create' | 'edit' | null>(null);

  const itemTotal = useMemo(() => {
    const qty = parseInt(newItem.quantity) || 0;
    const price = parseFloat(newItem.unitPrice) || 0;
    return qty * price;
  }, [newItem.quantity, newItem.unitPrice]);

  const stockWarning = useMemo(() => {
    if (!newItem.item) return null;
    const selectedItem = inventoryItems.find(item => item._id === newItem.item);
    if (!selectedItem) return null;
    
    const qty = parseInt(newItem.quantity) || 0;
    const existingQuantity = invoiceData.items
      .filter(item => item.item === newItem.item)
      .reduce((sum, it) => sum + it.quantity, 0);
    
    const remaining = selectedItem.quantity - existingQuantity;
    if (qty + existingQuantity > selectedItem.quantity) {
      return `Only ${remaining} items available (${existingQuantity} already in cart)`;
    }
    return null;
  }, [newItem.item, newItem.quantity, inventoryItems, invoiceData.items]);

  const handleItemSelect = useCallback((inventoryItem: InventoryItem) => {
    setNewItem({ 
      item: inventoryItem._id, 
      itemName: inventoryItem.product_name, 
      quantity: "1", 
      unitPrice: inventoryItem.sell_price.toString() 
    });
    setItemSearchTerm(`${inventoryItem.product_name} (${inventoryItem.product_code})`);
    setShowItemSuggestions(false);
  }, [setItemSearchTerm, setShowItemSuggestions]);

  const handleCustomerSelect = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerIdChange(customer._id, customer);
    setCustomerSearchTerm(`${customer.fullName} (${customer.phone})`);
    setShowCustomerSuggestions(false);
    setCustomerModalMode(null);
  }, [onCustomerIdChange, setCustomerSearchTerm, setShowCustomerSuggestions]);

  const handleClearCustomer = useCallback(() => {
    setSelectedCustomer(null);
    onCustomerIdChange("");
    setCustomerSearchTerm("");
    setCustomerModalMode(null);
  }, [onCustomerIdChange, setCustomerSearchTerm]);

  const handleClearItemSelection = useCallback(() => {
    setNewItem({ item: "", quantity: "1", unitPrice: "0", itemName: "" });
    setItemSearchTerm("");
  }, [setItemSearchTerm]);

  const handleAddItem = useCallback(() => {
    const qty = parseInt(newItem.quantity);
    const price = parseFloat(newItem.unitPrice);

    if (!newItem.item || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      alert("Please select an item and enter valid quantity and price");
      return;
    }

    const existingItem = invoiceData.items.find(item => item.item === newItem.item);
    const inventoryItem = inventoryItems.find(item => item._id === newItem.item);

    if (existingItem) {
      if (inventoryItem) {
        const newTotalQuantity = existingItem.quantity + qty;
        if (newTotalQuantity > inventoryItem.quantity) {
          alert(`Cannot add ${qty} items. Only ${inventoryItem.quantity - existingItem.quantity} more available.`);
          return;
        }

        const updatedQuantity = existingItem.quantity + qty;
        const updatedTotal = updatedQuantity * price;
        onUpdateItem(existingItem.id, { 
          quantity: updatedQuantity, 
          unitPrice: price,
          total: updatedTotal 
        });
      }
    } else {
      if (inventoryItem && qty > inventoryItem.quantity) {
        alert(`Cannot add ${qty} items. Only ${inventoryItem.quantity} in stock.`);
        return;
      }
      onAddItem({
        item: newItem.item,
        itemName: newItem.itemName,
        quantity: qty,
        unitPrice: price
      });
    }

    handleClearItemSelection();
  }, [newItem, invoiceData.items, inventoryItems, onAddItem, onUpdateItem, handleClearItemSelection]);

  const handleUpdateItemQuantity = useCallback((id: string, newQuantity: number) => {
    const item = invoiceData.items.find(item => item.id === id);
    if (!item) return;
    
    onUpdateItem(id, { quantity: newQuantity });
  }, [invoiceData.items, onUpdateItem]);

  type CustomerFormData = Omit<Customer, '_id'> | Partial<Customer>;
  const handleCustomerFormSubmit = useCallback(async (formData: CustomerFormData) => {
    if (customerModalMode === 'edit' && selectedCustomer) {
      const updated = await updateCustomer(selectedCustomer._id, formData as Partial<Customer>);
      setSelectedCustomer(updated);
      onCustomerIdChange(updated._id, updated);
      setCustomerSearchTerm(`${updated.fullName} (${updated.phone})`);
      alert("Customer updated successfully!");
    } else {
      const created = await createCustomer(formData as Omit<Customer, '_id'>);
      setSelectedCustomer(created);
      onCustomerIdChange(created._id, created);
      setCustomerSearchTerm(`${created.fullName} (${created.phone})`);
      alert("Customer created successfully!");
    }
    setCustomerModalMode(null);
  }, [customerModalMode, selectedCustomer, updateCustomer, createCustomer, onCustomerIdChange, setCustomerSearchTerm]);

  const getCustomerPrefillData = useCallback(() => {
    if (!customerSearchTerm) return undefined;
    if (/^\d+$/.test(customerSearchTerm) && customerSearchTerm.length >= 2) return { phone: customerSearchTerm };
    if (customerSearchTerm.includes(' ')) return { fullName: customerSearchTerm };
    if (customerSearchTerm.includes('@')) return { email: customerSearchTerm };
    return undefined;
  }, [customerSearchTerm]);

  const { subTotal, discountAmount, taxAmount, totalAmount } = useMemo(() => {
    const subTotal = invoiceData.subTotal;
    const discountAmount = invoiceData.discount;
    const taxAmount = subTotal * 0.18;
    const totalAmount = invoiceData.totalAmount;
    
    return { subTotal, discountAmount, taxAmount, totalAmount };
  }, [invoiceData.subTotal, invoiceData.discount, invoiceData.totalAmount]);

  const handleDiscountPercentageChange = (value: string) => {
    setDiscountInput(value);
    const percentage = parseFloat(value);
    if (!isNaN(percentage)) {
      onFieldChange('discountPercentage', percentage);
    }
  };

  const handleDiscountBlur = () => {
    let percentage = parseFloat(discountInput);
    if (isNaN(percentage)) percentage = 0;
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    setDiscountInput(clampedPercentage.toString());
    onFieldChange('discountPercentage', clampedPercentage);
  };

  React.useEffect(() => {
    if (invoiceData.customerDetails && !selectedCustomer) {
      setSelectedCustomer(invoiceData.customerDetails as Customer);
      setCustomerSearchTerm(`${invoiceData.customerDetails.fullName} (${invoiceData.customerDetails.phone})`);
    }
  }, [invoiceData.customerDetails, selectedCustomer, setCustomerSearchTerm]);

  return (
    <div className="space-y-6">
      {customerModalMode === 'view' && selectedCustomer && (
        <CustomerViewModal
          customer={selectedCustomer}
          isOpen={true}
          onClose={() => setCustomerModalMode(null)}
          onEdit={() => setCustomerModalMode('edit')}
        />
      )}

      {(customerModalMode === 'create' || customerModalMode === 'edit') && (
        <CustomerFormModal
          isOpen={true}
          mode={customerModalMode}
          initialData={customerModalMode === 'edit' ? selectedCustomer || undefined : undefined}
          prefillData={customerModalMode === 'create' ? getCustomerPrefillData() : undefined}
          onClose={() => setCustomerModalMode(null)}
          onSubmit={handleCustomerFormSubmit}
        />
      )}

      <div className="bg-[#1e293b] rounded-lg p-5 border border-[#334155]">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Create Invoice</h2>
        
        <CustomerSearchAndManagement
          searchTerm={customerSearchTerm}
          onSearchChange={setCustomerSearchTerm}
          showSuggestions={showCustomerSuggestions}
          onShowSuggestionsChange={setShowCustomerSuggestions}
          filteredCustomers={filteredCustomers}
          selectedCustomer={selectedCustomer}
          onCustomerSelect={handleCustomerSelect}
          onClearCustomer={handleClearCustomer}
          onOpenCreateCustomer={() => setCustomerModalMode('create')}
          onViewCustomer={() => setCustomerModalMode('view')}
          onEditCustomer={() => setCustomerModalMode('edit')}
        />

        <div className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Vehicle Number*
            </label>
            <input
              type="text"
              value={invoiceData.vehicleNumber || ''}
              onChange={(e) => onFieldChange('vehicleNumber', e.target.value)}
              placeholder="Vehicle Number"
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Discount (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discountInput}
                onChange={(e) => handleDiscountPercentageChange(e.target.value)}
                onBlur={handleDiscountBlur}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                %
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Discount Amount: <span className="text-green-400">LKR {discountAmount.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={invoiceData.notes || ''}
              onChange={(e) => onFieldChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <ItemSearchAndAdd
        searchTerm={itemSearchTerm}
        onSearchChange={setItemSearchTerm}
        showSuggestions={showItemSuggestions}
        onShowSuggestionsChange={setShowItemSuggestions}
        filteredItems={filteredItems}
        newItem={newItem}
        onItemSelect={handleItemSelect}
        onQuantityChange={(quantity) => setNewItem(prev => ({ ...prev, quantity }))}
        onUnitPriceChange={(unitPrice) => setNewItem(prev => ({ ...prev, unitPrice }))}
        onAddItem={handleAddItem}
        onClearSelection={handleClearItemSelection}
        itemTotal={itemTotal}
        stockWarning={stockWarning}
        invoiceItems={invoiceData.items}
      />

      {invoiceData.items.length > 0 && (
        <div className="bg-[#1e293b] rounded-lg border border-[#334155]">
          <div className="p-6">
            <InvoiceItemsList
              items={invoiceData.items}
              inventoryItems={inventoryItems}
              onUpdateQuantity={handleUpdateItemQuantity}
              onRemoveItem={onRemoveItem}
            />

            <InvoiceSummary
              subTotal={subTotal}
              discountPercentage={invoiceData.discountPercentage}
              discountAmount={discountAmount}
              taxAmount={taxAmount}
              totalAmount={totalAmount}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;