import React from "react";

interface DashboardCardProps {
  title: string;
  value: string;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, color }) => {
  return (
    <div
      className={`p-6 rounded-2xl text-white shadow-md transition-transform transform hover:scale-105 ${color}`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default DashboardCard;
