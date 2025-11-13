import React from "react";

const SearchFilter: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap items-center gap-4">
      <input
        type="text"
        placeholder="Search products..."
        className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <select className="border rounded-md px-3 py-2 text-sm text-gray-700">
        <option>All Categories</option>
        <option>Engine Parts</option>
        <option>Body Kits</option>
      </select>
      <button className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-800 transition">
        More Filters
      </button>
    </div>
  );
};

export default SearchFilter;
