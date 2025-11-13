import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, Users, Package } from "lucide-react";

const DashboardOverview: React.FC = () => {
  const chartData = [
    { name: "Week 1", sales: 4000, customers: 2400, products: 240 },
    { name: "Week 2", sales: 3000, customers: 1398, products: 221 },
    { name: "Week 3", sales: 2000, customers: 9800, products: 229 },
    { name: "Week 4", sales: 2780, customers: 3908, products: 200 },
  ];

  const cards = [
    {
      title: "Total Sales",
      value: "$120,000",
      desc: "1 month indicator",
      color: "bg-blue-600",
      glow: "shadow-[0_0_25px_rgba(37,99,235,0.6)]",
      icon: (
        <DollarSign className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
      ),
    },
    {
      title: "Customers",
      value: "1,200",
      desc: "1 month indicator",
      color: "bg-green-600",
      glow: "shadow-[0_0_25px_rgba(22,163,74,0.6)]",
      icon: (
        <Users className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
      ),
    },
    {
      title: "Products",
      value: "450",
      desc: "1 month indicator",
      color: "bg-yellow-500",
      glow: "shadow-[0_0_25px_rgba(234,179,8,0.6)]",
      icon: (
        <Package className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" />
      ),
    },
  ];

  return (
    <div className="w-full space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            whileHover={{ scale: 1.03 }}
            className={`p-5 rounded-xl text-white ${card.color} ${card.glow} relative overflow-hidden transition-transform`}
          >
          
            <div className="absolute top-4 right-4">{card.icon}</div>

            
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold drop-shadow-md"
            >
              {card.title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            >
              {card.value}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.6 }}
              className="text-sm mt-1"
            >
              {card.desc}
            </motion.p>
          </motion.div>
        ))}
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Sales Overview</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#2563eb" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Customers Overview</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="#16a34a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Products Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Products Overview</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="products" fill="#eab308" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
