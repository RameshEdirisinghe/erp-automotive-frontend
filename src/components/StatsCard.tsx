import React from "react";

interface Props {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}

const StatsCard: React.FC<Props> = ({ title, value, subtitle, color }) => {
  return (
    <div
      className={`p-5 rounded-xl text-white shadow-md transition-transform transform hover:scale-105 ${color}`}
    >
      <h3 className="text-sm font-medium opacity-90">{title}</h3>
      <p className="text-3xl font-bold mt-1">{value}</p>
      <span className="text-xs opacity-80">{subtitle}</span>
    </div>
  );
};

export default StatsCard;
