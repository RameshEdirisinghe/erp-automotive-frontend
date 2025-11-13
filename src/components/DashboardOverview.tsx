import React, { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import ProductTable from "./ProductTable";
import { getDashboardStats, getProducts } from "../services/ProductService";

interface Stats {
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}

const DashboardOverview: React.FC = () => {
  const [stats, setStats] = useState<Stats[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setStats(getDashboardStats());
    setProducts(getProducts());
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-[#F4F5F7] min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>

      {/* ==== Stats Section ==== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatsCard
            key={i}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            color={stat.color}
          />
        ))}
      </div>

      {/* ==== Search & Filter ==== */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500">
          <option>All Categories</option>
        </select>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg">
          More Filters
        </button>
      </div>

      {/* ==== Table ==== */}
      <ProductTable products={filteredProducts} />
    </div>
  );
};

export default DashboardOverview;
