import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardOverview from "../components/DashboardOverview";
import SearchFilter from "../components/SearchFilter";
import ProductTable from "../components/ProductTable";
import { User } from "lucide-react";

const Dashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); 

  return (
    <div className="flex h-screen bg-[#F4F5F7]">
      
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

     
      <div className="flex-1 flex flex-col">
       
        <div className="h-16 bg-white shadow-sm flex items-center justify-end px-6">
          
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="border rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="bg-gray-100 p-2 rounded-full cursor-pointer">
              <User className="text-gray-700 w-5 h-5" />
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <DashboardOverview />
          <SearchFilter />
          <ProductTable />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
