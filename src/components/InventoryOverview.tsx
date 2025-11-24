import React from "react";
import { Package, XCircle, Ban } from "lucide-react";

interface InventoryOverviewProps {
  stats?: {
    totalItems: number;
    inStock: number;
    outOfStock: number;
    discontinued: number;
  };
}

const InventoryOverview: React.FC<InventoryOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Items",
      value: stats ? stats.totalItems.toString() : "0",
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      borderColor: "border-blue-500/30"
    },
    {
      title: "In Stock",
      value: stats ? stats.inStock.toString() : "0",
      icon: Package,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30"
    },
    {
      title: "Out of Stock",
      value: stats ? stats.outOfStock.toString() : "0",
      icon: XCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30"
    },
    {
      title: "Discontinued",
      value: stats ? stats.discontinued.toString() : "0",
      icon: Ban,
      color: "text-gray-400",
      bgColor: "bg-gray-500/20",
      borderColor: "border-gray-500/30"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`
            bg-[#1e293b]/70 border ${stat.borderColor} 
            rounded-2xl shadow-xl p-6 
            backdrop-blur-sm transition-all duration-300
            hover:scale-105 hover:shadow-2xl
          `}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">
                {stat.title}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
            <div className={`
              p-3 rounded-xl ${stat.bgColor} ${stat.borderColor} border
            `}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryOverview;