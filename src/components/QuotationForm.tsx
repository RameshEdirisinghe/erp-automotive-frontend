import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, AlertCircle, UserPlus, User, X, Edit, Eye } from "lucide-react";
import type { QuotationData, QuotationItem } from "../types/quotation";
import type { InventoryItem } from "../types/inventory"; 
import { PaymentMethod } from "../types/invoice";
import { QuotationStatus } from "../types/quotation";
import { quotationService } from "../services/QuotationService";

interface QuotationFormProps {
  quotationData: QuotationData;
  onFieldChange: (field: keyof QuotationData, value: string | number | boolean | Date) => void;
  onCustomerIdChange: (customerId: string, customerDetails?: Record<string, any>) => void;
  onAddItem: (item: Omit<QuotationItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<QuotationItem>) => void;
  inventoryItems: InventoryItem[];
}

interface Customer {
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
  vehicle_number?: string;
  vehicle_model?: string;
  year_of_manufacture?: number;
  customerCode?: string;
}

const QuotationForm: React.FC<QuotationFormProps> = ({
  quotationData,
  onFieldChange,
  onCustomerIdChange,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  inventoryItems,
}) => {
  const [newItem, setNewItem] = useState<Omit<QuotationItem, 'id' | 'total'>>({
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
  
  // Customer state
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [, setLoadingCustomers] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    vatNumber: "",
    address: {
      street: "",
      city: "",
      country: "",
      zip: ""
    },
    vehicle_number: "",
    vehicle_model: "",
    year_of_manufacture: undefined as number | undefined
  });

  // --- FIXED: Removed the useEffect that was causing the infinite loop ---
  // The parent component (Quotation.tsx) handles the math for subTotal/totalAmount
  // when items are added/removed/updated. We do NOT need to sync it back here.

  useEffect(() => {
    setItemTotal(newItem.quantity * newItem.unitPrice);
    
    // Check stock availability
    if (newItem.item) {
      const selectedItem = inventoryItems.find(item => item.id === newItem.item);
      if (selectedItem) {
        // Calculate total quantity including already added items
        const existingQuantity = quotationData.items
          .filter(item => item.item === newItem.item)
          .reduce((sum, item) => sum + item.quantity, 0);
        
        const totalRequested = existingQuantity + newItem.quantity;
        
        if (totalRequested > selectedItem.quantity) {
          setStockWarning(`Only ${selectedItem.quantity - existingQuantity} items available (${existingQuantity} already in cart)`);
        } else {
          setStockWarning(null);
        }
      }
    }
  }, [newItem.quantity, newItem.unitPrice, newItem.item, inventoryItems, quotationData.items]);

  // Load all customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const customers = await quotationService.getAllCustomers();
        setAllCustomers(customers);
      } catch (error) {
        console.error('Error loading customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  // Filter customers based on search term
  useEffect(() => {
    if (customerSearchTerm.trim().length < 2) {
      setFilteredCustomers([]);
      return;
    }

    const searchTermLower = customerSearchTerm.toLowerCase().trim();
    const filtered = allCustomers.filter(customer => {
      // Check phone number
      if (customer.phone && customer.phone.toLowerCase().includes(searchTermLower)) return true;
      
      // Check full name
      if (customer.fullName && customer.fullName.toLowerCase().includes(searchTermLower)) return true;
      
      // Check email
      if (customer.email && customer.email.toLowerCase().includes(searchTermLower)) return true;
      
      return false;
    });
    
    setFilteredCustomers(filtered);
  }, [customerSearchTerm, allCustomers]);

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

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerIdChange(customer._id, customer);
    setCustomerSearchTerm(`${customer.fullName} (${customer.phone})`);
    setShowCustomerSuggestions(false);
    setEditingCustomer(false);
    setViewingCustomer(false);
  };

  const handleEditCustomer = () => {
    if (!selectedCustomer) return;
    
    setEditingCustomer(true);
    setCreatingCustomer(false);
    
    // Populate form with selected customer's data
    setNewCustomer({
      fullName: selectedCustomer.fullName || "",
      email: selectedCustomer.email || "",
      phone: selectedCustomer.phone || "",
      vatNumber: selectedCustomer.vatNumber || "",
      address: {
        street: selectedCustomer.address?.street || "",
        city: selectedCustomer.address?.city || "",
        country: selectedCustomer.address?.country || "",
        zip: selectedCustomer.address?.zip || ""
      },
      vehicle_number: selectedCustomer.vehicle_number || "",
      vehicle_model: selectedCustomer.vehicle_model || "",
      year_of_manufacture: selectedCustomer.year_of_manufacture
    });
  };

  const handleViewCustomer = () => {
    if (!selectedCustomer) return;
    setViewingCustomer(true);
  };

  const handleAddItem = () => {
    if (!newItem.item || newItem.quantity <= 0 || newItem.unitPrice < 0) {
      alert("Please select an item and fill all required fields");
      return;
    }

    // Check if item already exists in quotation
    const existingItem = quotationData.items.find(item => item.item === newItem.item);
    
    if (existingItem) {
      // Update quantity of existing item
      const inventoryItem = inventoryItems.find(item => item.id === newItem.item);
      if (inventoryItem) {
        const newTotalQuantity = existingItem.quantity + newItem.quantity;
        if (newTotalQuantity > inventoryItem.quantity) {
          alert(`Cannot add ${newItem.quantity} items. Only ${inventoryItem.quantity - existingItem.quantity} more available.`);
          return;
        }
        
        const updatedQuantity = existingItem.quantity + newItem.quantity;
        const updatedTotal = updatedQuantity * existingItem.unitPrice;
        
        onUpdateItem(existingItem.id, { 
          quantity: updatedQuantity,
          total: updatedTotal
        });
      }
    } else {
      // Check stock availability for new item
      const selectedItem = inventoryItems.find(item => item.id === newItem.item);
      if (selectedItem && newItem.quantity > selectedItem.quantity) {
        alert(`Cannot add ${newItem.quantity} items. Only ${selectedItem.quantity} in stock.`);
        return;
      }

      onAddItem(newItem);
    }

    // Reset form
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
    const item = quotationData.items.find(item => item.id === id);
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
      
      if (!target.closest('.item-search-container')) {
        setShowSuggestions(false);
      }
      
      if (!target.closest('.customer-search-container')) {
        setShowCustomerSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate totals for DISPLAY ONLY
  // We use the derived values for the summary section, preventing the need to sync state
  const calculateTotals = () => {
    // We trust the props passed down from the parent
    const subTotal = quotationData.subTotal;
    const discountAmount = quotationData.discount;
    const totalAmount = quotationData.totalAmount;
    
    return { subTotal, discountAmount, totalAmount };
  };

  const { subTotal, discountAmount, totalAmount } = calculateTotals();

  const handleDiscountPercentageChange = (value: string) => {
    const percentage = parseFloat(value) || 0;
    
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    onFieldChange('discountPercentage', clampedPercentage);
  };

  const resetNewCustomerForm = () => {
    setNewCustomer({
      fullName: "",
      email: "",
      phone: "",
      vatNumber: "",
      address: {
        street: "",
        city: "",
        country: "",
        zip: ""
      },
      vehicle_number: "",
      vehicle_model: "",
      year_of_manufacture: undefined
    });
  };

  // Open create customer form
  const handleOpenCreateCustomer = () => {
    resetNewCustomerForm();
    setCreatingCustomer(true);
    setEditingCustomer(false);
    setViewingCustomer(false);
    
    if (customerSearchTerm) {
      if (/^\d+$/.test(customerSearchTerm) && customerSearchTerm.length >= 2) {
        // phone number
        setNewCustomer(prev => ({ ...prev, phone: customerSearchTerm }));
      } else if (customerSearchTerm.includes(' ')) {
        // name 
        setNewCustomer(prev => ({ ...prev, fullName: customerSearchTerm }));
      } else if (customerSearchTerm.includes('@')) {
        // email
        setNewCustomer(prev => ({ ...prev, email: customerSearchTerm }));
      }
    }
  };

  // Customer handling functions
  const handleCreateCustomer = async () => {
    // Validate required fields
    if (!newCustomer.fullName || !newCustomer.email || !newCustomer.phone || !newCustomer.vatNumber) {
      alert("Please fill in all required customer fields (Name, Email, Phone, VAT Number)");
      return;
    }

    try {
      const customerData = {
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        vatNumber: newCustomer.vatNumber,
        address: newCustomer.address,
        vehicle_number: newCustomer.vehicle_number,
        vehicle_model: newCustomer.vehicle_model,
        year_of_manufacture: newCustomer.year_of_manufacture
      };

      const createdCustomer = await quotationService.createCustomer(customerData);
      setSelectedCustomer(createdCustomer);
      onCustomerIdChange(createdCustomer._id, createdCustomer);
      setCreatingCustomer(false);
      
      // Refresh customer list
      const customers = await quotationService.getAllCustomers();
      setAllCustomers(customers);
      setCustomerSearchTerm(`${createdCustomer.fullName} (${createdCustomer.phone})`);
      
      alert("Customer created successfully!");
    } catch (error) {
      console.error('Error creating customer:', error);
      alert(error instanceof Error ? error.message : "Failed to create customer");
    }
  };

  const handleUpdateCustomer = async () => {
    if (!selectedCustomer) return;
    
    // Validate required fields
    if (!newCustomer.fullName || !newCustomer.email || !newCustomer.phone || !newCustomer.vatNumber) {
      alert("Please fill in all required customer fields (Name, Email, Phone, VAT Number)");
      return;
    }

    try {
      const customerData = {
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        vatNumber: newCustomer.vatNumber,
        address: newCustomer.address,
        vehicle_number: newCustomer.vehicle_number,
        vehicle_model: newCustomer.vehicle_model,
        year_of_manufacture: newCustomer.year_of_manufacture
      };

      const updatedCustomer = await quotationService.updateCustomer(selectedCustomer._id, customerData);
      setSelectedCustomer(updatedCustomer);
      onCustomerIdChange(updatedCustomer._id, updatedCustomer);
      setEditingCustomer(false);
      
      // Refresh customer list
      const customers = await quotationService.getAllCustomers();
      setAllCustomers(customers);
      setCustomerSearchTerm(`${updatedCustomer.fullName} (${updatedCustomer.phone})`);
      
      alert("Customer updated successfully!");
    } catch (error) {
      console.error('Error updating customer:', error);
      alert(error instanceof Error ? error.message : "Failed to update customer");
    }
  };

  // Clear customer selection
  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    onCustomerIdChange("");
    setCustomerSearchTerm("");
    resetNewCustomerForm();
    setEditingCustomer(false);
    setViewingCustomer(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Create Quotation</h2>
        
        {/* Customer Search/Create */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-semibold text-gray-200">Customer Information</h3>
            {selectedCustomer && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <User className="w-4 h-4" />
                <span>Customer: {selectedCustomer.fullName}</span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={handleViewCustomer}
                    className="p-1 hover:bg-[#0f172a] rounded transition text-green-400"
                    title="View Customer Details"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleEditCustomer}
                    className="p-1 hover:bg-[#0f172a] rounded transition text-green-400"
                    title="Edit Customer Details"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="customer-search-container">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Search Customer*
              </label>
              <button
                onClick={handleOpenCreateCustomer}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition"
              >
                <UserPlus className="w-3 h-3" />
                Add New Customer
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={customerSearchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerSearchTerm(value);
                  if (value.trim().length >= 2) {
                    setShowCustomerSuggestions(true);
                  } else {
                    setShowCustomerSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (customerSearchTerm.trim().length >= 2 && filteredCustomers.length > 0) {
                    setShowCustomerSuggestions(true);
                  }
                }}
                placeholder="Type to search customers..."
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg pl-10 pr-10 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {customerSearchTerm && (
                <button
                  onClick={handleClearCustomer}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Customer Search Suggestions Dropdown */}
              {showCustomerSuggestions && customerSearchTerm.trim().length >= 2 && (
                <div className="absolute z-20 w-full mt-1 bg-[#0f172a] border border-[#334155] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-2 text-gray-400 text-sm italic border-b border-[#334155]">
                      No customers found "{customerSearchTerm}"
                    </div>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        className="px-3 py-2 hover:bg-[#1e293b] cursor-pointer border-b border-[#334155] last:border-b-0 transition-colors duration-150"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="font-medium text-white">{customer.fullName || 'Unnamed Customer'}</div>
                        <div className="text-sm text-gray-400 flex justify-between mt-1">
                          <span>Phone: {customer.phone || 'N/A'}</span>
                          <span className="text-blue-400">{customer.email || 'No email'}</span>
                        </div>
                        {customer.address && (customer.address.street || customer.address.city) && (
                          <div className="text-xs text-gray-500 mt-1">
                            Address: {customer.address.street} {customer.address.city} {customer.address.country}
                          </div>
                        )}
                        {customer.vehicle_number && (
                          <div className="text-xs text-gray-500 mt-1">
                            Vehicle: {customer.vehicle_number} {customer.vehicle_model && `(${customer.vehicle_model})`}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Search by phone number, name, or email.
            </div>
          </div>

          {/* Customer View Modal */}
          {viewingCustomer && selectedCustomer && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#0f172a] border border-[#334155] rounded-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Customer Details</h3>
                  <button
                    onClick={() => setViewingCustomer(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Full Name</div>
                      <div className="text-white font-medium">{selectedCustomer.fullName}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="text-white font-medium">{selectedCustomer.email}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Phone</div>
                      <div className="text-white font-medium">{selectedCustomer.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">VAT Number</div>
                      <div className="text-white font-medium">{selectedCustomer.vatNumber}</div>
                    </div>
                  </div>
                  
                  {selectedCustomer.address && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Address</div>
                      <div className="text-white">
                        {selectedCustomer.address.street && <div>{selectedCustomer.address.street}</div>}
                        <div>
                          {selectedCustomer.address.city && `${selectedCustomer.address.city}, `}
                          {selectedCustomer.address.country && `${selectedCustomer.address.country} `}
                          {selectedCustomer.address.zip && selectedCustomer.address.zip}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {(selectedCustomer.vehicle_number || selectedCustomer.vehicle_model || selectedCustomer.year_of_manufacture) && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Vehicle Details</div>
                      <div className="text-white">
                        {selectedCustomer.vehicle_number && <div>Number: {selectedCustomer.vehicle_number}</div>}
                        {selectedCustomer.vehicle_model && <div>Model: {selectedCustomer.vehicle_model}</div>}
                        {selectedCustomer.year_of_manufacture && <div>Year: {selectedCustomer.year_of_manufacture}</div>}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
                    <button
                      onClick={() => setViewingCustomer(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setViewingCustomer(false);
                        handleEditCustomer();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Customer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Create/Edit Form */}
          {(creatingCustomer || editingCustomer) && (
            <div className="bg-[#0f172a] border border-[#334155] rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  {editingCustomer ? 'Edit Customer' : 'Create New Customer'}
                </h4>
                <button
                  onClick={() => {
                    setCreatingCustomer(false);
                    setEditingCustomer(false);
                    resetNewCustomerForm();
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      value={newCustomer.fullName}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Customer Full Name"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email*
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@email.com"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone*
                    </label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="10-digit phone number"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      VAT Number*
                    </label>
                    <input
                      type="text"
                      value={newCustomer.vatNumber}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, vatNumber: e.target.value }))}
                      placeholder="VAT Number"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newCustomer.address.street}
                    onChange={(e) => setNewCustomer(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="Street Address"
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={newCustomer.address.city}
                      onChange={(e) => setNewCustomer(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder="City"
                      className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newCustomer.address.country}
                      onChange={(e) => setNewCustomer(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, country: e.target.value }
                      }))}
                      placeholder="Country"
                      className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={newCustomer.address.zip}
                      onChange={(e) => setNewCustomer(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, zip: e.target.value }
                      }))}
                      placeholder="ZIP"
                      className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      value={newCustomer.vehicle_number}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, vehicle_number: e.target.value }))}
                      placeholder="Vehicle Number"
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      value={newCustomer.vehicle_model}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, vehicle_model: e.target.value }))}
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
                      value={newCustomer.year_of_manufacture || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                        setNewCustomer(prev => ({ ...prev, year_of_manufacture: value }));
                      }}
                      placeholder="Year"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  onClick={editingCustomer ? handleUpdateCustomer : handleCreateCustomer}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  {editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quotation Details */}
        <div className="space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Issue Date*
              </label>
              <input
                type="date"
                value={quotationData.issueDate}
                onChange={(e) => onFieldChange('issueDate', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valid Until*
              </label>
              <input
                type="date"
                value={quotationData.validUntil}
                onChange={(e) => onFieldChange('validUntil', e.target.value)}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Payment Method*
            </label>
            <select
              value={quotationData.paymentMethod}
              onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status*
            </label>
            <select
              value={quotationData.status}
              onChange={(e) => onFieldChange('status', e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.values(QuotationStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Discount Percentage */}
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
                value={quotationData.discountPercentage}
                onChange={(e) => handleDiscountPercentageChange(e.target.value)}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={quotationData.notes || ''}
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
        
        <div className="space-y-4 item-search-container">
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
                    filteredItems.map((item) => {
                      const existingItem = quotationData.items.find(invItem => invItem.item === item.id);
                      const existingQuantity = existingItem ? existingItem.quantity : 0;
                      const available = (item.quantity || 0) - existingQuantity;
                      
                      return (
                        <div
                          key={item.id}
                          className="px-3 py-2 hover:bg-[#1e293b] cursor-pointer border-b border-[#334155] last:border-b-0 transition-colors duration-150"
                          onClick={() => handleItemSelect(item)}
                        >
                          <div className="font-medium text-white">{item.product_name || 'Unnamed Item'}</div>
                          <div className="text-sm text-gray-400 flex justify-between mt-1">
                            <span>Code: {item.product_code || 'N/A'}</span>
                            <span className="text-green-400">LKR {(item.sell_price || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              Stock: {item.quantity || 0} units
                              {existingQuantity > 0 && (
                                <span className="text-blue-400 ml-1">({existingQuantity} in cart)</span>
                              )}
                            </span>
                            <span className={`text-xs ${available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              Available: {available}
                            </span>
                          </div>
                          {item.vehicle && (
                            <div className="text-xs text-gray-500 mt-1">
                              Vehicle: {item.vehicle.brand} {item.vehicle.model} ({item.vehicle.year})
                            </div>
                          )}
                        </div>
                      );
                    })
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
                  <div className="font-medium text-green-400">LKR {newItem.unitPrice.toFixed(2)}</div>
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
                  LKR {itemTotal.toFixed(2)}
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
            {quotationData.items.some(item => item.item === newItem.item) ? 'Update Item Quantity' : 'Add Item to Quotation'}
          </button>
        </div>
      </div>

      {/* Items List */}
      {quotationData.items.length > 0 && (
        <div className="bg-[#1e293b] rounded-lg p-6 border border-[#334155]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-200">Items List ({quotationData.items.length} items)</h3>
            <div className="text-sm text-gray-400">
              Subtotal: <span className="text-green-400 font-semibold">LKR {subTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="space-y-3">
            {quotationData.items.map((item) => {
              const inventoryItem = inventoryItems.find(inv => inv.id === item.item);
              const existingQuantity = quotationData.items
                .filter(invItem => invItem.item === item.item)
                .reduce((sum, invItem) => sum + invItem.quantity, 0);
              
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
                              {existingQuantity > (inventoryItem.quantity || 0) && (
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
                          <div className="text-white font-medium">LKR {item.unitPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-gray-400">
                          <div>Total</div>
                          <div className="text-green-400 font-semibold">LKR {item.total.toFixed(2)}</div>
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
              <span className="text-white font-medium">LKR {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Discount ({quotationData.discountPercentage}%):</span>
              <span className="text-red-400 font-medium">- LKR {discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-[#334155]">
              <span className="text-gray-200">Total Amount:</span>
              <span className="text-green-400">LKR {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationForm;
