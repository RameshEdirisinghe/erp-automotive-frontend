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
      className={`${
        isOpen ? "w-64" : "w-20"
      } bg-gray-400/30 backdrop-blur-md ${
        isOpen ? "border-r border-gray-500/50" : "border-r border-gray-500/30"
      } text-gray-800 h-screen flex flex-col transition-all duration-300`}
    >
      
      <div
        className="flex items-center gap-3 px-4 py-4 cursor-pointer hover:bg-gray-500/30 rounded-md m-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={22} className="text-gray-800" />
        {isOpen && <span className="text-sm font-semibold text-gray-800">Menu</span>}
      </div>

      <div className={`border-t ${isOpen ? "border-gray-500/50" : "border-gray-500/30"} mx-3`}></div>

    
      <div className="flex flex-col flex-1 mt-4 space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.name}
            className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-500/30 cursor-pointer rounded-md mx-2"
          >
            <item.icon size={20} className="text-gray-800" />
            {isOpen && <span className="text-sm font-semibold text-gray-800">{item.name}</span>}
          </div>
        ))}
      </div>

      <div className={`border-t ${isOpen ? "border-gray-500/50" : "border-gray-500/30"} mx-3`}></div>

     
      <div className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-500/30 cursor-pointer rounded-md mx-2 mb-3">
        <Settings size={20} className="text-gray-800" />
        {isOpen && <span className="text-sm font-semibold text-gray-800">Settings</span>}
      </div>
    </div>
  );
};

export default Sidebar;