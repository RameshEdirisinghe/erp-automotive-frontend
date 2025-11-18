import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import InventoryOverview from "../components/InventoryOverview";
import SearchFilter from "../components/SearchFilter";
import ReusableTable from "../components/ReusableTable";
import { User, Package } from "lucide-react";
import { inventoryService } from "../services/InventoryService";

const Inventory: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    inStock: 0,
    outOfStock: 0,
    discontinued: 0
  });

  useEffect(() => {
    loadInventoryStats();
  }, []);

  const loadInventoryStats = async () => {
    try {
      const statsData = await inventoryService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">

        <div
          className="
            h-16 bg-[#1e293b]/80 backdrop-blur-xl 
            border-b border-[#334155] 
            flex items-center justify-between px-6 shadow-lg
          "
        >
          <div className="flex items-center gap-3">
            <Package className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">Inventory Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search inventory..."
              className="
                bg-[#0f172a] border border-[#334155] 
                rounded-full px-4 py-1.5 text-sm 
                placeholder:text-gray-400 text-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/50
              "
            />
            <div className="
              bg-[#0f172a] border border-[#334155] 
              p-2 rounded-full cursor-pointer 
              hover:bg-[#1e293b] transition
            ">
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
            <ReusableTable endpoint="/inventory-items" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Inventory;