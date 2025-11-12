import React from "react";
import Sidebar from "../components/Sidebar";
import { User } from "lucide-react";

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="flex h-screen bg-[#F4F5F7]">
        <Sidebar />
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
      
    </>
  );
};

export default Dashboard;