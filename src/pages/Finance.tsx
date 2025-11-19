import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { User, DollarSign } from "lucide-react";

const Finance: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <DollarSign className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">Financial Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition">
              <User className="text-gray-200 w-5 h-5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Finance;