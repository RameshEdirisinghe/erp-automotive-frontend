import React from "react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
    <p className="text-lg font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

export default StatsCard;
