import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardOverview from "../components/DashboardOverview";
import SearchFilter from "../components/SearchFilter";
// import ReusableTable from "../components/ReusableTable";
import { User } from "lucide-react";

const Dashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-end px-6 shadow-lg">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search..."
              className="bg-[#0f172a] border border-[#334155] rounded-full px-4 py-1.5 text-sm placeholder:text-gray-400 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="bg-[#0f172a] border border-[#334155] p-2 rounded-full cursor-pointer hover:bg-[#1e293b] transition">
              <User className="w-5 h-5 text-gray-200" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <DashboardOverview />

          {/* Search & Filter Card */}
          <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl shadow-xl p-5">
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Data Table
          <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl shadow-xl p-5">
            <ReusableTable
              {...({ endpoint: "/api/table", searchTerm, categoryFilter: selectedCategory } as any)}
            />
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;