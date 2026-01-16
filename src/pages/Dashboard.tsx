import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import DashboardOverview from "../components/DashboardOverview";
import UserProfileDropdown from "../components/UserProfileDropdown";
import { LayoutGrid } from "lucide-react";

const Dashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-[#1e293b]/80 backdrop-blur-xl border-b border-[#334155] flex items-center justify-between px-6 shadow-lg relative z-40">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-blue-400 w-6 h-6" />
            <h1 className="text-xl font-semibold text-gray-200">Patrol Masters ERP Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <UserProfileDropdown />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="absolute inset-0 flex justify-center items-center bg-[#0f172a] bg-opacity-90 z-50">
              <div className="text-center text-gray-400">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading data...
              </div>
            </div>
          ) : (
            <DashboardOverview />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
