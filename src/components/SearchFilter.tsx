import React from "react";

const SearchFilter: React.FC = () => {
  return (
    <div
      className="
        w-full 
        rounded-xl 
        bg-[#0f172a] 
        shadow-lg 
        p-5 
        flex flex-wrap items-center gap-4
      "
    >
      <input
        type="text"
        placeholder="Search products..."
        className="
          flex-1 
          bg-[#1e293b] 
          border border-[#334155] 
          rounded-full 
          px-4 py-2 
          text-sm text-gray-200 
          placeholder:text-gray-400
          focus:outline-none 
          focus:ring-2 focus:ring-blue-500/50 
          transition
        "
      />

      <select
        className="
          bg-[#1e293b] 
          border border-[#334155] 
          rounded-full 
          px-4 py-2 
          text-sm 
          text-gray-200 
          focus:outline-none 
          focus:ring-2 focus:ring-blue-500/50
        "
      >
        <option>All Categories</option>
        <option>Engine Parts</option>
        <option>Body Kits</option>
      </select>

      <button
        className="
          bg-blue-600 
          text-white 
          px-5 py-2 
          rounded-full 
          text-sm 
          font-medium
          hover:bg-blue-500 
          transition 
          shadow-md 
          hover:shadow-blue-500/30
        "
      >
        More Filters
      </button>
    </div>
  );
};

export default SearchFilter;
