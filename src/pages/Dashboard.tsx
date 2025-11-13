import React, { useState } from "react";
import {
  Menu,
  LayoutGrid,
  Package,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
  User,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F4F5F7]">
 
      <div
        className={`${
          isOpen ? "w-64" : "w-20"
        } h-screen flex flex-col text-gray-100 transition-all duration-300 bg-[#0B0B0C]`}
      >
       
        <div>
          <div
            className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-800 rounded-md"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu size={22} className="text-gray-300 hover:text-white transition" />
            {isOpen && <span className="text-sm font-semibold">Menu</span>}
          </div>

  
          <div
            className={`border-t border-gray-700 transition-all duration-300 ${
              isOpen ? "mx-4 opacity-100" : "mx-2 opacity-50"
            }`}
          ></div>
        </div>

        
        <div className="flex flex-col flex-1 mt-4 space-y-3">
          <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
            <LayoutGrid size={20} />
            {isOpen && <span className="text-sm font-semibold">Dashboard</span>}
          </div>

          
          <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
            <Package size={20} />
            {isOpen && <span className="text-sm font-semibold">Inventory</span>}
          </div>

          
          <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
            <ClipboardList size={20} />
            {isOpen && <span className="text-sm font-semibold">Quotations</span>}
          </div>

            <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
            <DollarSign size={20} />
            {isOpen && <span className="text-sm font-semibold">Finance</span>}
          </div>

            <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
            <FileText size={20} />
            {isOpen && <span className="text-sm font-semibold">Invoice</span>}
          </div>

        </div>

    
        <div
          className={`border-t border-gray-700 transition-all duration-300 ${
            isOpen ? "mx-4 opacity-100" : "mx-2 opacity-50"
          }`}
        ></div>

    
        <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-800 cursor-pointer rounded-md mb-3">
          <Settings size={20} />
          {isOpen && <span className="text-sm font-semibold">Settings</span>}
        </div>
      </div>

      
      <div className="flex-1 flex flex-col">

        <div className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shadow-sm">
              <User size={20} className="text-gray-700" />
            </div>
            <span className="text-gray-700 text-sm font-medium">Admin</span>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Overview
            </h2>
            <p className="text-gray-600 text-sm">
              Welcome to your ERP dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
