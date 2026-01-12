import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Package } from "lucide-react";
import { fetchSalesOverview } from "../services/DashboardService";

interface SalesOverviewData {
  period: string;
  totalSales: number;
  totalProducts: number;
  weeklyData: Array<{
    week: string;
    sales: number;
    products: number;
  }>;
}

const DashboardOverview: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        const data = await fetchSalesOverview();
        setSalesData(data);
      } catch (err) {
        setError("Failed to load sales data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSalesData();
  }, []);

  const chartSalesData =
    salesData?.weeklyData.map((week) => ({ name: week.week, sales: week.sales })) || [
      { name: "Week 1", sales: 0 },
      { name: "Week 2", sales: 0 },
      { name: "Week 3", sales: 0 },
      { name: "Week 4", sales: 0 },
    ];

  const chartProductData =
    salesData?.weeklyData.map((week) => ({ name: week.week, products: week.products })) || [
      { name: "Week 1", products: 0 },
      { name: "Week 2", products: 0 },
      { name: "Week 3", products: 0 },
      { name: "Week 4", products: 0 },
    ];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(amount);

  const salesCard = {
    title: "Total Sales",
    value: salesData ? formatCurrency(salesData.totalSales) : "LKR 0",
    desc: "1 month indicator",
    color: "bg-blue-600",
    glow: "shadow-[0_0_25px_rgba(37,99,235,0.6)]",
    icon: <span className="text-2xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]">LKR</span>,
  };

  const productCard = {
    title: "Products",
    value: salesData ? salesData.totalProducts.toString() : "0",
    desc: "1 month indicator",
    color: "bg-green-600",
    glow: "shadow-[0_0_25px_rgba(22,163,74,0.6)]",
    icon: <Package className="w-10 h-10 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]" />,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="text-center text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Loading data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full min-h-[60vh]">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.04 }}
          className={`p-6 rounded-xl text-white relative overflow-hidden ${salesCard.color} ${salesCard.glow}`}
        >
          <div className="absolute top-4 right-4">{salesCard.icon}</div>
          <h3 className="text-lg font-semibold drop-shadow-md">{salesCard.title}</h3>
          <p className="text-4xl font-bold mt-2 drop-shadow-xl">{salesCard.value}</p>
          <p className="text-sm opacity-90 mt-1">{salesCard.desc}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.04 }}
          className={`p-6 rounded-xl text-white relative overflow-hidden ${productCard.color} ${productCard.glow}`}
        >
          <div className="absolute top-4 right-4">{productCard.icon}</div>
          <h3 className="text-lg font-semibold drop-shadow-md">{productCard.title}</h3>
          <p className="text-4xl font-bold mt-2 drop-shadow-xl">{productCard.value}</p>
          <p className="text-sm opacity-90 mt-1">{productCard.desc}</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl p-5 bg-[#0f172a] shadow-xl border border-[#1e293b] w-full"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Sales Overview</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), "Sales"]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#3b82f6" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-xl p-5 bg-[#0f172a] shadow-xl border border-[#1e293b] w-full"
        >
          <h3 className="text-lg font-semibold text-white mb-3">Product Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartProductData}>
                <defs>
                  <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "10px",
                    color: "#fff",
                  }}
                  formatter={(value) => [value, "Products"]}
                />
                <Area type="monotone" dataKey="products" stroke="#22c55e" fill="url(#productGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
