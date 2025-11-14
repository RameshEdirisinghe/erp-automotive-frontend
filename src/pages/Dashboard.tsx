import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardOverview from "../components/DashboardOverview";
import SearchFilter from "../components/SearchFilter";
import ProductTable from "../components/ProductTable";
import { User } from "lucide-react";

const Dashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">

      
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

    
      <div className="flex-1 flex flex-col">

       
        <div
          className="
            h-16 bg-[#1e293b]/80 backdrop-blur-xl 
            border-b border-[#334155] 
            flex items-center justify-end px-6 shadow-lg
          "
        >
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
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
          <DashboardOverview />

          <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl shadow-xl p-5">
            <SearchFilter />
          </div>

          <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl shadow-xl p-5">
            <ProductTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
