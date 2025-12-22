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
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
    { name: "Inventory", icon: Package, path: "/inventory" },
    { name: "Quotations", icon: ClipboardList, path: "/quotations" },
    { name: "Invoice", icon: FileText, path: "/invoice" },
    { name: "Finance", icon: DollarSign, path: "/finance" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
            onClick={() => handleNavigation(item.path)}
            className={`
              flex items-center space-x-3 px-4 py-3 rounded-xl mx-2 cursor-pointer
              transition-all duration-300
              ${
                isActive(item.path)
                  ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                  : "hover:bg-white/5 hover:shadow-lg hover:-translate-y-0.5"
              }
            `}
          >
            <item.icon 
              size={20} 
              className={isActive(item.path) ? "text-blue-400" : "text-gray-300"} 
            />

            {isOpen && (
              <span className={`text-sm font-medium ${
                isActive(item.path) ? "text-blue-400" : "text-gray-200"
              }`}>
                {item.name}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-[#1f2937] mx-3"></div>

      
      <div
        onClick={() => handleNavigation("/settings")}
        className={`
          flex items-center space-x-3 px-4 py-3 
          cursor-pointer rounded-xl mx-2 mb-4
          transition-all duration-300
          ${
            isActive("/settings")
              ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
              : "hover:bg-white/5 hover:shadow-lg hover:-translate-y-0.5"
          }
        `}
      >
        <Settings 
          size={20} 
          className={isActive("/settings") ? "text-blue-400" : "text-gray-300"} 
        />
        {isOpen && (
          <span className={`text-sm font-medium ${
            isActive("/settings") ? "text-blue-400" : "text-gray-200"
          }`}>
            Settings
          </span>
        )}
      </div>
    </div>
  );
};

export default Sidebar;