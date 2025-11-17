import React from "react";
import {
  Menu,
  LayoutGrid,
  Package,
  ClipboardList,
  DollarSign,
  FileText,
  Settings,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid },
    { name: "Inventory", icon: Package },
    { name: "Quotations", icon: ClipboardList },
    { name: "Finance", icon: DollarSign },
    { name: "Invoice", icon: FileText },
  ];

  return (
    <div
      className={`
        ${isOpen ? "w-64" : "w-20"}
        h-screen transition-all duration-300
        bg-[#111827]/60 backdrop-blur-xl 
        border-r border-[#1f2937]
        text-gray-300 shadow-lg
        flex flex-col
      `}
    >
      
      <div
        className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-white/5 rounded-xl m-2 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={22} className="text-gray-300" />
        {isOpen && (
          <span className="text-sm font-semibold text-gray-200 tracking-wide">
            Menu
          </span>
        )}
      </div>

      <div className="border-t border-[#1f2937] mx-3"></div>

  
      <div className="flex flex-col flex-1 mt-4 space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="
              flex items-center space-x-3 px-4 py-3 rounded-xl mx-2 cursor-pointer
              hover:bg-white/5 hover:shadow-lg hover:-translate-y-0.5
              transition-all duration-300
            "
          >
            <item.icon size={20} className="text-gray-300" />

            {isOpen && (
              <span className="text-sm font-medium text-gray-200">
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[#1f2937] mx-3"></div>

      
      <div
        className="
          flex items-center space-x-3 px-4 py-3 
          hover:bg-white/5 cursor-pointer rounded-xl mx-2 mb-4
          transition-all duration-300
        "
      >
        <Settings size={20} className="text-gray-300" />
        {isOpen && (
          <span className="text-sm font-medium text-gray-200">
            Settings
          </span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
