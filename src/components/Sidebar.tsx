import React from "react";
import {
  Menu,
  LayoutGrid,
  Package,
  ClipboardList,
  DollarSign,
  FileText,
  UserCog,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const mainMenuItems = [
    { name: "Dashboard", icon: LayoutGrid, path: "/dashboard", roles: ['admin'] },
    { name: "Inventory", icon: Package, path: "/inventory", roles: ['admin', 'inventory_manager'] },
    { name: "Quotations", icon: ClipboardList, path: "/quotations", roles: ['admin'] },
    { name: "Invoice", icon: FileText, path: "/invoice", roles: ['admin'] },
    { name: "Finance", icon: DollarSign, path: "/finance", roles: ['admin'] },
  ];

  const bottomMenuItems = [
    { name: "User Management", icon: UserCog, path: "/user-management", roles: ['admin'] },
  ];

  const filteredMainItems = mainMenuItems.filter(item => 
    item.roles.includes(role || 'inventory_manager')
  );

  const filteredBottomItems = bottomMenuItems.filter(item => 
    item.roles.includes(role || 'inventory_manager')
  );

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
      
      {/* Header with Menu toggle */}
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

      {/* Main Navigation Items */}
      <div className="flex flex-col flex-1 mt-4 space-y-2">
        {filteredMainItems.map((item) => (
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

      {/* Bottom Section */}
      {filteredBottomItems.length > 0 && (
        <>
          <div className="border-t border-[#1f2937] mx-3 mb-2"></div>
          
          {/* User Management Item */}
          {filteredBottomItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl mx-2 mb-4 cursor-pointer
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
        </>
      )}
    </div>
  );
};

export default Sidebar;