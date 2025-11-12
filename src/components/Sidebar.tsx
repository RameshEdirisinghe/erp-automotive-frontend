import React, { useState } from "react";
import { Menu, Grid, Package, FileText, Settings } from "lucide-react";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-[#0F141B] text-gray-100 h-screen flex flex-col transition-all duration-300`}
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
          <Grid size={20} />
          {isOpen && <span className="text-sm font-semibold">Dashboard</span>}
        </div>

        <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
          <Package size={20} />
          {isOpen && <span className="text-sm font-semibold">Inventory</span>}
        </div>

        <div className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-800 cursor-pointer rounded-md">
          <FileText size={20} />
          {isOpen && <span className="text-sm font-semibold">Quotations</span>}
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
  );
};

export default Sidebar;
