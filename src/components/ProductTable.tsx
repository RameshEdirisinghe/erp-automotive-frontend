import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  const products = [
    {
      id: 1,
      name: "Engine Oil",
      category: "Lubricants",
      stock: 120,
      price: "$35",
      supplier: "AutoMax Ltd",
      date: "2025-11-01",
    },
    {
      id: 2,
      name: "Brake Pads",
      category: "Spare Parts",
      stock: 85,
      price: "$50",
      supplier: "DrivePro Supplies",
      date: "2025-10-28",
    },
    {
      id: 3,
      name: "Car Battery",
      category: "Electrical",
      stock: 45,
      price: "$120",
      supplier: "ElectroParts Co.",
      date: "2025-10-25",
    },
    {
      id: 4,
      name: "Air Filter",
      category: "Filters",
      stock: 200,
      price: "$25",
      supplier: "AutoAir Ltd",
      date: "2025-10-22",
    },
    {
      id: 5,
      name: "Coolant",
      category: "Liquids",
      stock: 150,
      price: "$30",
      supplier: "LiquidTech",
      date: "2025-10-20",
    },
    {
      id: 6,
      name: "Timing Belt",
      category: "Mechanical",
      stock: 70,
      price: "$80",
      supplier: "MechPro Auto",
      date: "2025-10-18",
    },
    {
      id: 7,
      name: "Spark Plug",
      category: "Electrical",
      stock: 300,
      price: "$10",
      supplier: "SparkTech",
      date: "2025-10-15",
    },
  ];

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(products.length / productsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Supplier</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {currentProducts.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-3 text-sm text-gray-800">{product.name}</td>
                <td className="p-3 text-sm text-gray-600">{product.category}</td>
                <td className="p-3 text-sm text-gray-600">{product.stock}</td>
                <td className="p-3 text-sm text-gray-600">{product.price}</td>
                <td className="p-3 text-sm text-gray-600">{product.supplier}</td>
                <td className="p-3 text-sm text-gray-600">{product.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
            currentPage === 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-white bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          <ChevronLeft size={18} />
          Prev
        </button>

        <span className="text-gray-700 text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
            currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed"
              : "text-white bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProductTable;
