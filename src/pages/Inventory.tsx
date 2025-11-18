import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import InventoryOverview from "../components/InventoryOverview";
import SearchFilter from "../components/SearchFilter";
import ReusableTable from "../components/ReusableTable";
import InventoryForm from "../components/InventoryForm";
import { User, Package } from "lucide-react";
import { inventoryService } from "../services/InventoryService";
import type { InventoryItem } from "../types/inventory";

const Inventory: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    outOfStock: 0,
    discontinued: 0
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadInventoryStats();
  }, [refreshTrigger]);

  const loadInventoryStats = async () => {
    try {
      const statsData = await inventoryService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (confirm(`Are you sure you want to delete "${item.product_name}"? This action cannot be undone.`)) {
      try {
        await inventoryService.delete(item.id);
        alert('Item deleted successfully!');
        setRefreshTrigger(prev => prev + 1);
      } catch (error: any) {
        alert(`Failed to delete item: ${error.message}`);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingItem) {
        await inventoryService.update(editingItem.id, formData);
        alert('Item updated successfully!');
      } else {
        
        await inventoryService.create(formData);
        alert('Item created successfully!');
      }
      setRefreshTrigger(prev => prev + 1); // Refresh data
    } catch (error: any) {
      alert(`Operation failed: ${error.message}`);
      throw error;
    }
  };

  const inventoryColumns = [
    'product_name',
    'product_code', 
    'quantity',
    'status',
    'purchase_price',
    'sell_price',
    'vehicle'
  ];

  const inventoryColumnLabels = {
    product_name: 'Product Name',
    product_code: 'Product Code',
    quantity: 'Quantity',
    status: 'Status',
    purchase_price: 'Purchase Price',
    sell_price: 'Sell Price',
    vehicle: 'Vehicle Info'
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Package className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">Inventory Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search inventory..."
              className="bg-[#0f172a] border border-[#334155] rounded-full px-4 py-1.5 text-sm placeholder:text-gray-400 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition">
              <User className="text-gray-200 w-5 h-5" />
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          <InventoryOverview stats={stats} />

          <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl shadow-xl p-5">
            <SearchFilter />
          </div>

          <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl shadow-xl p-5">
            <ReusableTable 
              endpoint="/inventory-items"
              columns={inventoryColumns}
              columnLabels={inventoryColumnLabels}
              onAdd={handleAddItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              showActions={true}
            />
          </div>

          <InventoryForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editingItem}
            isEditing={!!editingItem}
          />
        </main>
      </div>
    </div>
  );
};

export default Inventory;